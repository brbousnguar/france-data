/**
 * Personal Inflation — spending-weighted CPI calculator
 *
 * The official CPI is a weighted average of all consumption categories
 * for a representative French household. Your actual inflation depends
 * on how you personally allocate your spending.
 *
 * Example: spending 25% on food (vs. ~13% national average) and 0% on
 * transport (vs. ~15% national average) produces a different inflation rate.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CategoryId = 'food' | 'housing' | 'transport' | 'tech' | 'recreation' | 'restaurants'

export type SpendingCategory = {
  id: CategoryId
  label: string
  coicop: string
  icon: string
  defaultWeight: number   // % of monthly budget (user-specific default)
  nationalWeight: number  // % used by INSEE for the official CPI basket
  description: string
}

export type InflationSeries = Array<{ date: string; value: number }>
export type CPIData = Record<string, InflationSeries>

export type PersonalInflationPoint = {
  date: string
  official: number
  personal: number
  gap: number  // personal - official
}

// ── Category definitions ──────────────────────────────────────────────────────
// National weights from INSEE CPI basket (2022 methodology)
// User defaults tailored to profile: no car, high food & tech, Nantes rent 700€/net ~2759€

export const CATEGORIES: SpendingCategory[] = [
  {
    id: 'food',
    label: 'Alimentation',
    coicop: '01',
    icon: '🛒',
    defaultWeight: 25,
    nationalWeight: 13,
    description: 'Courses alimentaires, supermarché, épicerie',
  },
  {
    id: 'housing',
    label: 'Logement / Énergie',
    coicop: '04',
    icon: '🏠',
    defaultWeight: 27,
    nationalWeight: 14,
    description: 'Loyer, charges, électricité, gaz, eau',
  },
  {
    id: 'transport',
    label: 'Transport',
    coicop: '07',
    icon: '🚌',
    defaultWeight: 5,
    nationalWeight: 15,
    description: 'TAN (abonnement), trains, taxis — pas de voiture',
  },
  {
    id: 'tech',
    label: 'Communication / Tech',
    coicop: '08',
    icon: '📱',
    defaultWeight: 8,
    nationalWeight: 3,
    description: 'Téléphone, internet, abonnements numériques',
  },
  {
    id: 'recreation',
    label: 'Loisirs / Culture / Électronique',
    coicop: '09',
    icon: '🎮',
    defaultWeight: 15,
    nationalWeight: 9,
    description: 'Matériel informatique, jeux, streaming, sorties culturelles',
  },
  {
    id: 'restaurants',
    label: 'Restaurants / Hôtels',
    coicop: '11',
    icon: '🍽️',
    defaultWeight: 8,
    nationalWeight: 7,
    description: 'Restaurants, cafés, sorties repas',
  },
]

// "Autres" weight = 100 - sum of above (uses general CPI as proxy)
export function computeOtherWeight(weights: Record<CategoryId, number>): number {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0)
  return Math.max(0, 100 - sum)
}

// ── Storage ───────────────────────────────────────────────────────────────────

const WEIGHTS_KEY = 'fdl-inflation-weights'

export function loadWeights(): Record<CategoryId, number> {
  if (typeof window === 'undefined') return defaultWeights()
  try {
    const raw = localStorage.getItem(WEIGHTS_KEY)
    return raw ? JSON.parse(raw) : defaultWeights()
  } catch {
    return defaultWeights()
  }
}

export function saveWeights(w: Record<CategoryId, number>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(w))
}

export function defaultWeights(): Record<CategoryId, number> {
  return Object.fromEntries(CATEGORIES.map(c => [c.id, c.defaultWeight])) as Record<CategoryId, number>
}

export function nationalWeights(): Record<CategoryId, number> {
  return Object.fromEntries(CATEGORIES.map(c => [c.id, c.nationalWeight])) as Record<CategoryId, number>
}

// ── Weighted inflation calculation ────────────────────────────────────────────

/**
 * Compute personal inflation series from spending weights and per-category CPI.
 * Formula: personal_rate(t) = Σ(weight_i × rate_i(t)) / 100
 * "Autres" uses the general CPI (COICOP 00) at its residual weight.
 */
export function computePersonalInflation(
  weights: Record<CategoryId, number>,
  cpiData: CPIData,
): PersonalInflationPoint[] {
  const general = cpiData['00'] ?? []
  if (general.length === 0) return []

  const otherWeight = computeOtherWeight(weights)

  const coicopMap: Record<CategoryId, string> = {
    food: '01', housing: '04', transport: '07',
    tech: '08', recreation: '09', restaurants: '11',
  }

  return general.map((gPoint, i) => {
    let weightedSum = gPoint.value * otherWeight
    let totalWeight = otherWeight

    for (const cat of CATEGORIES) {
      const w = weights[cat.id] ?? 0
      if (w <= 0) continue
      const series = cpiData[coicopMap[cat.id]] ?? []
      const point = series[i]
      if (!point || point.date !== gPoint.date) continue
      weightedSum += w * point.value
      totalWeight += w
    }

    const personal = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : gPoint.value
    return {
      date: gPoint.date,
      official: gPoint.value,
      personal,
      gap: Math.round((personal - gPoint.value) * 10) / 10,
    }
  })
}

// ── KPIs ──────────────────────────────────────────────────────────────────────

export type PersonalInflationKPIs = {
  personalToday: number
  officialToday: number
  gap: number
  avgPersonal12m: number
  avgOfficial12m: number
  mostExpensiveCategory: { label: string; value: number } | null
}

export function computePersonalKPIs(
  series: PersonalInflationPoint[],
  weights: Record<CategoryId, number>,
  cpiData: CPIData,
): PersonalInflationKPIs {
  const empty: PersonalInflationKPIs = {
    personalToday: 0, officialToday: 0, gap: 0,
    avgPersonal12m: 0, avgOfficial12m: 0, mostExpensiveCategory: null,
  }
  if (series.length === 0) return empty

  const latest = series[series.length - 1]
  const last12 = series.slice(-12)
  const avgPersonal12m = Math.round(last12.reduce((s, p) => s + p.personal, 0) / last12.length * 10) / 10
  const avgOfficial12m = Math.round(last12.reduce((s, p) => s + p.official, 0) / last12.length * 10) / 10

  // Find category with highest current inflation weighted by user spending
  const coicopMap: Record<CategoryId, string> = {
    food: '01', housing: '04', transport: '07',
    tech: '08', recreation: '09', restaurants: '11',
  }
  let mostExpensive: { label: string; value: number } | null = null
  for (const cat of CATEGORIES) {
    const w = weights[cat.id] ?? 0
    if (w <= 0) continue
    const series = cpiData[coicopMap[cat.id]] ?? []
    const last = series[series.length - 1]
    if (!last) continue
    if (!mostExpensive || last.value > mostExpensive.value) {
      mostExpensive = { label: cat.label, value: last.value }
    }
  }

  return {
    personalToday: latest.personal,
    officialToday: latest.official,
    gap: latest.gap,
    avgPersonal12m,
    avgOfficial12m,
    mostExpensiveCategory: mostExpensive,
  }
}
