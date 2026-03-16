import { NextResponse } from 'next/server'

const ECB_BASE = 'https://data-api.ecb.europa.eu/service/data'

// ── SDMX-JSON parser ──────────────────────────────────────────────────────────

function parseSDMX(json: any): Array<{ date: string; value: number }> {
  try {
    const dataset = json.dataSets?.[0]
    if (!dataset) return []

    // Find the time dimension in observation dimensions
    const obsDimensions: any[] = json.structure?.dimensions?.observation ?? []
    const timeDim = obsDimensions.find(
      (d: any) => (d.id ?? '').includes('TIME') || (d.name ?? '').toLowerCase().includes('time'),
    )
    if (!timeDim?.values?.length) return []

    const dates: string[] = timeDim.values.map((v: any) => v.id ?? v.name ?? '')

    // First series
    const seriesKey = Object.keys(dataset.series ?? {})[0]
    if (!seriesKey) return []

    const observations: Record<string, any[]> = dataset.series[seriesKey]?.observations ?? {}

    return Object.entries(observations)
      .map(([idx, obs]) => {
        const i = parseInt(idx)
        const val = Array.isArray(obs) ? obs[0] : obs
        if (val === null || val === undefined || isNaN(Number(val))) return null
        return { date: dates[i] ?? '', value: Number(val) }
      })
      .filter((p): p is { date: string; value: number } => p !== null && p.date !== '')
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

// Aggregate daily/irregular series to monthly (last value of each month)
function toMonthly(series: Array<{ date: string; value: number }>): Array<{ date: string; value: number }> {
  const byMonth = new Map<string, number>()
  for (const p of series) {
    const month = p.date.slice(0, 7) // YYYY-MM
    byMonth.set(month, p.value)      // last value wins (chronological sort above)
  }
  return Array.from(byMonth.entries())
    .map(([date, value]) => ({ date, value: Math.round(value * 1000) / 1000 }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// ── ECB fetchers ──────────────────────────────────────────────────────────────

async function fetchECBSeries(path: string): Promise<Array<{ date: string; value: number }>> {
  try {
    const url = `${ECB_BASE}/${path}?format=jsondata&startPeriod=2014-01-01`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return toMonthly(parseSDMX(json))
  } catch {
    return []
  }
}

// ECB Deposit Facility Rate (DFR) — the headline policy rate since 2022
async function fetchDFR() {
  return fetchECBSeries('FM/B.U2.EUR.4F.KR.DFR.LEV')
}

// ECB Main Refinancing Operations rate (MRO)
async function fetchMRO() {
  return fetchECBSeries('FM/B.U2.EUR.4F.KR.MRR_FR.LEV')
}

// French OAT 10-year bond yield (long-term sovereign rate)
async function fetchOAT10() {
  return fetchECBSeries('IRS/M.FR.L.L40.CI.0.EUR.N.Z')
}

// Euribor 3-month (variable mortgage reference in France)
async function fetchEuribor3M() {
  return fetchECBSeries('FM/M.U2.EUR.RT0.MM.EURIBOR3MD_.HSTA')
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const [dfr, mro, oat10, euribor3m] = await Promise.all([
    fetchDFR(), fetchMRO(), fetchOAT10(), fetchEuribor3M(),
  ])
  return NextResponse.json({ success: true, dfr, mro, oat10, euribor3m })
}
