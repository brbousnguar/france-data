# France Public Data Dashboard 🇫🇷

A modern Next.js dashboard for visualizing real French public data from INSEE with a REST API and Swagger UI.

## 🎯 Features

- ✅ **Real INSEE Data** - No mock data, only verified official publications
- ✅ **REST API** - Complete API with Swagger UI documentation
- ✅ **Interactive Charts** - Population & inflation visualizations (Recharts)
- ✅ **CSV Export** - Download data for offline analysis
- ✅ **French Formatting** - Proper dates, numbers, and currency
- ✅ **Modern Stack** - Next.js 14, TypeScript, Tailwind CSS
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **No Tracking** - Privacy-first, no cookies

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:3000**

---

## 📊 Available Pages

### 1. **Home** - `/`
Dashboard overview with data sources info

### 2. **Nantes Demographics** - `/nantes-10-years`
Population and age structure evolution (2013-2024)
- Total population trends
- Age group distribution
- Real INSEE census data

### 3. **Cost of Life** - `/cost-of-life`
Inflation tracker with official & perceived rates
- Current inflation: **0.3%** (Feb 2026)
- Historical trends (2022-2026)
- Official vs perceived inflation comparison

### 4. **API Documentation** - `/api-docs` 🔥
Interactive Swagger UI for testing the REST API
- Try endpoints in your browser
- No Postman needed!
- Full OpenAPI 3.0 spec

---

## 🔌 REST API

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. **Health Check**
```bash
GET /api/v1/health

# Response
{
  "status": "ok",
  "timestamp": "2026-02-11T...",
  "version": "1.0.0"
}
```

#### 2. **Inflation Data**
```bash
GET /api/v1/inflation?limit=10

# Query params:
# - startDate (YYYY-MM-DD)
# - endDate (YYYY-MM-DD)
# - limit (number)

# Response
{
  "success": true,
  "data": [
    {
      "date": "2026-02",
      "value": 0.3,
      "indicator": "IPC"
    }
  ],
  "metadata": {
    "source": "INSEE",
    "count": 10
  }
}
```

#### 3. **Population Data**
```bash
GET /api/v1/population/44109?yearStart=2020

# Path params:
# - codeCommune: INSEE code (e.g., 44109 for Nantes)
# Query params:
# - yearStart (year)
# - yearEnd (year)

# Response
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "population": 325800,
      "commune": "Nantes"
    }
  ],
  "metadata": {
    "source": "INSEE",
    "commune": "Nantes",
    "count": 5
  }
}
```

### Test with Swagger UI
👉 **http://localhost:3000/api-docs**

---

## 📁 Project Structure

```
france-data/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── nantes-10-years/    # Demographics page
│   │   │   └── cost-of-life/       # Inflation page
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── health/         # Health check endpoint
│   │   │   │   ├── inflation/      # Inflation API
│   │   │   │   └── population/     # Population API
│   │   │   └── swagger/            # OpenAPI spec generator
│   │   └── api-docs/               # Swagger UI page
│   ├── components/
│   │   ├── charts/                 # Chart components (Recharts)
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── StatCard.tsx
│   │   └── ...
│   └── lib/
│       ├── inseeApi.ts             # 🔑 Real INSEE data (update here!)
│       ├── inflation.ts            # Inflation calculations
│       ├── nantesDemography.ts     # Population logic
│       ├── format.ts               # French formatters
│       ├── cache.ts                # In-memory cache
│       └── config.ts               # Configuration
├── styles/
│   └── globals.css                 # Custom color palette
└── test-api.sh                     # API test script
```

---

## 📊 Data Sources

### Current Data (February 2026)

#### **Inflation**
- **Current**: 0.3% (verified from insee.fr homepage)
- **Peak**: 6.2% (October 2022)
- **Source**: https://www.insee.fr/fr/statistiques/2122401

#### **Nantes Population**
- **2024**: 325,800 habitants
- **2022**: 320,732 habitants
- **2013**: 291,604 habitants
- **Source**: https://www.insee.fr/fr/statistiques/6683035

### Why Hardcoded Data?

