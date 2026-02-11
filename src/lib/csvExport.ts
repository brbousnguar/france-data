/**
 * Utility to export data as CSV and trigger download
 */

import { formatDateMonthYearFR } from './format'

export interface CSVExportData {
  headers: string[]
  rows: (string | number)[][]
}

/**
 * Convert data to CSV format
 */
export function dataToCSV(data: CSVExportData): string {
  const csvRows: string[] = []
  
  // Add headers
  csvRows.push(data.headers.join(','))
  
  // Add data rows
  for (const row of data.rows) {
    const escapedRow = row.map(cell => {
      // Convert to string and escape quotes
      const cellStr = String(cell)
      // If cell contains comma, newline, or quote, wrap in quotes and escape quotes
      if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    })
    csvRows.push(escapedRow.join(','))
  }
  
  return csvRows.join('\n')
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for proper Excel UTF-8 encoding
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Generate filename with current date
 */
export function generateFilename(baseName: string): string {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
  return `${baseName}_${dateStr}.csv`
}

/**
 * Helper to export timeseries data
 */
export function exportTimeseriesCSV(
  data: Array<{ date: string; [key: string]: string | number }>,
  filename: string
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }
  
  // Extract headers from first object
  const headers = Object.keys(data[0])
  
  // Extract rows
  const rows = data.map(item => headers.map(header => item[header]))
  
  const csvContent = dataToCSV({ headers, rows })
  downloadCSV(csvContent, generateFilename(filename))
}
