# Nantes Demographic Observatory Documentation

## Overview

The Nantes 10-year demographic page (`/nantes-10-years`) is a mini observatory showing population trends and age structure evolution for Nantes over approximately 10 years.

## Features

### 1. **Header Section**
- Title: "Nantes en 10 ans"
- Subtitle: "Évolution de la population et structure par âge d'après les données publiques."

### 2. **KPI Dashboard (3 Cards)**
- **Population actuelle**: Latest population count (formatted in French style)
- **Évolution sur 10 ans**: Absolute change and percentage (e.g., "+13,500 (+4,3 %)")
- **Âge médian**: Median age in years (or "—" if unavailable)

### 3. **Interactive Charts**
- **Population Line Chart**: Shows population evolution over ~10 years
  - Responsive design
  - Custom French tooltips
  - Formatted Y-axis (e.g., "320k")
  - Blue line with hover effects

- **Age Groups Stacked Bar Chart**: Shows age distribution as percentages
  - 5 age groups: 0-14, 15-29, 30-44, 45-59, 60+
  - Color-coded for easy distinction
  - Stacked to 100% for each year
  - Custom tooltips showing percentages

### 4. **Data Source Note**
- Credits: INSEE / data.gouv
- Configuration instructions for real API integration

## Architecture

### Data Layer (`src/lib/nantesDemography.ts`)

#### Adapter Pattern
The data layer uses an adapter pattern that:
1. **Attempts to fetch from real APIs** (if configured)
2. **Falls back to mock data** if APIs are unavailable
3. **Caches results** with 24-hour TTL
4. **Validates data** using Zod schemas

#### Configuration
Set environment variables in `.env.local`:
```bash
NANTES_POPULATION_API=https://api.insee.fr/nantes/population
NANTES_AGE_GROUPS_API=https://api.insee.fr/nantes/age-groups
NANTES_SNAPSHOT_API=https://api.insee.fr/nantes/snapshot
```

To use mock data (default):
```typescript
// In nantesDemography.ts
const DATA_CONFIG = {
  useMockData: true  // Set to false when APIs are ready
}
```

#### API Functions

##### `getPopulationTimeseries()`
Returns population data points by year.

**Response Type:**
```typescript
type PopulationPoint = {
  date: string  // Year as string (e.g., "2026")
  value: number // Population count
}
```

**Example:**
```typescript
const data = await getPopulationTimeseries()
// [
//   { date: "2016", value: 310000 },
//   { date: "2017", value: 313500 },
//   ...
// ]
```

##### `getAgeGroupSharesTimeseries()`
Returns age group distribution over time as percentages.

**Response Type:**
```typescript
type AgeGroupShares = {
  date: string
  g0_14: number    // 0-14 years (%)
  g15_29: number   // 15-29 years (%)
  g30_44: number   // 30-44 years (%)
  g45_59: number   // 45-59 years (%)
  g60plus: number  // 60+ years (%)
}
```

**Example:**
```typescript
const data = await getAgeGroupSharesTimeseries()
// [
//   { date: "2016", g0_14: 16, g15_29: 22, g30_44: 20, g45_59: 19, g60plus: 23 },
//   ...
// ]
```

##### `getLatestSnapshot()`
Returns most recent demographic snapshot with detailed info.

**Response Type:**
```typescript
type DemographicSnapshot = {
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
```

#### Utility Functions

##### `calculatePopulationChange(timeseries)`
Calculates absolute and percentage change between first and last data points.

```typescript
const change = calculatePopulationChange(data)
// { absolute: 13500, percent: 4.35 }
```

##### `getLatestPopulation(timeseries)`
Extracts the most recent population value.

```typescript
const latest = getLatestPopulation(data)
// 323000
```

### Chart Components

#### `PopulationLineChart.tsx`
Client component using Recharts LineChart.

**Props:**
```typescript
{
  data: Array<{ date: string; value: number }>
  title?: string
}
```

**Features:**
- Responsive container (adapts to screen size)
- Custom French tooltips
- Formatted Y-axis (K notation)
- Blue line with dots
- Grid lines for readability

#### `AgeGroupsStackedChart.tsx`
Client component using Recharts BarChart (stacked).

**Props:**
```typescript
{
  data: Array<{
    date: string
    g0_14: number
    g15_29: number
    g30_44: number
    g45_59: number
    g60plus: number
  }>
  title?: string
}
```

**Features:**
- 5 color-coded bars per age group
- Stacked to 100% for each year
- Custom tooltips showing percentages
- Responsive design
- Legend with square icons