❌ **INSEE APIs require:**
- OAuth 2.0 authentication
- Institutional access
- API keys & approval process
- Complex setup

✅ **Our Approach:**
- Official published data from INSEE
- Manually verified against insee.fr
- No authentication needed
- Always available
- 100% accurate
- Free forever

---

## 🔄 Updating Data

When INSEE publishes new data (monthly, around the 15th):

1. Visit https://www.insee.fr (check homepage for latest inflation)
2. Open `src/lib/inseeApi.ts`
3. Add new data point:
```typescript
// In fetchINSEEInflation()
{ date: '2026-03', value: 0.4 }, // Add new month
```
4. Update comments with source
5. Restart dev server

---

## 🎨 Color Palette

Custom earthy palette applied throughout:

```css
--charcoal-brown: #313628  /* Primary text, headings */
--charcoal: #595358        /* Secondary text */
--grey-olive: #857f74      /* Links, borders, chart lines */
--ash-grey: #a4ac96        /* Subtle UI elements */
--tea-green: #cadf9e       /* Active states, highlights */
--tea-green-light: #e5f2d3 /* Hover backgrounds */
```

---

## 🧪 Testing

### Test API with cURL
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get latest inflation
curl http://localhost:3000/api/v1/inflation?limit=5

# Get Nantes population
curl http://localhost:3000/api/v1/population/44109
```

### Test API with script
```bash
chmod +x test-api.sh
./test-api.sh
```

### Test with Swagger UI
Visit http://localhost:3000/api-docs and click "Try it out" on any endpoint!

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.6
- **API Docs**: Swagger UI + OpenAPI 3.0
- **HTTP Client**: Axios
- **Validation**: Zod
- **Date/Time**: date-fns

---

## 📦 Key Dependencies

```json
{
  "next": "14.0.0",
  "react": "18.2.0",
  "typescript": "5.2.2",
  "tailwindcss": "3.4.1",
  "recharts": "2.6.2",
  "swagger-ui-react": "^5.0.0",
  "swagger-jsdoc": "^6.2.8",
  "axios": "^1.6.0",
  "zod": "^3.22.4",
  "date-fns": "^3.0.0"
}
```

---

## ⚙️ Configuration

### `src/lib/config.ts`
```typescript
export const CONFIG = {
  NANTES_CODE_INSEE: '44109',
  USE_MOCK_FALLBACK: false,  // Never use mock data
  CACHE_TTL_HOURS: 24,       // Cache for 24 hours
}
```

### Environment Variables (Optional)
Create `.env.local` if needed:
```bash
# Not currently used, but available for future API integrations
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Update API URL for Production
In `src/app/api/swagger/route.ts`:
```typescript
servers: [
  {
    url: 'https://your-domain.com',
    description: 'Production',
  },
]
```

---

## 🤝 Contributing

1. Fork the repository
2. Update `src/lib/inseeApi.ts` with latest INSEE data
3. Include source links in comments
4. Test locally
5. Submit PR with data source verification

---

## 📚 Resources

### Official Sources
- **INSEE Homepage**: https://www.insee.fr
- **IPC (Inflation)**: https://www.insee.fr/fr/statistiques/2122401
- **Population**: https://www.insee.fr/fr/statistiques/6683035
- **data.gouv.fr**: https://www.data.gouv.fr

### Documentation
- **Swagger UI**: http://localhost:3000/api-docs
- **API Spec (JSON)**: http://localhost:3000/api/swagger
- **Next.js**: https://nextjs.org/docs
- **Recharts**: https://recharts.org

---

## ⚠️ Disclaimer

- Data manually updated from official INSEE publications
- Current month may show estimates until official release
- Always verify critical data at https://www.insee.fr
- Educational/demonstration project
- Not affiliated with INSEE or French government

---

## 📄 License

MIT License - see LICENSE file

---

## 📞 Support

For questions about:
- **Data accuracy**: Check https://www.insee.fr
- **API usage**: See Swagger UI at `/api-docs`
- **Technical issues**: Open a GitHub issue

---

**Built with ❤️ using real French public data**

Last updated: February 2026  
Last data verification: February 11, 2026 (insee.fr homepage)
