/**
 * Rental Market — types, IRL calculations, and Nantes reference data
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type IRLPoint = {
  period: string  // YYYY-QN format, e.g. "2024-Q1"
  value: number   // IRL index (base Q4 2002 = 100)
  yoyChange: number | null // Year-on-year % change vs same quarter prev year
}

export type NantesLoyerData = {
  rentPerM2: number
  year: number
  source: string
}

export type RentBenchmark = {
  type: string
  descSurface: string
  medianRentPerM2: number
  medianTotal: number
  year: number
}

// ── Nantes reference benchmarks ───────────────────────────────────────────────
// Source: OLAN (Observatoire des Loyers de l'Agglomération Nantaise) 2023
// & SeLoger/PAP median asking prices for Nantes intra-muros 2023

export const NANTES_BENCHMARKS: RentBenchmark[] = [
  { type: 'Studio / T1',  descSurface: '~30 m²', medianRentPerM2: 19.5, medianTotal: 585,  year: 2023 },
  { type: 'T2',           descSurface: '~45 m²', medianRentPerM2: 16.5, medianTotal: 743,  year: 2023 },
  { type: 'T3',           descSurface: '~65 m²', medianRentPerM2: 14.8, medianTotal: 962,  year: 2023 },
  { type: 'T4+',          descSurface: '~85 m²', medianRentPerM2: 13.5, medianTotal: 1148, year: 2023 },
]

// ── IRL processing ────────────────────────────────────────────────────────────

/**
 * Enrich raw IRL series with year-on-year % change.
 * Since the series is quarterly, compare each point to the point 4 steps back.
 */
export function enrichIRL(raw: Array<{ period: string; value: number }>): IRLPoint[] {
  return raw.map((point, i) => {
    const prev = i >= 4 ? raw[i - 4] : null
    const yoyChange = prev
      ? Math.round(((point.value / prev.value) - 1) * 10000) / 100
      : null
    return { ...point, yoyChange }
  })
}

/**
 * Format a period like "2024-Q1" to French "T1 2024"
 */
export function formatQuarterFR(period: string): string {
  const m = period.match(/(\d{4})-Q(\d)/)
  return m ? `T${m[2]} ${m[1]}` : period
}

// ── Legal rent increase calculator ────────────────────────────────────────────

/**
 * Maximum legal rent increase under French law (IRL-capped).
 *
 * When a lease comes up for renewal, the landlord may increase rent by at most:
 *   (IRL_new / IRL_ref - 1) × 100
 * where:
 *   IRL_ref = IRL of the reference quarter stated in the lease
 *   IRL_new = IRL of the same quarter one year later (most recent applicable)
 *
 * We simplify by using:
 *   IRL_ref = IRL at the user's chosen reference period
 *   IRL_new = latest available IRL
 */
export function computeMaxIncrease(
  currentRent: number,
  irlRef: number,
  irlLatest: number,
): {
  maxIncreasePercent: number
  maxNewRent: number
  absoluteIncrease: number
} {
  const maxIncreasePercent = Math.round(((irlLatest / irlRef) - 1) * 10000) / 100
  const maxNewRent = Math.round(currentRent * (irlLatest / irlRef))
  const absoluteIncrease = maxNewRent - currentRent
  return { maxIncreasePercent, maxNewRent, absoluteIncrease }
}

/**
 * Latest YoY IRL change — the headline figure for rent increases allowed today.
 */
export function getLatestYoY(irl: IRLPoint[]): { value: number; period: string } | null {
  const withYoy = irl.filter(p => p.yoyChange !== null)
  if (withYoy.length === 0) return null
  const last = withYoy[withYoy.length - 1]
  return { value: last.yoyChange!, period: last.period }
}
