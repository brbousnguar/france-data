/**
 * France National Demographics Data
 * Live data from INSEE Melodi API
 */

import { getCached, setCached } from './cache'

const MELODI_BASE = 'https://api.insee.fr/melodi/data'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export interface FrancePopulationPoint {
  year: number
  date: string
  population: number // in millions
}

export interface FranceAgeGroupShares {
  year: number
  date: string
  '0-24': number   // percentage
  '25-59': number  // percentage
  '60-74': number  // percentage
  '75+': number    // percentage
}

export interface FranceNationalityData {
  year: number
  date: string
  totalPopulation: number
  foreigners: number
  foreignersPercent: number
  immigrants: number
  immigrantsPercent: number
}

export interface FranceNationalityBreakdown {
  year: number
  nationality: string
  population: number
  percentOfForeigners: number
  percentOfTotal: number
}

interface MelodiObservation {
  dimensions: Record<string, string>
  measures: Record<string, { value: number | null } | null>
}

interface MelodiResponse {
  observations: MelodiObservation[]
}

function extractMeasureValue(obs: MelodiObservation): number | null {
  for (const key of Object.keys(obs.measures)) {
    const measure = obs.measures[key]
    if (measure && measure.value !== null && measure.value !== undefined) {
      return measure.value
    }
  }
  return null
}

async function fetchMelodi(dataset: string, params: string): Promise<MelodiObservation[]> {
  const url = `${MELODI_BASE}/${dataset}?${params}`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`INSEE Melodi API error (${dataset}): ${response.status} ${response.statusText}`)
  }
  const json: MelodiResponse = await response.json()
  return json.observations || []
}

/**
 * France population time series from INSEE Melodi (DS_ESTIMATION_POPULATION)
 * Returns population in millions
 */
export async function getFrancePopulationTimeseries(): Promise<FrancePopulationPoint[]> {
  const cacheKey = 'france-population-timeseries'
  const cached = getCached<FrancePopulationPoint[]>(cacheKey, CACHE_TTL)
  if (cached) return cached

  const params = 'GEO=2026-FRANCE-F&SEX=_T&AGE=_T&EP_MEASURE=POP_JAN_1ST&FREQ=A&startPeriod=2015&maxResult=20'
  const observations = await fetchMelodi('DS_ESTIMATION_POPULATION', params)

  const result: FrancePopulationPoint[] = []
  for (const obs of observations) {
    const timePeriod = obs.dimensions['TIME_PERIOD']
    const value = extractMeasureValue(obs)
    if (timePeriod && value !== null) {
      const year = parseInt(timePeriod)
      result.push({
        year,
        date: `${year}-01-01`,
        population: value / 1_000_000,
      })
    }
  }

  result.sort((a, b) => a.year - b.year)
  setCached(cacheKey, result)
  return result
}

/**
 * France age group shares timeseries from INSEE Melodi
 * Groups: 0-24, 25-59, 60-74 (derived as 60+ minus 75+), 75+
 */
export async function getFranceAgeGroupSharesTimeseries(): Promise<FranceAgeGroupShares[]> {
  const cacheKey = 'france-age-group-shares-timeseries'
  const cached = getCached<FranceAgeGroupShares[]>(cacheKey, CACHE_TTL)
  if (cached) return cached

  const baseParams = 'GEO=2026-FRANCE-F&SEX=_T&EP_MEASURE=PT_IN_POP&FREQ=A&startPeriod=2015&maxResult=20'

  const [obsYoung, obsWorking, obsSeniors, obsElderly] = await Promise.all([
    fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y_LE24`),
    fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y25T59`),
    fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y_GE60`),
    fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y_GE75`),
  ])

  // Index by year
  function indexByYear(observations: MelodiObservation[]): Map<number, number> {
    const map = new Map<number, number>()
    for (const obs of observations) {
      const timePeriod = obs.dimensions['TIME_PERIOD']
      const value = extractMeasureValue(obs)
      if (timePeriod && value !== null) {
        map.set(parseInt(timePeriod), value)
      }
    }
    return map
  }

  const youngMap = indexByYear(obsYoung)
  const workingMap = indexByYear(obsWorking)
  const seniorsMap = indexByYear(obsSeniors)
  const elderlyMap = indexByYear(obsElderly)

  // Collect all years present across all groups
  const years = new Set<number>([
    ...youngMap.keys(),
    ...workingMap.keys(),
    ...seniorsMap.keys(),
    ...elderlyMap.keys(),
  ])

  const result: FranceAgeGroupShares[] = []
  for (const year of years) {
    const young = youngMap.get(year) ?? null
    const working = workingMap.get(year) ?? null
    const seniorsPlus = seniorsMap.get(year) ?? null
    const elderlyPlus = elderlyMap.get(year) ?? null

    if (young === null || working === null || seniorsPlus === null || elderlyPlus === null) {
      continue
    }

    result.push({
      year,
      date: `${year}-01-01`,
      '0-24': young,
      '25-59': working,
      '60-74': seniorsPlus - elderlyPlus,
      '75+': elderlyPlus,
    })
  }

  result.sort((a, b) => a.year - b.year)
  setCached(cacheKey, result)
  return result
}

/**
 * Get latest France population (in millions)
 */
export async function getLatestFrancePopulation(): Promise<number> {
  const data = await getFrancePopulationTimeseries()
  return data[data.length - 1].population
}

/**
 * Calculate population change over the period
 */
export async function calculateFrancePopulationChange(): Promise<{ absolute: number; percent: number }> {
  const data = await getFrancePopulationTimeseries()
  const oldest = data[0].population
  const latest = data[data.length - 1].population
  const absolute = latest - oldest
  const percent = (absolute / oldest) * 100
  return { absolute, percent }
}

/**
 * Calculate median age approximation
 * France's median age is around 41-42 years as of 2025 (static demographic fact)
 */
export function calculateFranceMedianAge(): number {
  return 41.8
}

/**
 * Foreign population timeseries - no live API available for census data
 */
export function getFranceForeignPopulationTimeseries(): FranceNationalityData[] {
  return []
}

/**
 * Top nationalities - no live API available
 */
export function getFranceTopNationalities(): FranceNationalityBreakdown[] {
  return []
}

/**
 * Get latest foreign population stats - no live API available
 */
export function getLatestFranceForeignStats(): FranceNationalityData | null {
  return null
}
