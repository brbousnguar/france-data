# nantes-public-data-dashboard

Next.js 14 App Router + TypeScript + Tailwind + Recharts starter for the France Public Data Lab.

Features included:
- App Router layout (src/app)
- Two dashboards: `nantes-10-years` and `cost-of-life`
- Components: Navbar, PageHeader, StatCard, ChartCard, LoadingSkeleton, ErrorState
- Small lib helpers and mocked API using `zod`

Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Notes
- The project contains mocked data in `src/lib/api.ts`.
- Recharts is used on client components. Charts are rendered inside `ChartCard`.
- If you haven't installed Node modules yet, TypeScript/IDE may show missing types until you run `npm install`.
- **NEW:** Robust data layer with `fetchJson`, caching, error handling, and French formatting. See [DATA_LAYER.md](./DATA_LAYER.md) for details.

Next steps (suggested)
- Run `npm install` then `npm run dev` and open http://localhost:3000
- Review the data layer architecture in [DATA_LAYER.md](./DATA_LAYER.md)
- Replace mocked data with real API endpoints in `src/lib/api.ts`
- Add additional tests and monitoring if needed
