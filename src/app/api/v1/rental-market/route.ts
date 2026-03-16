import { NextResponse } from 'next/server'

const BDM_BASE = 'https://api.insee.fr/series/BDM/V1/data/SERIES_BDM'

// IRL — Indice de Référence des Loyers, France entière (base Q4 2002 = 100)
// INSEE BDM series 001515333
const IRL_SERIES = '001515333'

// ── BDM XML parser (all observations, not just last) ─────────────────────────

function parseBdmTimeseries(xml: string): Array<{ period: string; value: number }> {
  const results: Array<{ period: string; value: number }> = []
  for (const m of xml.matchAll(/<Obs\s([^/]*)\//g)) {
    const attrs: Record<string, string> = {}
    for (const a of m[1].matchAll(/(\w+)="([^"]*)"/g)) attrs[a[1]] = a[2]
    if (attrs.TIME_PERIOD && attrs.OBS_VALUE && !isNaN(parseFloat(attrs.OBS_VALUE))) {
      results.push({ period: attrs.TIME_PERIOD, value: parseFloat(attrs.OBS_VALUE) })
    }
  }
  return results.sort((a, b) => a.period.localeCompare(b.period))
}

// ── IRL fetcher ───────────────────────────────────────────────────────────────

async function fetchIRL(): Promise<Array<{ period: string; value: number }>> {
  try {
    const res = await fetch(
      `${BDM_BASE}/${IRL_SERIES}?lastNObservations=28`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return []
    const xml = await res.text()
    return parseBdmTimeseries(xml)
  } catch {
    return []
  }
}

// ── Nantes median rent — data.gouv.fr "Carte des loyers" ────────────────────

async function fetchNantesLoyer(): Promise<{ rentPerM2: number; year: number; source: string } | null> {
  try {
    const metaRes = await fetch(
      'https://www.data.gouv.fr/api/1/datasets/5fbbff4b8a31ca6a23b3cef4/',
      { next: { revalidate: 86400 } },
    )
    if (!metaRes.ok) return null
    const meta = await metaRes.json()

    // Find most recent CSV resource
    const resources = (meta.resources ?? []) as Array<{
      format?: string; url?: string; created_at?: string; title?: string
    }>
    const csvResource = resources
      .filter(r => r.format?.toLowerCase() === 'csv' || r.url?.endsWith('.csv'))
      .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
      .at(0)

    if (!csvResource?.url) return null

    const csvRes = await fetch(csvResource.url, { next: { revalidate: 86400 } })
    if (!csvRes.ok) return null
    const csv = await csvRes.text()

    const lines = csv.split('\n').filter(l => l.trim())
    if (lines.length < 2) return null

    const sep = lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, '').toLowerCase())

    // Match Nantes by name — exclude "Nantes-Nord", "Saint-…-Nantes", etc.
    const nantesRow = lines.slice(1).find(line => {
      const cols = line.split(sep)
      const nameCol = cols[headers.indexOf('ville')] ?? cols[2] ?? ''
      const cleaned = nameCol.replace(/"/g, '').trim().toLowerCase()
      return cleaned === 'nantes'
    })
    if (!nantesRow) return null

    const cols = nantesRow.split(sep).map(c => c.trim().replace(/"/g, ''))
    const rowObj: Record<string, string> = {}
    headers.forEach((h, i) => { rowObj[h] = cols[i] ?? '' })

    const rentM2 = parseFloat(
      rowObj['loypredm2'] ?? rowObj['loyer_m2'] ?? rowObj['loyernonnulpredm2'] ?? '',
    )
    if (isNaN(rentM2) || rentM2 <= 0) return null

    const year = parseInt(csvResource.created_at?.slice(0, 4) ?? '') || new Date().getFullYear() - 1
    return { rentPerM2: Math.round(rentM2 * 10) / 10, year, source: 'Carte des loyers — data.gouv.fr' }
  } catch {
    return null
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  const [irl, nantesLoyer] = await Promise.all([fetchIRL(), fetchNantesLoyer()])
  return NextResponse.json({ success: true, irl, nantesLoyer })
}
