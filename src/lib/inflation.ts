/**
 * Inflation Data Layer
 * 
 * Provides official inflation (IPC) data from INSEE's public API
 * Real-time data only - no mock data
 */

import { z } from 'zod'
import { getCached, setCached } from './cache'
import { CONFIG } from './config'
import { fetchINSEEInflation } from './inseeApi'

// ==================== Types ====================

export type InflationPoint = {
  date: string // YYYY-MM format for months
  value: number // Inflation rate as percentage (e.g., 2.5 for 2.5%)
}

export type InflationTimeseries = InflationPoint[]

export type InflationKPIs = {
  latestYoY: number // Latest year-over-year inflation
  avg12Months: number // Average inflation over last 12 months
  peak10Years: number // Peak inflation in last 10 years
  peakDate?: string // When peak occurred
}

export type FeltInflationPoint = {
  date: string
  official: number // Official inflation
  felt: number // Felt inflation proxy
}

// ==================== Validation Schemas ====================

const InflationPointSchema = z.object({
  date: z.string(),
  value: z.number()
})

// ==================== Data Configuration ====================

const DATA_CONFIG = {
  // Cache TTL (15 minutes for real-time data)
  cacheTtl: 15 * 60 * 1000,
}

// ==================== Utility Functions ====================

/**
 * Compute rolling average over specified window
 * @param series Inflation timeseries
 * @param windowMonths Number of months for rolling window
 */
export function computeRollingAverage(
  series: InflationPoint[],
  windowMonths: number
): InflationPoint[] {
  const result: InflationPoint[] = []
  
  for (let i = 0; i < series.length; i++) {
    const startIdx = Math.max(0, i - windowMonths + 1)
    const window = series.slice(startIdx, i + 1)
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length
    
    result.push({
      date: series[i].date,
      value: Math.round(avg * 10) / 10
    })
  }
  
  return result
}

/**
 * Compute acceleration (rate of change) of inflation
 * Used to detect inflation shocks
 */
function computeInflationAcceleration(series: InflationPoint[]): number[] {
  const acceleration: number[] = [0] // First point has no acceleration
  
  for (let i = 1; i < series.length; i++) {
    const change = series[i].value - series[i - 1].value
    acceleration.push(change)
  }
  
  return acceleration
}

/**
 * Compute "Felt Inflation" proxy
 * Formula: felt = weighted_current + weighted_memory + shock_factor
 * 
 * Rationale:
 * - Current inflation has 60% weight
 * - 6-month memory has 40% weight (people remember recent price changes)
 * - Shock factor amplifies felt inflation when prices rise quickly
 * 
 * This is a playful indicator, not an official metric!
 */
export function computeFeltInflationProxy(series: InflationPoint[]): FeltInflationPoint[] {
  const rolling6m = computeRollingAverage(series, 6)
  const acceleration = computeInflationAcceleration(series)
  
  return series.map((point, idx) => {
    const current = point.value
    const memory = rolling6m[idx].value
    const accel = acceleration[idx]
    
    // Shock factor: positive acceleration amplifies felt inflation
    // (negative acceleration doesn't reduce felt inflation as much)
    const shockFactor = accel > 0 ? accel * 0.3 : accel * 0.1
    
    // Weighted sum with shock factor
    let felt = 0.6 * current + 0.4 * memory + shockFactor
    
    // Felt inflation is typically higher than official (pessimism bias)
    felt = felt * 1.1
    
    // Clamp to reasonable range
    felt = Math.max(0, Math.min(felt, 15))
    felt = Math.round(felt * 10) / 10
    
    return {
      date: point.date,
      official: current,
      felt
    }
  })
}

/**
 * Calculate KPIs from inflation timeseries
 */
export function getKPIs(series: InflationPoint[]): InflationKPIs {
  if (series.length === 0) {
    return {
      latestYoY: 0,
      avg12Months: 0,
      peak10Years: 0
    }
  }
  
  // Latest YoY inflation
  const latestYoY = series[series.length - 1].value
  
  // 12-month average (or all data if less than 12 months)
  const last12 = series.slice(-12)
  const avg12Months = last12.reduce((sum, p) => sum + p.value, 0) / last12.length
  
  // Peak in last 10 years
  const peak = Math.max(...series.map(p => p.value))
  const peakPoint = series.find(p => p.value === peak)
  
  return {
    latestYoY: Math.round(latestYoY * 10) / 10,
    avg12Months: Math.round(avg12Months * 10) / 10,
    peak10Years: Math.round(peak * 10) / 10,
    peakDate: peakPoint?.date
  }
}

/**
 * Parse date string (YYYY-MM) to Date object
 */
function parseMonthDate(dateStr: string): Date {
  const [year, month] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

/**
 * Filter timeseries to last N months
 */
export function filterLastMonths(series: InflationPoint[], months: number): InflationPoint[] {
  return series.slice(-months)
}

/**
 * Get year-over-year comparison
 * Returns data for last 12 months vs same period last year
 */
export function getYoYComparison(series: InflationPoint[]): {
  current12Months: InflationPoint[]
  previous12Months: InflationPoint[]
} | null {
  if (series.length < 24) return null
  
  return {
    current12Months: series.slice(-12),
    previous12Months: series.slice(-24, -12)
  }
}

// ==================== Public API Functions ====================

/**
 * Get inflation YoY timeseries data from INSEE
 * @returns Monthly inflation data (Year-over-Year percentage) - REAL DATA ONLY
 */
export async function getInflationYoYTimeseries(): Promise<InflationTimeseries> {
  const cacheKey = 'france-inflation-yoy'
  
  // Check cache (15 minute TTL for real-time data)
  const cached = getCached<InflationTimeseries>(cacheKey, 15 * 60 * 1000)
  if (cached) {
    console.log('✅ Cache hit: INSEE inflation data')
    return cached
  }
  
  console.log('🔄 Fetching real-time inflation data from INSEE...')
  
  try {
    // Fetch from INSEE API
    const data = await fetchINSEEInflation()
    
    // Validate
    const validated = z.array(InflationPointSchema).parse(data)
    
    console.log(`✅ Fetched ${validated.length} real inflation data points from INSEE`)
    
    // Cache and return
    setCached(cacheKey, validated)
    return validated
    
  } catch (error) {
    console.error('❌ Failed to fetch INSEE inflation data:', error)
    throw new Error('Unable to load real-time inflation data. Please check your internet connection or try again later.')
  }
}

/**
 * Get felt inflation proxy data
 * Combines official inflation with memory effects and shock factors
 */
export async function getFeltInflationTimeseries(): Promise<FeltInflationPoint[]> {
  const officialData = await getInflationYoYTimeseries()
  return computeFeltInflationProxy(officialData)
}

/**
 * Get inflation KPIs
 * Latest, 12-month average, and 10-year peak
 */
export async function getInflationKPIs(): Promise<InflationKPIs> {
  const data = await getInflationYoYTimeseries()
  return getKPIs(data)
}
