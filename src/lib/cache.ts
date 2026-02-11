// Simple in-memory cache for runtime data
type CacheEntry<T> = {
  ts: number
  data: T
}

const store = new Map<string, CacheEntry<any>>()

/**
 * Get cached data if not expired
 * @param key Cache key
 * @param ttlMs Time-to-live in milliseconds (default: 60s)
 * @returns Cached data or null if expired/missing
 */
export function getCached<T>(key: string, ttlMs = 60_000): T | null {
  const entry = store.get(key)
  if (!entry) return null

  const age = Date.now() - entry.ts
  if (age > ttlMs) {
    store.delete(key)
    return null
  }

  return entry.data as T
}

/**
 * Set cache data with current timestamp
 * @param key Cache key
 * @param data Data to cache
 */
export function setCached<T>(key: string, data: T): void {
  store.set(key, { ts: Date.now(), data })
}

/**
 * Clear specific cache entry
 * @param key Cache key to clear
 */
export function clearCached(key: string): void {
  store.delete(key)
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  store.clear()
}
