/**
 * Example: How to add a new data endpoint
 * 
 * This file shows the complete pattern for adding new API functions
 * with proper typing, validation, caching, and error handling.
 */

import { z } from 'zod'
import { fetchJson } from './api'
import { getCached, setCached } from './cache'

// 1. Define your data types
export type WeatherData = {
  city: string
  temperature: number
  humidity: number
  timestamp: string
}

// 2. Create a Zod schema for runtime validation
const WeatherSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  timestamp: z.string()
})

// 3. Create your API function
export async function getWeatherData(city: string): Promise<WeatherData> {
  const cacheKey = `weather-${city}`
  const ttl = 5 * 60 * 1000 // 5 minutes for weather data
  
  // Check cache first
  const cached = getCached<WeatherData>(cacheKey, ttl)
  if (cached) {
    console.log('Cache hit for', cacheKey)
    return cached
  }
  
  console.log('Cache miss for', cacheKey, '- fetching fresh data')
  
  // Fetch from API
  const data = await fetchJson<WeatherData>(
    `https://api.weather.example.com/current?city=${encodeURIComponent(city)}`,
    {
      // Next.js will cache this on the server for 5 minutes
      next: { revalidate: 300 }
    }
  )
  
  // Validate response
  const validated = WeatherSchema.parse(data)
  
  // Cache the result
  setCached(cacheKey, validated)
  
  return validated
}

// 4. Use in a server component page
/**
 * src/app/weather/page.tsx
 * 
 * export default async function WeatherPage() {
 *   let data: WeatherData | null = null
 *   let error: string | null = null
 * 
 *   try {
 *     data = await getWeatherData('Nantes')
 *   } catch (e) {
 *     error = e instanceof Error ? e.message : 'Failed to load weather'
 *     console.error('Weather error:', e)
 *   }
 * 
 *   if (error) {
 *     return <ErrorState message={error} />
 *   }
 * 
 *   return (
 *     <div>
 *       <PageHeader title={`Weather for ${data.city}`} />
 *       <StatCard 
 *         title="Temperature" 
 *         description={`${formatNumberFR(data.temperature, 1)}°C`} 
 *       />
 *       <StatCard 
 *         title="Humidity" 
 *         description={formatPercentFR(data.humidity / 100)} 
 *       />
 *     </div>
 *   )
 * }
 */

// 5. For data that needs to be shown in charts
export type TimeseriesWeather = Array<{
  date: string
  temperature: number
}>

export async function getWeatherTimeseries(
  city: string, 
  days: number = 7
): Promise<TimeseriesWeather> {
  const cacheKey = `weather-timeseries-${city}-${days}`
  const ttl = 10 * 60 * 1000 // 10 minutes
  
  const cached = getCached<TimeseriesWeather>(cacheKey, ttl)
  if (cached) return cached
  
  const data = await fetchJson<TimeseriesWeather>(
    `https://api.weather.example.com/history?city=${encodeURIComponent(city)}&days=${days}`,
    { next: { revalidate: 600 } }
  )
  
  // Validate each point
  const schema = z.array(z.object({
    date: z.string(),
    temperature: z.number()
  }))
  
  const validated = schema.parse(data)
  setCached(cacheKey, validated)
  
  return validated
}

/**
 * Then use in a page with a chart:
 * 
 * export default async function WeatherChartPage() {
 *   const data = await getWeatherTimeseries('Nantes', 7)
 *   
 *   return (
 *     <div>
 *       <PageHeader title="7-Day Temperature" />
 *       <ChartCard 
 *         chartType="line" 
 *         title="Temperature Trend"
 *         data={data.map(d => ({ 
 *           date: formatDateMonthYearFR(d.date), 
 *           value: d.temperature 
 *         }))}
 *       />
 *     </div>
 *   )
 * }
 */

// 6. Error handling patterns

// Pattern A: Show error state in UI
export async function fetchWithErrorUI() {
  try {
    return await getWeatherData('Nantes')
  } catch (error) {
    console.error('Weather fetch failed:', error)
    throw error // Let page component handle
  }
}

// Pattern B: Provide fallback data
export async function fetchWithFallback(): Promise<WeatherData> {
  try {
    return await getWeatherData('Nantes')
  } catch (error) {
    console.error('Weather fetch failed, using fallback:', error)
    // Return safe fallback
    return {
      city: 'Nantes',
      temperature: 15,
      humidity: 70,
      timestamp: new Date().toISOString()
    }
  }
}

// Pattern C: Retry with exponential backoff
export async function fetchWithRetry(
  maxRetries = 3,
  baseDelay = 1000
): Promise<WeatherData> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await getWeatherData('Nantes')
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1
      if (isLastAttempt) throw error
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error('Max retries exceeded')
}

/**
 * Best Practices Summary:
 * 
 * 1. Always define TypeScript types first
 * 2. Create Zod schemas for validation
 * 3. Use caching with appropriate TTLs
 * 4. Handle errors gracefully
 * 5. Log cache hits/misses for debugging
 * 6. Use Next.js revalidate for server-side caching
 * 7. Keep cache keys unique and descriptive
 * 8. Consider using query params in cache keys
 * 9. Test with real API failures
 * 10. Document expected API response format
 */
