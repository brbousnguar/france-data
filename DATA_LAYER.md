# Data Layer Architecture

This document describes the robust data layer implementation for the Nantes Public Data Dashboard.

## Overview

The data layer provides:
- ✅ Type-safe data fetching with generics
- ✅ HTTP error handling with readable messages
- ✅ Request timeout (10s) using AbortController
- ✅ Next.js server-side fetch with revalidate support
- ✅ In-memory caching with TTL
- ✅ French locale formatting
- ✅ Zod validation for runtime type safety

## Core Modules

### 1. `src/lib/api.ts` - Data Fetching

#### `fetchJson<T>(url, options)`
Generic fetch wrapper with robust error handling:

```typescript
// Basic usage
const data = await fetchJson<MyType>('https://api.example.com/data')

// With Next.js cache revalidation (24 hours)
const data = await fetchJson<MyType>(
  'https://api.example.com/data',
  { next: { revalidate: 86400 } }
)
```

**Features:**
- 10-second timeout using AbortController
- HTTP status error handling (non-200 responses)
- Detailed error messages with URL and status
- Type-safe response parsing

**Error handling:**
- Throws on HTTP errors (4xx, 5xx)
- Throws on timeout (AbortError)
- Logs error details to console

#### `getNantes10Years()`
Fetches Nantes population and jobs projections:
- 24-hour in-memory cache
- Zod validation
- Returns `Nantes10YearsData` type

**Current state:** Uses mocked data. Replace the TODO section with:
```typescript
const data = await fetchJson<Nantes10YearsData>(
  'https://api.example.com/nantes/projections',
  { next: { revalidate: 86400 } }
)
```

#### `getCostOfLife()`
Fetches cost of life categories:
- 24-hour in-memory cache
- Zod validation
- Returns `CostOfLifeData` type

**Current state:** Uses mocked data with French categories.

---

### 2. `src/lib/cache.ts` - In-Memory Caching

Simple runtime cache with TTL support:

```typescript
// Cache data for 5 minutes
setCached('my-key', myData)
const data = getCached<MyType>('my-key', 5 * 60 * 1000)

// Clear specific entry
clearCached('my-key')

// Clear all cache
clearAllCache()
```

**Features:**
- Type-safe generics
- Automatic expiration based on TTL
- Timestamp-based age checking
- Memory-efficient (auto-cleans expired entries)

**Default TTL:** 60 seconds (configurable per call)

---

### 3. `src/lib/types.ts` - Type Definitions

#### Common Types
```typescript
// Generic timeseries
TimeseriesPoint = { date: string; value: number }
TimeseriesData = TimeseriesPoint[]

// Chart-ready types
LineChartData = Array<{ x?: string; year?: string; value: number }>
RadarChartData = Array<{ category: string; value: number }>
```

#### Domain Types
```typescript
Nantes10YearsData = {
  population: NantesPoint[]
  jobs: NantesPoint[]
}

CostOfLifeData = CostOfLifeCategory[]
```

#### Error Types
```typescript
ApiError = {
  message: string
  status?: number
  url?: string
}
```

---

### 4. `src/lib/format.ts` - French Formatting

#### `formatNumberFR(value, decimals = 0)`
French number formatting with space separators:
```typescript
formatNumberFR(1234567)      // "1 234 567"
formatNumberFR(1234.56, 2)   // "1 234,56"
```

#### `formatPercentFR(value, decimals = 1)`
French percentage formatting:
```typescript
formatPercentFR(0.5)      // "50,0 %"
formatPercentFR(0.755, 2) // "75,50 %"
```

#### `formatDateMonthYearFR(dateStr)`
French month-year formatting using date-fns:
```typescript
formatDateMonthYearFR('2025-01-15')  // "janv. 2025"
formatDateMonthYearFR('2025')        // "janv. 2025"
```

**Note:** Uses `date-fns` with French locale (`fr`)

#### `formatCompactFR(value)`
Compact number formatting with K/M suffixes:
```typescript
formatCompactFR(1234)      // "1,2 k"
formatCompactFR(1234567)   // "1,2 M"
```

---

## Usage in Pages

### Server Component Pattern (Recommended)

Pages are server components by default and fetch data server-side:

```typescript
// src/app/(dashboard)/nantes-10-years/page.tsx
export default async function Nantes10YearsPage() {
  // Fetch data server-side
  const data = await getNantes10Years()

  // Pass to client components
  return (
    <div>
      <PageHeader title="Nantes en 10 ans" />
      <ChartCard chartType="line" data={data.population} />
    </div>
  )
}
```

