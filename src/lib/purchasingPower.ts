/**
 * Purchasing Power — profile storage and calculation engine
 *
 * Converts YoY CPI timeseries into a cumulative price index,
 * then deflates nominal salary to show real purchasing power erosion.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type UserProfile = {
  netMonthly: number    // Net monthly salary in €
  rentMonthly: number   // Monthly rent in €
  foodMonthly: number   // Monthly food budget in €
  techMonthly: number   // Monthly tech budget in €
}

export type InflationSeries = Array<{ date: string; value: number }>

export type PurchasingPowerPoint = {
  date: string
  nominal: number       // Nominal net salary (flat)
  real: number          // Real value deflated by CPI
  loss: number          // Nominal - Real (always ≥ 0)
  priceIndex: number    // Price index (base Jan 2022 = 100)
}

export type CategoryImpactPoint = {
  date: string
  general: number | null
  food: number | null
  housing: number | null
}

export type PurchasingPowerKPIs = {
  realValueToday: number        // Real value of monthly salary today
  monthlyLoss: number           // Monthly purchasing power loss vs base
  cumulativeLoss: number        // Total € lost since base
  rentBurden: number            // Rent as % of net monthly
  foodInflationCumul: number    // Cumulative food inflation since base (%)
  generalInflationCumul: number // Cumulative general inflation since base (%)
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PROFILE_KEY = 'fdl-user-profile'

// Default profile pre-filled for the user (43K gross ≈ 2 759€ net/month)
export const DEFAULT_PROFILE: UserProfile = {
  netMonthly: 2759,
  rentMonthly: 700,
  foodMonthly: 400,
  techMonthly: 200,
}

// ── Profile storage ────────────────────────────────────────────────────────────

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// ── Price index builder ────────────────────────────────────────────────────────

/**
 * Convert YoY inflation series into a cumulative price index.
 *
 * Method:
 * - Base: months 0–11 = index 100 (no prior data to chain from)
 * - From month 12 onwards: index[i] = index[i-12] × (1 + yoy[i]/100)
 *
 * This chains year-on-year rates to get a price level relative to the first
 * month in the series (typically Jan 2022).
 */
export function buildPriceIndex(series: InflationSeries): number[] {
  const index = new Array(series.length).fill(100)
  for (let i = 12; i < series.length; i++) {
    index[i] = index[i - 12] * (1 + series[i].value / 100)
  }
  return index
}

// ── Purchasing power calculation ───────────────────────────────────────────────

export function computePurchasingPower(
  profile: UserProfile,
  generalCPI: InflationSeries,
): PurchasingPowerPoint[] {
  const priceIndex = buildPriceIndex(generalCPI)

  return generalCPI.map((point, i) => {
    const idx = priceIndex[i]
    const real = Math.round((profile.netMonthly / (idx / 100)) * 10) / 10
    const loss = Math.round((profile.netMonthly - real) * 10) / 10
    return {
      date: point.date,
      nominal: profile.netMonthly,
      real,
      loss: Math.max(0, loss),
      priceIndex: Math.round(idx * 10) / 10,
    }
  })
}

// ── Category comparison ────────────────────────────────────────────────────────

export function mergeCategories(
  general: InflationSeries,
  food: InflationSeries,
  housing: InflationSeries,
): CategoryImpactPoint[] {
  const foodMap = new Map(food.map(p => [p.date, p.value]))
  const housingMap = new Map(housing.map(p => [p.date, p.value]))

  return general.map(p => ({
    date: p.date,
    general: p.value,
    food: foodMap.get(p.date) ?? null,
    housing: housingMap.get(p.date) ?? null,
  }))
}

// ── KPI computation ────────────────────────────────────────────────────────────

export function computeKPIs(
  profile: UserProfile,
  ppSeries: PurchasingPowerPoint[],
  foodCPI: InflationSeries,
  generalCPI: InflationSeries,
): PurchasingPowerKPIs {
  if (ppSeries.length === 0) {
    return {
      realValueToday: profile.netMonthly,
      monthlyLoss: 0,
      cumulativeLoss: 0,
      rentBurden: Math.round((profile.rentMonthly / profile.netMonthly) * 1000) / 10,
      foodInflationCumul: 0,
      generalInflationCumul: 0,
    }
  }

  const latest = ppSeries[ppSeries.length - 1]

  // Cumulative loss = sum of all monthly losses from month 12 onwards
  const cumulativeLoss = Math.round(
    ppSeries.slice(12).reduce((sum, p) => sum + p.loss, 0),
  )

  // Cumulative food inflation using the same price index method
  const foodIndex = buildPriceIndex(foodCPI)
  const generalIndex = buildPriceIndex(generalCPI)
  const foodInflationCumul =
    foodIndex.length > 0
      ? Math.round((foodIndex[foodIndex.length - 1] - 100) * 10) / 10
      : 0
  const generalInflationCumul =
    generalIndex.length > 0
      ? Math.round((generalIndex[generalIndex.length - 1] - 100) * 10) / 10
      : 0

  return {
    realValueToday: latest.real,
    monthlyLoss: latest.loss,
    cumulativeLoss,
    rentBurden: Math.round((profile.rentMonthly / profile.netMonthly) * 1000) / 10,
    foodInflationCumul,
    generalInflationCumul,
  }
}

// ── Gross → net estimator ─────────────────────────────────────────────────────

/**
 * Rough estimate for a single person on a CDI in France.
 * Employee social charges ~23%, income tax ~8% for this bracket.
 * This is an approximation — the user should override with their actual net.
 */
export function estimateNetMonthly(grossAnnual: number): number {
  return Math.round((grossAnnual / 12) * 0.77)
}
