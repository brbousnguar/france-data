import { NextResponse } from 'next/server'

const MELODI_BASE = 'https://api.insee.fr/melodi/data'

// COICOP 2018 categories fetched
// 00 = General | 01 = Food | 04 = Housing+energy | 07 = Transport
// 08 = Communication | 09 = Recreation+culture (incl. electronics) | 11 = Restaurants
const CATEGORIES = ['00', '01', '04', '07', '08', '09', '11'] as const

interface MelodiObs {
  dimensions: Record<string, string>
  measures: Record<string, { value: number | null } | null>
}

function extractValue(obs: MelodiObs): number | null {
  for (const key of Object.keys(obs.measures)) {
    const m = obs.measures[key]
    if (m && m.value !== null && m.value !== undefined) return m.value
  }
  return null
}

async function fetchCPICategory(coicop: string): Promise<Array<{ date: string; value: number }>> {
  try {
    const params = `IND_TYPE=YOY&COICOP_2018=${coicop}&PRODUCT_GROUP=_Z&FREQ=M&GEO=2025-FRANCE-FM&startPeriod=2022-01&maxResult=100`
    const res = await fetch(`${MELODI_BASE}/DS_IPC_PRINC?${params}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.observations as MelodiObs[])
      .map(o => {
        const date = o.dimensions['TIME_PERIOD']
        const value = extractValue(o)
        return value !== null ? { date, value } : null
      })
      .filter((p): p is { date: string; value: number } => p !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

export async function GET() {
  const results = await Promise.all(CATEGORIES.map(c => fetchCPICategory(c)))
  const data: Record<string, Array<{ date: string; value: number }>> = {}
  CATEGORIES.forEach((c, i) => { data[c] = results[i] })
  return NextResponse.json({ success: true, data })
}
