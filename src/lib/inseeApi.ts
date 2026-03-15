/**
 * French Public Data API Client
 *
 * Fetches live data from official French public APIs:
 * - INSEE Melodi API: https://api.insee.fr/melodi/data/
 * - geo.api.gouv.fr: https://geo.api.gouv.fr/communes/
 */

const MELODI_BASE = 'https://api.insee.fr/melodi/data'

interface MelodiObservation {
  dimensions: Record<string, string>
  measures: Record<string, { value: number | null } | null>
  attributes?: Record<string, unknown>
}

interface MelodiResponse {
  observations: MelodiObservation[]
  paging?: { next?: string }
}

/**
 * Extract the first non-null measure value from a Melodi observation
 */
function extractMeasureValue(obs: MelodiObservation): number | null {
  for (const key of Object.keys(obs.measures)) {
    const measure = obs.measures[key]
    if (measure && measure.value !== null && measure.value !== undefined) {
      return measure.value
    }
  }
  return null
}

/**
 * Fetch inflation data from INSEE Melodi API (DS_IPC_PRINC)
 * Year-over-year CPI, all items, monthly, France
 */
export async function fetchINSEEInflation(): Promise<Array<{ date: string; value: number }>> {
  const params = 'IND_TYPE=YOY&COICOP_2018=00&PRODUCT_GROUP=_Z&FREQ=M&GEO=2025-FRANCE-FM&startPeriod=2022-01&maxResult=100'
  const url = `${MELODI_BASE}/DS_IPC_PRINC?${params}`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`INSEE Melodi inflation API error: ${response.status} ${response.statusText}`)
  }

  const json: MelodiResponse = await response.json()

  const result: Array<{ date: string; value: number }> = []

  for (const obs of json.observations) {
    const timePeriod = obs.dimensions['TIME_PERIOD']
    const value = extractMeasureValue(obs)
    if (timePeriod && value !== null) {
      result.push({ date: timePeriod, value })
    }
  }

  // Sort chronologically
  result.sort((a, b) => a.date.localeCompare(b.date))

  return result
}

/**
 * Fetch population data for a French commune from geo.api.gouv.fr
 * Returns current year population only (no time series available from this API)
 */
export async function fetchINSEEPopulation(codeCommune: string): Promise<Array<{ year: number; population: number }>> {
  const url = `https://geo.api.gouv.fr/communes/${codeCommune}?fields=population`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`geo.api.gouv.fr error for commune ${codeCommune}: ${response.status} ${response.statusText}`)
  }

  const commune: { nom?: string; code?: string; population?: number } = await response.json()

  if (!commune.population) {
    return []
  }

  const currentYear = new Date().getFullYear()
  return [{ year: currentYear, population: commune.population }]
}

/**
 * Get last update timestamp
 * INSEE publishes monthly data around the 15th
 */
export async function getINSEELastUpdate(): Promise<Date> {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - 1, 15)
}
