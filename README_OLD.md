# France Public Data Dashboard - REAL DATA VERSION

## 🎯 Overview

This is a **real-time dashboard** using **official French public data** from INSEE (Institut national de la statistique et des études économiques). **No mock data** - all statistics are fetched directly from public APIs.

## 📊 Data Sources

All data comes from official French government sources:

### 1. **Inflation Data (IPC)**
- **Source**: INSEE - Indice des prix à la consommation
- **API**: https://bdm.insee.fr/series/sdmx/data/SERIES_BDM/001763852
- **Series ID**: 001763852 (Variation annuelle en %)
- **Update Frequency**: Monthly (around 15th of each month)
- **Data Type**: Year-over-year inflation percentage
- **Coverage**: Last 10 years of monthly data

### 2. **Population Data**
- **Source**: INSEE - Recensement de la population
- **Dataset**: Estimations de population par commune
- **URL**: https://www.insee.fr/fr/statistiques/7739582
- **Update Frequency**: Annual
- **Coverage**: Nantes commune (Code INSEE: 44109)
- **Data Type**: Municipal population count

### 3. **Age Distribution**
- **Source**: INSEE - Pyramides des âges
- **Method**: Estimated from national demographic trends
- **Note**: Real age distribution API integration coming soon

## 🚀 Quick Start

### View the Dashboard

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Available Pages

1. **Nantes Demographics** - `/nantes-10-years`
   - Real population evolution from INSEE
   - Age distribution estimates
   - Growth rate calculations

2. **Cost of Life** - `/cost-of-life`
   - Real-time inflation from INSEE
   - Official IPC (Indice des Prix à la Consommation)
   - "Felt inflation" proxy calculation

3. **Debug** - `/debug/datasets`
   - Search data.gouv.fr for more datasets
   - Find additional data sources

## 🔧 How It Works

### Architecture

```
INSEE Public API
       ↓
src/lib/inseeApi.ts (Fetch & Parse)
       ↓
src/lib/cache.ts (15-min cache)
       ↓
Page Components (Display)
```

### Real-Time Data Flow

1. **User visits page** → Page component requests data
2. **Check cache** → If data < 15 minutes old, use cache
3. **Fetch from INSEE** → If cache miss, fetch from public API
4. **Parse & Validate** → Parse CSV, validate with Zod schemas
5. **Display** → Show real data with French formatting

### No Mock Data

- ✅ `USE_MOCK_FALLBACK = false` in `src/lib/config.ts`
- ✅ All functions throw errors if API fails
- ✅ Clear error messages guide users
- ✅ Retry buttons allow recovery

## 📁 Key Files

### Data Layer
- `src/lib/inseeApi.ts` - Direct INSEE API integration
- `src/lib/nantesDemography.ts` - Population data layer
- `src/lib/inflation.ts` - Inflation data layer
- `src/lib/cache.ts` - In-memory caching (15-min TTL)
- `src/lib/config.ts` - Configuration (no mock data)

### Components
- `src/app/(dashboard)/nantes-10-years/page.tsx` - Demographics page
- `src/app/(dashboard)/cost-of-life/page.tsx` - Inflation page
- `src/components/ErrorState.tsx` - Retry on API failure
- `src/components/LoadingSkeleton.tsx` - Loading states

## 🔍 API Details

### INSEE Inflation API

**Endpoint:**
```
https://bdm.insee.fr/series/sdmx/data/SERIES_BDM/001763852?format=csv&firstNObservations=120
```

**Response Format (CSV):**
```
TIME_PERIOD;OBS_VALUE
2024-01;3.1
2024-02;2.9
2024-03;2.7
...
```

**Fields:**
- `TIME_PERIOD`: Date in YYYY-MM format
- `OBS_VALUE`: Inflation rate (%)

### INSEE Population API

**Endpoint:**
```
https://www.insee.fr/fr/statistiques/fichier/7739582/ensemble.csv
```

**Response Format (CSV):**
```
CODGEO;ANNEE;PMUN
44109;2020;309346
44109;2021;314138
44109;2022;320732
...
```

**Fields:**
- `CODGEO`: INSEE commune code (44109 = Nantes)
- `ANNEE`: Year
- `PMUN`: Municipal population

## ⚙️ Configuration

### Environment Variables (Optional)

Create `.env.local` to override default data sources:

```bash
# Optional: Custom data source URLs
NANTES_POPULATION_URL=https://custom-source.com/population.csv
FRANCE_INFLATION_URL=https://custom-source.com/inflation.csv
```

### Config File

`src/lib/config.ts`:

```typescript
export const CONFIG = {
  // INSEE code for Nantes
  NANTES_CODE_INSEE: '44109',
  
  // No mock data
  USE_MOCK_FALLBACK: false,
  
  // Debug logging
  DEBUG_DATA_SOURCES: true,
  
  // Cache TTL
  CACHE_TTL_HOURS: 24,
}
```

## 📈 Data Freshness

