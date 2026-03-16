import { NextResponse } from 'next/server'

// DARES "Emplois vacants" dataset — seasonally adjusted, by NAF sector
// Sector J = Information et communication (includes J62 Activités informatiques)
const DARES_BASE = 'https://data.dares.travail-emploi.gouv.fr/api/explore/v2.1/catalog/datasets'

export type VacantJobsPoint = {
  date: string         // e.g. "2024-T1"
  vacancyRate: number  // % of unfilled positions in IT sector
}

async function fetchVacantJobs(): Promise<VacantJobsPoint[]> {
  try {
    const params = new URLSearchParams({
      where: 'code_naf like "J%" AND type_de_donnees = "cvs-cjo" AND type_d_emplois_vacants = "Inoccupés"',
      limit: '200',
      order_by: 'date ASC',
      select: 'date,part_selon_le_type_d_emplois_vacants_en',
    })

    const res = await fetch(
      `${DARES_BASE}/dares_emploivacants_cvs_typevacance/records?${params}`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return []
    const json = await res.json()

    const records = (json.results ?? json.records ?? []) as Array<{
      date?: string
      part_selon_le_type_d_emplois_vacants_en?: number | null
    }>

    // Aggregate by quarter (average across NAF sub-sectors within J)
    const byQuarter = new Map<string, number[]>()
    for (const r of records) {
      if (!r.date || r.part_selon_le_type_d_emplois_vacants_en == null) continue
      const quarter = r.date
      if (!byQuarter.has(quarter)) byQuarter.set(quarter, [])
      byQuarter.get(quarter)!.push(r.part_selon_le_type_d_emplois_vacants_en)
    }

    return Array.from(byQuarter.entries())
      .map(([date, vals]) => ({
        date,
        vacancyRate: Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

export async function GET() {
  const vacantJobs = await fetchVacantJobs()
  return NextResponse.json({ success: true, vacantJobs })
}
