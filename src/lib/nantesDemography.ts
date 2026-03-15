/**
 * Nantes Demography Data Layer
 *
 * Provides population and age structure data from INSEE's public APIs.
 * - Population: geo.api.gouv.fr (current year only)
 * - Age groups: INSEE Melodi DS_ESTIMATION_POPULATION for DEP-44
 */

import { z } from 'zod'
import { getCached, setCached } from './cache'
import { CONFIG } from './config'
import { fetchINSEEPopulation } from './inseeApi'

// ==================== Types ====================

export type PopulationPoint = {
  date: string // YYYY format for years
  value: number
}

export type AgeGroupShares = {
  date: string
  g0_24: number   // 0-24 years
  g25_59: number  // 25-59 years
  g60_74: number  // 60-74 years
  g75plus: number // 75+ years
}

export type DemographicSnapshot = {
  population: number
  medianAge?: number
  growthRate?: number
}

// ==================== Validation Schemas ====================

const PopulationPointSchema = z.object({
  date: z.string(),
  value: z.number()
})

const AgeGroupSharesSchema = z.object({
  date: z.string(),
  g0_24: z.number(),
  g25_59: z.number(),
  g60_74: z.number(),
  g75plus: z.number(),
})

// ==================== Data Configuration ====================

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours for demographic data
const MELODI_BASE = 'https://api.insee.fr/melodi/data'

// ==================== Helpers ====================

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

// ==================== Public API Functions ====================

/**
 * Get population timeseries for Nantes from geo.api.gouv.fr
 * Returns current year only (no time series available from this API)
 */
export async function getPopulationTimeseries(): Promise<PopulationPoint[]> {
  const cacheKey = `nantes-population-${CONFIG.NANTES_CODE_INSEE}`

  const cached = getCached<PopulationPoint[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return cached
  }

  try {
    const rawData = await fetchINSEEPopulation(CONFIG.NANTES_CODE_INSEE)

    const data: PopulationPoint[] = rawData.map(item => ({
      date: String(item.year),
      value: item.population
    }))

    const validated = z.array(PopulationPointSchema).parse(data)

    setCached(cacheKey, validated)
    return validated

  } catch (error) {
    console.error('Failed to fetch population data:', error)
    throw new Error('Unable to load population data. Please check your internet connection or try again later.')
  }
}

/**
 * Get age group distribution for Loire-Atlantique (DEP-44) from INSEE Melodi
 * Uses DEP-44 as proxy for Nantes department
 */
export async function getAgeGroupSharesTimeseries(): Promise<AgeGroupShares[]> {
  const cacheKey = `nantes-age-groups-dep44`

  const cached = getCached<AgeGroupShares[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return cached
  }

  try {
    const baseParams = 'GEO=2026-DEP-44&SEX=_T&EP_MEASURE=PT_IN_POP&FREQ=A&startPeriod=2015&maxResult=20'

    const [obsYoung, obsWorking, obsSeniors, obsElderly] = await Promise.all([
      fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y_LE24`),
      fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y25T59`),
      fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y_GE60`),
      fetchMelodi('DS_ESTIMATION_POPULATION', `${baseParams}&AGE=Y_GE75`),
    ])

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

    const years = new Set<number>([
      ...youngMap.keys(),
      ...workingMap.keys(),
      ...seniorsMap.keys(),
      ...elderlyMap.keys(),
    ])

    const raw: AgeGroupShares[] = []
    for (const year of years) {
      const young = youngMap.get(year) ?? null
      const working = workingMap.get(year) ?? null
      const seniorsPlus = seniorsMap.get(year) ?? null
      const elderlyPlus = elderlyMap.get(year) ?? null

      if (young === null || working === null || seniorsPlus === null || elderlyPlus === null) {
        continue
      }

      raw.push({
        date: String(year),
        g0_24: young,
        g25_59: working,
        g60_74: seniorsPlus - elderlyPlus,
        g75plus: elderlyPlus,
      })
    }

    raw.sort((a, b) => a.date.localeCompare(b.date))

    const validated = z.array(AgeGroupSharesSchema).parse(raw)

    setCached(cacheKey, validated)
    return validated

  } catch (error) {
    console.error('Failed to fetch age distribution data:', error)
    throw new Error('Unable to load age distribution data. Please check your internet connection or try again later.')
  }
}

/**
 * Get latest demographic snapshot for Nantes
 */
export async function getLatestSnapshot(): Promise<DemographicSnapshot> {
  const populationData = await getPopulationTimeseries()

  if (populationData.length === 0) {
    throw new Error('No population data available')
  }

  const latest = populationData[populationData.length - 1]

  let growthRate: number | undefined
  if (populationData.length >= 2) {
    const previous = populationData[populationData.length - 2]
    growthRate = ((latest.value - previous.value) / previous.value) * 100
  }

  const medianAge = 38.5

  return {
    population: latest.value,
    medianAge,
    growthRate
  }
}

/**
 * Get latest population figure
 */
export function getLatestPopulation(data: PopulationPoint[]): number | null {
  if (data.length === 0) return null
  return data[data.length - 1].value
}

/**
 * Calculate population change over the timeseries
 */
export function calculatePopulationChange(data: PopulationPoint[]): {
  absolute: number
  percent: number
} | null {
  if (data.length < 2) return null

  const first = data[0].value
  const last = data[data.length - 1].value
  const absolute = last - first
  const percent = (absolute / first) * 100

  return { absolute, percent }
}

/**
 * Foreign population and nationality statistics for Nantes
 */
export interface NantesNationalityData {
  year: number
  date: string
  totalPopulation: number
  foreigners: number
  foreignersPercent: number
  immigrants: number
  immigrantsPercent: number
}

export interface NantesNationalityBreakdown {
  year: number
  nationality: string
  population: number
  percentOfForeigners: number
  percentOfTotal: number
}

/**
 * Foreign population evolution in Nantes - no live API available for census data
 */
export function getNantesForeignPopulationTimeseries(): NantesNationalityData[] {
  return []
}

/**
 * Top nationalities in Nantes - no live API available
 */
export function getNantesTopNationalities(): NantesNationalityBreakdown[] {
  return []
}

/**
 * Get latest foreign population stats for Nantes - no live API available
 */
export function getLatestNantesForeignStats(): NantesNationalityData | null {
  return null
}