**Color Scheme:**
- 0-14 ans: Blue (#3b82f6)
- 15-29 ans: Green (#10b981)
- 30-44 ans: Amber (#f59e0b)
- 45-59 ans: Red (#ef4444)
- 60+ ans: Purple (#8b5cf6)

### Page Component (`page.tsx`)

Server component that:
1. **Fetches all data in parallel** using `Promise.all()`
2. **Calculates KPIs** from fetched data
3. **Renders layout** with header, KPIs, charts, and footer
4. **Handles errors gracefully** (will show "—" for missing data)

## Mock Data Generation

The mock data generator creates realistic data:

### Population Trends
- Base: 310,000 in 2016
- Growth: ~3,500 per year (~1.1% annual growth)
- Latest: ~323,000 in 2026

### Age Structure Trends
Simulates aging population:
- **0-14 years**: Declining (16% → 14.5%)
- **15-29 years**: Declining (22% → 21%)
- **30-44 years**: Stable/slight increase
- **45-59 years**: Stable/slight increase
- **60+ years**: Increasing (23% → 24.5%)

This reflects typical demographic trends in French cities.

## Integration with Real APIs

### Step 1: Configure Environment Variables

Create `.env.local` in project root:
```bash
# INSEE API endpoints (example URLs)
NANTES_POPULATION_API=https://api.insee.fr/series/001234567
NANTES_AGE_GROUPS_API=https://api.insee.fr/series/001234568
NANTES_SNAPSHOT_API=https://api.insee.fr/datasets/nantes/latest

# Optional: INSEE API key
INSEE_API_KEY=your_api_key_here
```

### Step 2: Update Configuration

Edit `src/lib/nantesDemography.ts`:
```typescript
const DATA_CONFIG = {
  populationUrl: process.env.NANTES_POPULATION_API,
  ageGroupsUrl: process.env.NANTES_AGE_GROUPS_API,
  snapshotUrl: process.env.NANTES_SNAPSHOT_API,
  cacheTtl: 24 * 60 * 60 * 1000,
  useMockData: false  // Switch to real APIs
}
```

### Step 3: Transform API Responses

If your API returns different formats, add transformation logic:

```typescript
// Example: Transform INSEE series data
export async function getPopulationTimeseries(): Promise<PopulationPoint[]> {
  // ... existing cache check ...
  
  const response = await fetchJson(DATA_CONFIG.populationUrl)
  
  // Transform INSEE format to our format
  const data = response.observations.map((obs: any) => ({
    date: obs.period,
    value: parseFloat(obs.value)
  }))
  
  // ... validation and caching ...
}
```

### Step 4: Test with Real Data

1. Clear cache: `clearAllCache()` in api.ts
2. Restart dev server
3. Check console logs for API calls
4. Verify charts render correctly

## Error Handling

### API Failures
If real APIs fail, the system:
1. Logs the error to console
2. Falls back to mock data automatically
3. Continues rendering the page

### Missing Data
If certain fields are unavailable:
- KPI cards show "—" instead of values
- Charts can still render with partial data
- Page remains functional

### Validation Errors
Zod validates all API responses:
- Type mismatches are caught early
- Invalid data is logged and rejected
- Falls back to mock data

## Performance

### Caching Strategy
- **In-memory cache**: 24-hour TTL (fast, runtime)
- **Next.js cache**: 24-hour revalidate (persistent, server-side)
- **Parallel fetching**: All data loads simultaneously

### Optimization Tips
1. Adjust cache TTL based on data update frequency
2. Use Next.js ISR for faster page loads
3. Consider CDN caching for static data

## Testing

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] All 3 KPI cards display correctly
- [ ] Population line chart renders with data
- [ ] Age groups stacked chart renders with colors
- [ ] Tooltips show on hover
- [ ] French formatting is correct (spaces, commas)
- [ ] Responsive design works on mobile
- [ ] Data source note is visible

### Test with Mock Data
```bash
# Use default mock data (already configured)
npm run dev
# Visit http://localhost:3000/nantes-10-years
```

### Test Error Handling
Temporarily break the API in `nantesDemography.ts`:
```typescript
// Force error to test fallback
throw new Error('Test error')
```

## Customization

### Adjust Time Range
Change the number of years in mock data:
```typescript
generateMockPopulationTimeseries(2016, 15)  // 15 years instead of 11
```

### Modify Age Groups
Edit the age group definitions if needed:
```typescript
// In types
type AgeGroupShares = {
  date: string
  g0_17: number    // Change to 0-17
  g18_64: number   // Change to 18-64
  g65plus: number  // Change to 65+
}
```

Update chart component accordingly.

### Change Color Scheme
Edit colors in `AgeGroupsStackedChart.tsx`:
```typescript
const colors = {
  '0-14 ans': '#your-color',
  // ...
}
```

## Next Steps

1. **Get real INSEE API credentials**
   - Register at https://api.insee.fr
   - Obtain API key

2. **Identify exact data series**
   - Population: `TCRED-ESTIMATION-POP` series
   - Age structure: `PYRAMIDE-DES-AGES` dataset

3. **Create data transformers**
   - Map INSEE response format to our types
   - Handle date formats (INSEE uses different conventions)

4. **Add more visualizations** (optional)
   - Age pyramid for latest year
   - Migration trends
   - Birth/death rates

5. **Add data export** (optional)
   - CSV download button
   - Share functionality

## Resources

- **INSEE API**: https://api.insee.fr/catalogue/
- **Data.gouv**: https://www.data.gouv.fr/fr/
- **Nantes Open Data**: https://data.nantesmetropole.fr/
- **Recharts Documentation**: https://recharts.org/

## Support

For questions or issues:
1. Check console logs for error details
2. Verify environment variables are set
3. Test with mock data first
4. Review Zod validation errors
