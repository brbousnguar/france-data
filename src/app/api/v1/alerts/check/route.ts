import { NextResponse } from 'next/server'
import type { IndicatorSnapshot } from '../../../../../lib/alerts'

const MELODI_BASE = 'https://api.insee.fr/melodi/data'
const BDM_BASE = 'https://api.insee.fr/series/BDM/V1/data/SERIES_BDM'

// ── Shared helpers (mirrored from page.tsx) ────────────────────────────────────

interface MelodiObs {
  dimensions: Record<string, string>
  measures: Record<string, { value: number | null } | null>
}

function extractMelodiValue(obs: MelodiObs): number | null {
  for (const key of Object.keys(obs.measures)) {
    const m = obs.measures[key]
    if (m && m.value !== null && m.value !== undefined) return m.value
  }
  return null
}

function parseBdmLastObs(xml: string): { period: string; value: number } | null {
  const results: Array<{ period: string; value: number }> = []
  for (const m of xml.matchAll(/<Obs\s([^/]*)\//g)) {
    const attrs: Record<string, string> = {}
    for (const a of m[1].matchAll(/(\w+)="([^"]*)"/g)) attrs[a[1]] = a[2]
    if (attrs.TIME_PERIOD && attrs.OBS_VALUE && !isNaN(parseFloat(attrs.OBS_VALUE))) {
      results.push({ period: attrs.TIME_PERIOD, value: parseFloat(attrs.OBS_VALUE) })
    }
  }
  return results.length > 0 ? results[results.length - 1] : null
}

// ── Data fetchers ──────────────────────────────────────────────────────────────

async function fetchInflationLast2(): Promise<{ current: number | null; previous: number | null }> {
  try {
    const url = `${MELODI_BASE}/DS_IPC_PRINC?IND_TYPE=YOY&COICOP_2018=00&PRODUCT_GROUP=_Z&FREQ=M&GEO=2025-FRANCE-FM&startPeriod=2022-01&maxResult=100`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 900 },
    })
    if (!res.ok) return { current: null, previous: null }
    const json = await res.json()
    const points = (json.observations as MelodiObs[])
      .map(o => {
        const date = o.dimensions['TIME_PERIOD']
        const val = extractMelodiValue(o)
        return val !== null ? { date, value: val } : null
      })
      .filter((p): p is { date: string; value: number } => p !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
    return {
      current: points[points.length - 1]?.value ?? null,
      previous: points[points.length - 2]?.value ?? null,
    }
  } catch {
    return { current: null, previous: null }
  }
}

async function fetchUnemployment(): Promise<number | null> {
  try {
    const res = await fetch(`${BDM_BASE}/001688527?lastNObservations=1`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const xml = await res.text()
    return parseBdmLastObs(xml)?.value ?? null
  } catch {
    return null
  }
}

async function fetchGDP(): Promise<number | null> {
  try {
    const res = await fetch(`${BDM_BASE}/010565692?lastNObservations=1`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const xml = await res.text()
    return parseBdmLastObs(xml)?.value ?? null
  } catch {
    return null
  }
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const [infl, unemployment, gdp] = await Promise.all([
      fetchInflationLast2(),
      fetchUnemployment(),
      fetchGDP(),
    ])

    const snapshot: IndicatorSnapshot = {
      inflation: infl.current,
      inflationPrevious: infl.previous,
      unemployment,
      gdp,
      fetchedAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, snapshot })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
