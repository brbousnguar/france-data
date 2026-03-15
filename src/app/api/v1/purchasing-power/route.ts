import { NextResponse } from 'next/server'

const MELODI_BASE = 'https://api.insee.fr/melodi/data'

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
  try {
    // Fetch in parallel: general (00), food (01), housing+energy (04)
    const [general, food, housing] = await Promise.all([
      fetchCPICategory('00'),
      fetchCPICategory('01'),
      fetchCPICategory('04'),
    ])

    return NextResponse.json({ success: true, data: { general, food, housing } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
