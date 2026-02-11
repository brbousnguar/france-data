import { z } from 'zod'
import { setCached, getCached } from './cache'
import type { Nantes10YearsData, CostOfLifeData, ApiError } from './types'

// Default timeout for fetch requests (10 seconds)
const DEFAULT_TIMEOUT_MS = 10_000

/**
 * Generic fetch wrapper with timeout, error handling, and Next.js cache support
 * @param url URL to fetch
 * @param options Fetch options (supports Next.js revalidate)
 * @returns Parsed JSON response
 * @throws ApiError with readable message
 */
export async function fetchJson<T>(
  url: string,
  options?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No error details')
      const error: ApiError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        url
      }
      
      console.error(`Fetch error for ${url}:`, error, errorBody)
      throw new Error(error.message)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${DEFAULT_TIMEOUT_MS}ms: ${url}`)
      }
      throw error
    }

    throw new Error(`Unknown error fetching ${url}`)
  }
}

// Validation schemas
const NantesSchema = z.object({
  population: z.array(z.object({ year: z.string(), value: z.number() })),
  jobs: z.array(z.object({ year: z.string(), value: z.number() }))
})

const CostSchema = z.array(
  z.object({ category: z.string(), value: z.number() })
)

/**
 * Fetch Nantes 10-year projection data
 * Uses in-memory cache with 24h TTL
 * In production, replace mocked data with real API call
 */
export async function getNantes10Years(): Promise<Nantes10YearsData> {
  const cacheKey = 'nantes-10-years'
  const ttl = 24 * 60 * 60 * 1000 // 24 hours
  
  // Check cache first
  const cached = getCached<Nantes10YearsData>(cacheKey, ttl)
  if (cached) {
    return cached
  }

  // TODO: Replace with real API endpoint
  // const data = await fetchJson<Nantes10YearsData>(
  //   'https://api.example.com/nantes/projections',
  //   { next: { revalidate: 86400 } } // Revalidate every 24h
  // )

  // Mocked data for now
  const now = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => String(now + i))

  const population = years.map((y, idx) => ({
    year: y,
    value: 320_000 + idx * 4_000
  }))

  const jobs = years.map((y, idx) => ({
    year: y,
    value: 150_000 + idx * 2_000
  }))

  const data = { population, jobs }

  // Validate with Zod
  const parsed = NantesSchema.parse(data)
  
  // Cache the result
  setCached(cacheKey, parsed)
  
  return parsed
}

/**
 * Fetch Cost of Life data
 * Uses in-memory cache with 24h TTL
 * In production, replace mocked data with real API call
 */
export async function getCostOfLife(): Promise<CostOfLifeData> {
  const cacheKey = 'cost-of-life'
  const ttl = 24 * 60 * 60 * 1000 // 24 hours
  
  // Check cache first
  const cached = getCached<CostOfLifeData>(cacheKey, ttl)
  if (cached) {
    return cached
  }

  // TODO: Replace with real API endpoint
  // const data = await fetchJson<CostOfLifeData>(
  //   'https://api.example.com/cost-of-life',
  //   { next: { revalidate: 86400 } }
  // )

  // Mocked data for now
  const data = [
    { category: 'Logement', value: 80 },
    { category: 'Alimentation', value: 70 },
    { category: 'Transport', value: 60 },
    { category: 'Santé', value: 50 },
    { category: 'Éducation', value: 40 }
  ]

  // Validate with Zod
  const parsed = CostSchema.parse(data)
  
  // Cache the result
  setCached(cacheKey, parsed)
  
  return parsed
}
