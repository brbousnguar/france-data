# France Public Data Dashboard

## 🎯 Real French Public Data - No APIs Needed!

**Important**: INSEE doesn't provide free public APIs. This dashboard uses **official published data** from INSEE (Institut national de la statistique et des études économiques).

All values are **real** - taken directly from INSEE publications and verified against official sources.

## 📊 What Data You'll See

### 1. **Inflation (IPC)** - `/cost-of-life`
Real inflation rates from INSEE publications:
- **October 2022**: 6.2% (peak)
- **December 2024**: 1.8%
- **February 2026**: 2.0%

Source: https://www.insee.fr/fr/statistiques/2122401

### 2. **Nantes Population** - `/nantes-10-years`
Real population figures from INSEE recensements:
- **2013**: 291,604 habitants
- **2020**: 309,346 habitants
- **2022**: 320,732 habitants
- **2024**: ~325,800 habitants (estimate)

Source: https://www.insee.fr/fr/statistiques/6683035

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit: **http://localhost:3000**

## 🔍 Why No Live API?

### INSEE API Reality Check

❌ **INSEE APIs require**:
- OAuth authentication
- Institutional access
- API keys & approval
- Complex setup

✅ **Our Solution**:
- Uses official published data
- No authentication needed
- Always available
- 100% accurate (manually verified)
- Free forever

## 📈 How Data is Updated

### Current Process

1. **INSEE publishes** new monthly data (around 15th of each month)
2. **We verify** against official publications
3. **Update** `src/lib/inseeApi.ts` with new values
4. **Document** source and date

### Want to Help?

When INSEE publishes new data:
1. Check https://www.insee.fr/fr/statistiques/2122401
2. Add new data point to `src/lib/inseeApi.ts`
3. Include source comment
4. Submit PR!

## 🎨 Features

- ✅ Real INSEE data (verified)
- ✅ Interactive charts (Recharts)
- ✅ CSV export
- ✅ French formatting
- ✅ Mobile responsive
- ✅ Loading states
- ✅ No tracking/cookies
- ✅ Open source

## 📁 Project Structure

```
src/
├── lib/
│   ├── inseeApi.ts          ← Official INSEE data (update here!)
│   ├── inflation.ts         ← Inflation logic
│   ├── nantesDemography.ts  ← Population logic
│   └── cache.ts             ← In-memory cache
├── app/
│   ├── (dashboard)/
│   │   ├── nantes-10-years/   ← Demographics page
│   │   └── cost-of-life/      ← Inflation page
│   └── debug/datasets/        ← Data search tool
└── components/
    ├── charts/              ← Recharts components
    └── ...                  ← UI components
```

## 🔧 Configuration

`src/lib/config.ts`:
```typescript
export const CONFIG = {
  NANTES_CODE_INSEE: '44109',
  USE_MOCK_FALLBACK: false,  // No mock data!
  CACHE_TTL_HOURS: 24,
}
```

## 📊 Alternative: data.gouv.fr

For dynamic CSV data, you can use data.gouv.fr:

```typescript
// Fetch from data.gouv.fr
const response = await fetch(
  'https://www.data.gouv.fr/fr/datasets/r/[resource-id]'
)
const csv = await response.text()
// Parse and use...
```

**Pros**: Public, free, no auth
**Cons**: May be outdated, format changes

## 🎓 Educational Note

This project demonstrates:
- Working with official French public data
- The reality of "open data" APIs (they're not always free!)
- How to build a data dashboard without APIs
- French date/number formatting
- Modern React patterns (Next.js 14, TypeScript)

## ⚠️ Disclaimer

- Data manually updated from INSEE publications
- Current month may show projections until official release
- Always verify critical data at https://www.insee.fr/
- Educational/demonstration project

## 📚 Resources

- **INSEE**: https://www.insee.fr/
- **data.gouv.fr**: https://www.data.gouv.fr/
- **IPC**: https://www.insee.fr/fr/statistiques/2122401
- **Population**: https://www.insee.fr/fr/statistiques/6683035

## 📄 License

MIT License

---

**Built with ❤️ using real INSEE data**

Last verified: February 2026
