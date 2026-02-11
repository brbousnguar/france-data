/**
 * Nantes Demography Data Layer
 * 
 * Provides population and age structure data with adapter pattern.
 * Falls back to mock data if real API is unavailable.
 */

import { z } from 'zod'
import { fetchJson } from './api'
import { getCached, setCached } from './cache'
import { CONFIG } from './config'
import { fetchAndParseCSV, extractColumn, findColumn } from './csvParser'

// ==================== Types ====================

export type PopulationPoint = {
  date: string // YYYY format for years
  value: number
}

export type AgeGroupShares = {
  date: string
  g0_14: number    // 0-14 years
  g15_29: number   // 15-29 years
  g30_44: number   // 30-44 years
  g45_59: number   // 45-59 years
  g60plus: number  // 60+ years
}

export type DemographicSnapshot = {
  date: string
  population: number
  medianAge?: number
  ageGroups?: {
    g0_14: number
    g15_29: number
    g30_44: number
    g45_59: number
    g60plus: number
  }
}

// ==================== Validation Schemas ====================

const PopulationPointSchema = z.object({
  date: z.string(),
  value: z.number()
})

const AgeGroupSharesSchema = z.object({
  date: z.string(),
  g0_14: z.number(),
  g15_29: z.number(),
  g30_44: z.number(),
  g45_59: z.number(),
  g60plus: z.number()
})

const SnapshotSchema = z.object({
  date: z.string(),
  population: z.number(),
  medianAge: z.number().optional(),
  ageGroups: z.object({
    g0_14: z.number(),
    g15_29: z.number(),
    g30_44: z.number(),
    g45_59: z.number(),
    g60plus: z.number()
  }).optional()
})

// ==================== Mock Data Generators ====================

/**
 * Generate realistic mock population data for Nantes
 * Base: ~320,000 in 2026 with steady growth
 */
function generateMockPopulationTimeseries(startYear = 2016, years = 11): PopulationPoint[] {
  const basePopulation = 310_000
  const yearlyGrowth = 3_500 // ~1.1% annual growth
  
  return Array.from({ length: years }, (_, i) => ({
    date: String(startYear + i),
    value: Math.round(basePopulation + i * yearlyGrowth + Math.random() * 1000)
  }))
}

/**
 * Generate realistic age group distribution over time
 * Simulates aging population (declining youth, increasing 60+)
 */
function generateMockAgeGroupShares(startYear = 2016, years = 11): AgeGroupShares[] {
  return Array.from({ length: years }, (_, i) => {
    const year = startYear + i
    const agingFactor = i / years // 0 to 1 over the period
    
    return {
      date: String(year),
      g0_14: Math.round(16 - agingFactor * 1.5), // Declining from 16% to 14.5%
      g15_29: Math.round(22 - agingFactor * 1), // Declining from 22% to 21%
      g30_44: Math.round(20 + agingFactor * 0.5), // Slight increase
      g45_59: Math.round(19 + agingFactor * 0.5), // Slight increase
      g60plus: Math.round(23 + agingFactor * 1.5) // Increasing from 23% to 24.5%
    }
  })
}

/**
 * Generate latest snapshot with detailed demographics
 */
function generateMockSnapshot(year = 2026): DemographicSnapshot {
  const population = 323_000
  
  return {
    date: String(year),
    population,
    medianAge: 41.2,
    ageGroups: {
      g0_14: 15,
      g15_29: 21,
      g30_44: 20,
      g45_59: 20,
      g60plus: 24
    }
  }
}

// ==================== Data Configuration ====================

/**
 * Configuration for data sources
 * Uses CONFIG from config.ts for resource URLs
 */
const DATA_CONFIG = {
  // Cache TTLs (24 hours for demographic data)
  cacheTtl: CONFIG.CACHE_TTL_HOURS * 60 * 60 * 1000,
  
  // Use mock data fallback
  useMockFallback: CONFIG.USE_MOCK_FALLBACK
}

// ==================== Public API Functions ====================

/**
 * Get population timeseries data
 * @returns Array of population data points by year
 */
export async function getPopulationTimeseries(): Promise<PopulationPoint[]> {
  const cacheKey = 'nantes-population-timeseries'
  
  // Check cache
  const cached = getCached<PopulationPoint[]>(cacheKey, DATA_CONFIG.cacheTtl)
  if (cached) {
    console.log('Cache hit:', cacheKey)
    return cached
  }
  
  console.log('Cache miss:', cacheKey)
  
  let data: PopulationPoint[]
  
  // Try to fetch from real resource if configured
  const resourceUrl = CONFIG.getResourceUrl('population')
  
  if (resourceUrl) {
    try {
      console.log('Fetching from resource:', resourceUrl)
      
      // Fetch and parse CSV
      const csvData = await fetchAndParseCSV(resourceUrl)
      
      // Find year and population columns (flexible column names)
      const yearCol = findColumn(csvData, 'year') || findColumn(csvData, 'annee') || csvData.headers[0]
      const popCol = findColumn(csvData, 'population') || findColumn(csvData, 'pop') || csvData.headers[1]
      
      if (!yearCol || !popCol) {
        throw new Error('Could not find year and population columns in CSV')
      }
      
      console.log(`Using columns: ${yearCol}, ${popCol}`)
      
      // Transform to our format
      data = csvData.rows.map(row => ({
        date: String(row[yearCol]),
        value: Number(row[popCol])
      }))
      
      // Validate
      data = z.array(PopulationPointSchema).parse(data)
      console.log('Real data fetch successful')
    } catch (error) {
      if (DATA_CONFIG.useMockFallback) {
        console.warn('Resource fetch failed, using mock data:', error)
        data = generateMockPopulationTimeseries()
      } else {
        throw error
      }
    }
  } else {
    console.log('No resource URL configured, using mock data')
    data = generateMockPopulationTimeseries()
  }
  
  // Cache and return
  setCached(cacheKey, data)
  return data
}

