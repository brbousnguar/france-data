import { NextResponse } from 'next/server'

const MELODI_BASE = 'https://api.insee.fr/melodi/data'
const BDM_BASE = 'https://api.insee.fr/series/BDM/V1/data/SERIES_BDM'
const ECB_BASE = 'https://data-api.ecb.europa.eu/service/data'

// ── Shared parsers ────────────────────────────────────────────────────────────

interface MelodiObs {
  dimensions: Record<string, string>
  measures: Record<string, { value: number | null } | null>
}

function extractMelodi(obs: MelodiObs): number | null {
  for (const k of Object.keys(obs.measures)) {
    const m = obs.measures[k]
    if (m && m.value !== null) return m.value
  }
  return null
}

function parseBdmLast(xml: string): { period: string; value: number } | null {
  const results: Array<{ period: string; value: number }> = []
  for (const m of xml.matchAll(/<Obs\s([^/]*)\//g)) {
    const attrs: Record<string, string> = {}
    for (const a of m[1].matchAll(/(\w+)="([^"]*)"/g)) attrs[a[1]] = a[2]
    if (attrs.TIME_PERIOD && attrs.OBS_VALUE && !isNaN(parseFloat(attrs.OBS_VALUE)))
      results.push({ period: attrs.TIME_PERIOD, value: parseFloat(attrs.OBS_VALUE) })
  }
  return results.at(-1) ?? null
}

function parseSDMXLast(json: any): number | null {
  try {
    const dataset = json.dataSets?.[0]
    const timeDim = json.structure?.dimensions?.observation?.find(
      (d: any) => (d.id ?? '').includes('TIME') || (d.name ?? '').toLowerCase().includes('time'),
    )
    if (!timeDim?.values?.length || !dataset) return null
    const seriesKey = Object.keys(dataset.series ?? {})[0]
    if (!seriesKey) return null
    const obs: Record<string, any[]> = dataset.series[seriesKey]?.observations ?? {}
    const lastIdx = String(Math.max(...Object.keys(obs).map(Number)))
    const val = obs[lastIdx]?.[0]
    return val !== null && val !== undefined ? Number(val) : null
  } catch { return null }
}

// ── Individual fetchers ───────────────────────────────────────────────────────

async function fetchInflationLast2(): Promise<{ current: number | null; previous: number | null }> {
  try {
    const res = await fetch(
      `${MELODI_BASE}/DS_IPC_PRINC?IND_TYPE=YOY&COICOP_2018=00&PRODUCT_GROUP=_Z&FREQ=M&GEO=2025-FRANCE-FM&startPeriod=2022-01&maxResult=100`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 900 } },
    )
    if (!res.ok) return { current: null, previous: null }
    const json = await res.json()
    const pts = (json.observations as MelodiObs[])
      .map(o => ({ date: o.dimensions['TIME_PERIOD'], value: extractMelodi(o) }))
      .filter((p): p is { date: string; value: number } => p.value !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
    return { current: pts.at(-1)?.value ?? null, previous: pts.at(-2)?.value ?? null }
  } catch { return { current: null, previous: null } }
}

async function fetchBDM(seriesId: string): Promise<number | null> {
  try {
    const res = await fetch(`${BDM_BASE}/${seriesId}?lastNObservations=1`, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    return parseBdmLast(await res.text())?.value ?? null
  } catch { return null }
}

async function fetchBDMTimeseries(seriesId: string, n: number): Promise<Array<{ period: string; value: number }>> {
  try {
    const res = await fetch(`${BDM_BASE}/${seriesId}?lastNObservations=${n}`, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const xml = await res.text()
    const results: Array<{ period: string; value: number }> = []
    for (const m of xml.matchAll(/<Obs\s([^/]*)\//g)) {
      const attrs: Record<string, string> = {}
      for (const a of m[1].matchAll(/(\w+)="([^"]*)"/g)) attrs[a[1]] = a[2]
      if (attrs.TIME_PERIOD && attrs.OBS_VALUE && !isNaN(parseFloat(attrs.OBS_VALUE)))
        results.push({ period: attrs.TIME_PERIOD, value: parseFloat(attrs.OBS_VALUE) })
    }
    return results.sort((a, b) => a.period.localeCompare(b.period))
  } catch { return [] }
}

async function fetchECBRate(path: string): Promise<number | null> {
  try {
    const res = await fetch(`${ECB_BASE}/${path}?format=jsondata&startPeriod=2024-01-01`, {
      headers: { Accept: 'application/json' }, next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    return parseSDMXLast(await res.json())
  } catch { return null }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const [infl, unemployment, gdp, irlSeries, dfr, oat10] = await Promise.all([
    fetchInflationLast2(),
    fetchBDM('001688527'),              // Unemployment rate
    fetchBDM('010565692'),              // GDP quarterly growth
    fetchBDMTimeseries('001515333', 8), // IRL last 8 quarters
    fetchECBRate('FM/B.U2.EUR.4F.KR.DFR.LEV'),
    fetchECBRate('IRS/M.FR.L.L40.CI.0.EUR.N.Z'),
  ])

  // Compute IRL YoY (last value vs. 4 quarters back)
  const irlLatest = irlSeries.at(-1) ?? null
  const irlPrev4 = irlSeries.at(-5) ?? null
  const irlYoY = irlLatest && irlPrev4
    ? Math.round(((irlLatest.value / irlPrev4.value) - 1) * 10000) / 100
    : null

  return NextResponse.json({
    success: true,
    fetchedAt: new Date().toISOString(),
    inflation: infl.current,
    inflationPrevious: infl.previous,
    unemployment,
    gdp,
    irlLatest: irlLatest?.value ?? null,
    irlPeriod: irlLatest?.period ?? null,
    irlYoY,
    dfr,
    oat10,
    mortgageRateEstimate: oat10 ? Math.round((oat10 + 1.35) * 100) / 100 : null,
  })
}