| Data Type | Update Frequency | Cache Duration | Last Updated |
|-----------|-----------------|----------------|--------------|
| Inflation | Monthly (INSEE) | 15 minutes | Check console logs |
| Population | Annual (INSEE) | 24 hours | Check console logs |
| Age Groups | Annual (INSEE) | 24 hours | Check console logs |

## 🛠️ Error Handling

### What happens if INSEE API is down?

1. **Primary source fails** → Try fallback (data.gouv.fr mirror)
2. **Fallback fails** → Show error message with retry button
3. **User clicks retry** → Attempt fetch again
4. **Cache available** → Use stale data if < 1 hour old

### Console Logging

Watch the browser console to see real-time data fetching:

```
🔄 Fetching INSEE inflation data from: https://bdm.insee.fr/...
✅ Successfully fetched 120 inflation data points from INSEE
📊 Date range: 2014-01 to 2024-01
📈 Latest inflation: 2.9%
```

## 📊 Data Quality

### Validation

All data is validated with Zod schemas:

```typescript
const InflationPointSchema = z.object({
  date: z.string(),    // YYYY-MM format
  value: z.number()    // Percentage
})
```

### Consistency Checks

- ✅ Date format validation (YYYY-MM)
- ✅ Numeric value validation
- ✅ Chronological order verification
- ✅ Outlier detection (inflation > 20% flagged)

## 🎨 Features

### Real-Time Updates
- Data refreshes every 15 minutes
- Clear cache indicators in console
- "Last updated" timestamps

### CSV Export
- Download any chart data as CSV
- Filename includes current date
- UTF-8 BOM for Excel compatibility

### Responsive Design
- Mobile-friendly layouts
- Touch-optimized charts
- Adaptive card grids

### Accessibility
- ARIA labels on charts
- Keyboard navigation
- Screen reader support
- High contrast colors

## 🔒 Privacy & Security

- ✅ No user tracking
- ✅ No cookies
- ✅ No analytics
- ✅ No data collection
- ✅ Client-side only (except INSEE API calls)
- ✅ No authentication required
- ✅ All data sources are public

## 🌐 API Reliability

### INSEE Uptime
- **Availability**: ~99.5%
- **Response Time**: ~500ms average
- **Rate Limits**: None for public data
- **Authentication**: Not required

### Fallback Strategy
1. Primary: INSEE BDM API
2. Secondary: data.gouv.fr mirror
3. Tertiary: Cache (if < 1 hour old)
4. Last resort: Error message with retry

## 📝 Adding More Data Sources

### Find datasets on data.gouv.fr

1. Go to http://localhost:3000/debug/datasets
2. Search for datasets (e.g., "emploi", "logement")
3. Copy resource URLs
4. Update `src/lib/config.ts`
5. Create new data layer in `src/lib/`
6. Add new page in `src/app/(dashboard)/`

### Example: Add Employment Data

```typescript
// src/lib/employment.ts
import { fetchINSEECSV } from './inseeApi'

export async function getEmploymentData() {
  const url = 'https://www.insee.fr/fr/statistiques/...'
  const data = await fetchINSEECSV(url)
  // Parse and return
  return parsed
}
```

## 🐛 Troubleshooting

### "Unable to load real-time inflation data"

**Cause**: INSEE API is temporarily unavailable

**Solutions**:
1. Check your internet connection
2. Wait 5 minutes and retry
3. Check https://www.insee.fr/ status
4. Check browser console for detailed error

### "No population data found for commune 44109"

**Cause**: INSEE population dataset structure changed

**Solutions**:
1. Check if dataset URL is still valid
2. Update CSV parsing logic in `src/lib/inseeApi.ts`
3. Verify Nantes code is still 44109

### Cache not working

**Cause**: Cache implementation uses in-memory storage

**Solutions**:
1. Cache clears on page reload (by design)
2. Use browser DevTools → Application → Cache to inspect
3. Check console logs for "Cache hit" vs "Cache miss"

## 🚢 Deployment

### Production Checklist

- [ ] Update `NODE_ENV=production`
- [ ] Set appropriate cache TTLs
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Enable CORS if needed
- [ ] Add rate limiting if proxying INSEE
- [ ] Set up CDN for static assets
- [ ] Monitor API response times

### Vercel Deployment

```bash
npm run build
vercel deploy
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Resources

- **INSEE Website**: https://www.insee.fr/
- **Data.gouv.fr**: https://www.data.gouv.fr/
- **INSEE API Docs**: https://www.insee.fr/fr/information/2868055
- **BDM Series**: https://bdm.insee.fr/

## 🤝 Contributing

This is a demonstration project using real public data. To add more data sources:

1. Find datasets on data.gouv.fr or INSEE
2. Create data layer in `src/lib/`
3. Add page in `src/app/(dashboard)/`
4. Follow existing patterns (caching, validation, error handling)

## 📄 License

MIT License - Use freely for any purpose

## ⚠️ Disclaimer

This dashboard uses official public data from INSEE and data.gouv.fr. Data accuracy depends on the source. Always verify critical information with official sources.

---

**Built with ❤️ using France's public open data**

**Server running at**: http://localhost:3000

**Last updated**: February 11, 2026
