/**
 * Lightweight CSV Parser
 * 
 * Parses CSV data without external dependencies.
 * Handles comma and semicolon delimiters, quoted fields, and basic type conversion.
 */

// ==================== Types ====================

export type CSVRow = Record<string, string | number>

export type CSVParseOptions = {
  delimiter?: ',' | ';' | 'auto' // Auto-detect if not specified
  hasHeader?: boolean // Default: true
  skipEmptyLines?: boolean // Default: true
  trimValues?: boolean // Default: true
}

export type CSVParseResult = {
  headers: string[]
  rows: CSVRow[]
  rowCount: number
}

// ==================== Helper Functions ====================

/**
 * Detect delimiter by checking first few lines
 */
function detectDelimiter(csvText: string): ',' | ';' {
  const firstLines = csvText.split('\n').slice(0, 5).join('\n')
  
  const commaCount = (firstLines.match(/,/g) || []).length
  const semicolonCount = (firstLines.match(/;/g) || []).length
  
  return semicolonCount > commaCount ? ';' : ','
}

/**
 * Parse a single CSV line handling quoted fields
 * @param line CSV line to parse
 * @param delimiter Delimiter character
 * @returns Array of field values
 */
function parseLine(line: string, delimiter: ',' | ';'): string[] {
  const fields: string[] = []
  let currentField = ''
  let insideQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes
      }
    } else if (char === delimiter && !insideQuotes) {
      // End of field
      fields.push(currentField)
      currentField = ''
    } else {
      currentField += char
    }
  }
  
  // Add last field
  fields.push(currentField)
  
  return fields
}

/**
 * Try to parse value as number, otherwise return as string
 */
function parseValue(value: string, trim = true): string | number {
  const trimmed = trim ? value.trim() : value
  
  // Empty string
  if (trimmed === '') return ''
  
  // Try to parse as number
  const num = Number(trimmed.replace(/\s/g, '').replace(',', '.'))
  if (!isNaN(num)) return num
  
  return trimmed
}

/**
 * Normalize header names (lowercase, replace spaces with underscores)
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ùû]/g, 'u')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^\w_]/g, '')
}

// ==================== Main Parser ====================

/**
 * Parse CSV text into structured data
 * @param csvText CSV content as string
 * @param options Parsing options
 * @returns Parsed data with headers and rows
 */
export function parseCSV(
  csvText: string,
  options: CSVParseOptions = {}
): CSVParseResult {
  const {
    delimiter = 'auto',
    hasHeader = true,
    skipEmptyLines = true,
    trimValues = true
  } = options
  
  // Detect delimiter if auto
  const actualDelimiter = delimiter === 'auto'
    ? detectDelimiter(csvText)
    : delimiter
  
  console.log(`Parsing CSV with delimiter: "${actualDelimiter}"`)
  
  // Split into lines
  let lines = csvText.split(/\r?\n/)
  
  // Skip empty lines if requested
  if (skipEmptyLines) {
    lines = lines.filter(line => line.trim().length > 0)
  }
  
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0 }
  }
  
  // Parse header
  let headers: string[] = []
  let dataStartIndex = 0
  
  if (hasHeader) {
    const headerLine = lines[0]
    const rawHeaders = parseLine(headerLine, actualDelimiter)
    headers = rawHeaders.map(h => normalizeHeader(h))
    dataStartIndex = 1
  } else {
    // Generate generic headers (col_0, col_1, etc.)
    const firstLine = parseLine(lines[0], actualDelimiter)
    headers = firstLine.map((_, i) => `col_${i}`)
    dataStartIndex = 0
  }
  
  console.log(`CSV headers: ${headers.join(', ')}`)
  
  // Parse data rows
  const rows: CSVRow[] = []
  
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    const values = parseLine(line, actualDelimiter)
    
    // Skip if wrong number of columns (malformed row)
    if (values.length !== headers.length) {
      console.warn(`Skipping malformed row ${i + 1}: expected ${headers.length} columns, got ${values.length}`)
      continue
    }
    
    // Build row object
    const row: CSVRow = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = parseValue(values[j], trimValues)
    }
    
    rows.push(row)
  }
  
  console.log(`Parsed ${rows.length} rows`)
  
  return {
    headers,
    rows,
    rowCount: rows.length
  }
}

/**
 * Fetch and parse CSV from URL
 * @param url URL to CSV file
 * @param options Parsing options
 * @returns Parsed CSV data
 */
export async function fetchAndParseCSV(
  url: string,
  options: CSVParseOptions = {}
): Promise<CSVParseResult> {
  try {
    console.log(`Fetching CSV from: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    console.log(`Fetched ${csvText.length} bytes`)
    
    return parseCSV(csvText, options)
  } catch (error) {
    console.error('Error fetching/parsing CSV:', error)
    throw new Error(`Failed to fetch CSV from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Helper: Extract column as array
 */
export function extractColumn<T = string | number>(
  data: CSVParseResult,
  columnName: string
): T[] {
  const normalizedName = normalizeHeader(columnName)
  return data.rows.map(row => row[normalizedName] as T)
}

/**
 * Helper: Filter rows by condition
 */
export function filterRows(
  data: CSVParseResult,
  predicate: (row: CSVRow) => boolean
): CSVRow[] {
  return data.rows.filter(predicate)
}

/**
 * Helper: Find column by partial name match
 */
export function findColumn(data: CSVParseResult, partialName: string): string | null {
  const normalized = normalizeHeader(partialName)
  return data.headers.find(h => h.includes(normalized)) || null
}