**Benefits:**
- No client-side loading state needed
- Data fetched before page render
- Better SEO (data in initial HTML)
- Leverages Next.js caching

### Client Component Pattern (Charts)

Chart components use `"use client"` for Recharts interactivity:

```typescript
// src/components/ChartCard.tsx
"use client"
import { LineChart, Line } from 'recharts'

export default function ChartCard({ data }) {
  return (
    <div>
      <LineChart data={data}>
        <Line dataKey="value" />
      </LineChart>
    </div>
  )
}
```

---

## Caching Strategy

### Three-Level Caching

1. **Next.js Fetch Cache** (persistent)
   - Via `{ next: { revalidate: 86400 } }` option
   - Shared across requests
   - Revalidates after TTL

2. **In-Memory Cache** (runtime)
   - Via `getCached()` / `setCached()`
   - Process-level (lost on restart)
   - Reduces redundant API calls

3. **Browser Cache** (client-side)
   - Automatic via Next.js router cache
   - Client-side navigation reuses data

### Recommended TTLs

- **Static reference data:** 24 hours (86400s)
- **Frequently updated data:** 5-15 minutes (300-900s)
- **Real-time data:** No cache or 30-60s

Example:
```typescript
// Static reference data (24h)
const data = await fetchJson(url, { next: { revalidate: 86400 } })

// Frequently updated (5 min)
const data = await fetchJson(url, { next: { revalidate: 300 } })
```

---

## Migration Guide

### From Mocked Data to Real API

**Current (mocked):**
```typescript
export async function getNantes10Years() {
  // Mocked data
  const data = { population: [...], jobs: [...] }
  const parsed = NantesSchema.parse(data)
  setCached('nantes-10-years', parsed)
  return parsed
}
```

**Production (real API):**
```typescript
export async function getNantes10Years() {
  const cacheKey = 'nantes-10-years'
  const ttl = 24 * 60 * 60 * 1000

  const cached = getCached<Nantes10YearsData>(cacheKey, ttl)
  if (cached) return cached

  // Real API call
  const data = await fetchJson<Nantes10YearsData>(
    'https://api.data.gouv.fr/nantes/projections',
    { next: { revalidate: 86400 } }
  )

  const parsed = NantesSchema.parse(data)
  setCached(cacheKey, parsed)
  return parsed
}
```

---

## Error Handling

### In API Functions

```typescript
try {
  const data = await getNantes10Years()
  // Use data
} catch (error) {
  console.error('Failed to fetch Nantes data:', error)
  // Handle error (show error state, fallback data, etc.)
}
```

### In Page Components

```typescript
export default async function Page() {
  let data
  let error

  try {
    data = await getNantes10Years()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return <ChartCard data={data} />
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Home page loads and shows two cards
- [ ] Nantes page shows two line charts
- [ ] Cost of Life page shows radar chart
- [ ] French formatting displays correctly (spaces, commas)
- [ ] Data caches properly (check console logs)
- [ ] Page navigation is fast (cache hit)

### Test Cache Behavior

```typescript
// In api.ts, add logging
console.log('Cache hit for', cacheKey)  // When getCached returns data
console.log('Cache miss for', cacheKey) // When fetching fresh data
```

### Test Error Handling

Temporarily break the API:
```typescript
// Force timeout
const data = await fetchJson('https://httpstat.us/200?sleep=15000')

// Force 404
const data = await fetchJson('https://httpstat.us/404')

// Force 500
const data = await fetchJson('https://httpstat.us/500')
```

---

## Best Practices

1. **Always validate API responses with Zod**
   - Catches schema mismatches early
   - Prevents runtime errors from bad data

2. **Use server components for data fetching**
   - Better performance
   - Reduced client bundle size
   - Automatic deduplication

3. **Set appropriate cache TTLs**
   - Balance freshness vs. performance
   - Use longer TTLs for static data

4. **Handle errors gracefully**
   - Show user-friendly error messages
   - Log detailed errors for debugging
   - Provide fallback UI

5. **Type everything**
   - Use generics for `fetchJson<T>`
   - Define domain types in `types.ts`
   - Let TypeScript catch errors

---

## Next Steps

- [ ] Replace mocked data with real API endpoints
- [ ] Add retry logic for transient failures
- [ ] Implement exponential backoff
- [ ] Add request deduplication
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Add unit tests for data layer functions
- [ ] Document real API endpoints when available