/**
 * Get age group distribution over time
 * @returns Array of age group percentages by year
 */
export async function getAgeGroupSharesTimeseries(): Promise<AgeGroupShares[]> {
  const cacheKey = 'nantes-age-groups-timeseries'
  
  // Check cache
  const cached = getCached<AgeGroupShares[]>(cacheKey, DATA_CONFIG.cacheTtl)
  if (cached) {
    console.log('Cache hit:', cacheKey)
    return cached
  }
  
  console.log('Cache miss:', cacheKey)
  
  let data: AgeGroupShares[]
  
  // Try to fetch from real resource if configured
  const resourceUrl = CONFIG.getResourceUrl('ageGroups')
  
  if (resourceUrl) {
    try {
      console.log('Fetching from resource:', resourceUrl)
      
      // Fetch and parse CSV
      const csvData = await fetchAndParseCSV(resourceUrl)
      
      // Find columns (flexible naming)
      const yearCol = findColumn(csvData, 'year') || findColumn(csvData, 'annee') || csvData.headers[0]
      const g0_14Col = findColumn(csvData, '0_14') || findColumn(csvData, '0-14')
      const g15_29Col = findColumn(csvData, '15_29') || findColumn(csvData, '15-29')
      const g30_44Col = findColumn(csvData, '30_44') || findColumn(csvData, '30-44')
      const g45_59Col = findColumn(csvData, '45_59') || findColumn(csvData, '45-59')
      const g60plusCol = findColumn(csvData, '60') || findColumn(csvData, '60+')
      
      if (!yearCol || !g0_14Col || !g15_29Col || !g30_44Col || !g45_59Col || !g60plusCol) {
        throw new Error('Could not find all required age group columns in CSV')
      }
      
      // Transform to our format
      data = csvData.rows.map(row => ({
        date: String(row[yearCol]),
        g0_14: Number(row[g0_14Col!]),
        g15_29: Number(row[g15_29Col!]),
        g30_44: Number(row[g30_44Col!]),
        g45_59: Number(row[g45_59Col!]),
        g60plus: Number(row[g60plusCol!])
      }))
      
      // Validate
      data = z.array(AgeGroupSharesSchema).parse(data)
      console.log('Real data fetch successful')
    } catch (error) {
      if (DATA_CONFIG.useMockFallback) {
        console.warn('Resource fetch failed, using mock data:', error)
        data = generateMockAgeGroupShares()
      } else {
        throw error
      }
    }
  } else {
    console.log('No resource URL configured, using mock data')
    data = generateMockAgeGroupShares()
  }
  
  // Cache and return
  setCached(cacheKey, data)
  return data
}

/**
 * Get latest demographic snapshot
 * @returns Most recent population and age structure data
 */
export async function getLatestSnapshot(): Promise<DemographicSnapshot> {
  const cacheKey = 'nantes-demographic-snapshot'
  
  // Check cache
  const cached = getCached<DemographicSnapshot>(cacheKey, DATA_CONFIG.cacheTtl)
  if (cached) {
    console.log('Cache hit:', cacheKey)
    return cached
  }
  
  console.log('Cache miss:', cacheKey)
  
  let data: DemographicSnapshot
  
  // For snapshot, we derive from existing timeseries data
  // (most APIs don't have a dedicated snapshot endpoint)
  try {
    const [popData, ageData] = await Promise.all([
      getPopulationTimeseries(),
      getAgeGroupSharesTimeseries()
    ])
    
    if (popData.length === 0) {
      throw new Error('No population data available')
    }
    
    const latest = popData[popData.length - 1]
    const latestAge = ageData.length > 0 ? ageData[ageData.length - 1] : null
    
    data = {
      date: latest.date,
      population: latest.value,
      medianAge: 41.2, // TODO: Calculate from age distribution if available
      ageGroups: latestAge ? {
        g0_14: latestAge.g0_14,
        g15_29: latestAge.g15_29,
        g30_44: latestAge.g30_44,
        g45_59: latestAge.g45_59,
        g60plus: latestAge.g60plus
      } : undefined
    }
    
    // Validate
    data = SnapshotSchema.parse(data)
    console.log('Snapshot derived from timeseries data')
  } catch (error) {
    if (DATA_CONFIG.useMockFallback) {
      console.warn('Snapshot derivation failed, using mock data:', error)
      data = generateMockSnapshot()
    } else {
      throw error
    }
  }
  
  // Cache and return
  setCached(cacheKey, data)
  return data
}

// ==================== Utility Functions ====================

/**
 * Calculate 10-year population change from timeseries
 */
export function calculatePopulationChange(timeseries: PopulationPoint[]): {
  absolute: number
  percent: number
} | null {
  if (timeseries.length < 2) return null
  
  const earliest = timeseries[0].value
  const latest = timeseries[timeseries.length - 1].value
  const absolute = latest - earliest
  const percent = (absolute / earliest) * 100
  
  return { absolute, percent }
}

/**
 * Get latest population value from timeseries
 */
export function getLatestPopulation(timeseries: PopulationPoint[]): number | null {
  if (timeseries.length === 0) return null
  return timeseries[timeseries.length - 1].value
}
