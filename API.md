# France Public Data API

## 🚀 REST API with Swagger UI

Your webapp now includes a **complete REST API** for accessing French public data!

## 📚 Documentation & Testing

### **Swagger UI**: http://localhost:3000/api-docs

Interactive API documentation where you can **test all endpoints** directly in your browser!

---

## 🔌 Available Endpoints

### 1. **Health Check**
```
GET /api/v1/health
```
Check if the API is running.

**Example:**
```bash
curl http://localhost:3000/api/v1/health
```

---

### 2. **Inflation Data**
```
GET /api/v1/inflation
```

Get French inflation data from INSEE.

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Max records (default: 100)

**Examples:**
```bash
# Get all inflation data
curl http://localhost:3000/api/v1/inflation

# Get last 12 months
curl http://localhost:3000/api/v1/inflation?limit=12

# Get specific date range
curl "http://localhost:3000/api/v1/inflation?startDate=2024-01-01&endDate=2024-12-31"
```

**Response:**
```json
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

---

### 3. **Population Data**
```
GET /api/v1/population/{codeCommune}
```

Get population time series for a French commune.

**Path Parameters:**
- `codeCommune`: INSEE code (e.g., `44109` for Nantes)

**Query Parameters:**
- `yearStart` (optional): Start year
- `yearEnd` (optional): End year

**Examples:**
```bash
# Get Nantes population (all years)
curl http://localhost:3000/api/v1/population/44109

# Get specific years
curl "http://localhost:3000/api/v1/population/44109?yearStart=2020&yearEnd=2024"
```

**Response:**
```json
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
    "source": "INSEE / geo.api.gouv.fr",
    "commune": "Nantes",
    "codeCommune": "44109",
    "count": 5
  }
}
```

---

## 🧪 Testing with Swagger UI

1. **Open Swagger UI**: http://localhost:3000/api-docs
2. **Click on any endpoint** to expand it
3. **Click "Try it out"** button
4. **Fill in parameters** (if any)
5. **Click "Execute"** to test the API
6. **View the response** below

---

## 🏗️ Architecture

```
src/app/api/
├── v1/
│   ├── health/
│   │   └── route.ts          # Health check endpoint
│   ├── inflation/
│   │   └── route.ts          # Inflation data endpoint
│   └── population/
│       └── [codeCommune]/
│           └── route.ts      # Population endpoint (dynamic route)
├── swagger/
│   └── route.ts              # OpenAPI spec generator
└── api-docs/
    └── page.tsx              # Swagger UI page
```

---

## 🔄 Data Sources

### Primary Sources (API tries to fetch from):
- **data.gouv.fr** - French Open Data Platform
- **geo.api.gouv.fr** - Geographic API
- **INSEE APIs** - When available

### Fallback:
If real APIs are unavailable or require authentication, the API falls back to **verified INSEE data** (hardcoded but real values from official publications).

---

## 🎯 Features

✅ **RESTful API** with proper HTTP methods  
✅ **OpenAPI 3.0** specification  
✅ **Swagger UI** for interactive testing  
✅ **Type-safe** with TypeScript  
✅ **Error handling** with proper status codes  
✅ **Query parameters** for filtering  
✅ **Real French public data**  
✅ **Fallback data** when APIs unavailable  

---

## 📝 Next Steps

### Add More Endpoints:
- `/api/v1/unemployment` - Unemployment data
- `/api/v1/gdp` - GDP growth
- `/api/v1/demographics/{codeCommune}` - Age distribution

### Enhance API:
- Add authentication (API keys)
- Add rate limiting
- Add caching headers
- Add pagination
- Deploy to production

---

## 🌐 Production Deployment

When deploying, update the server URL in `/api/swagger/route.ts`:

```typescript
servers: [
  {
    url: 'https://your-domain.com',
    description: 'Production server',
  },
]
```

---

## 🔗 Links

- **Swagger UI**: http://localhost:3000/api-docs
- **API Spec (JSON)**: http://localhost:3000/api/swagger
- **Health Check**: http://localhost:3000/api/v1/health
- **Data Sources**: 
  - https://www.data.gouv.fr
  - https://www.insee.fr

---

**Built with Next.js 14 App Router + Swagger UI + Real French Public Data** 🇫🇷
