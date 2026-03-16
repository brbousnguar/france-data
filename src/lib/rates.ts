/**
 * Interest Rates — types, ECB key events, and mortgage calculator
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type RatePoint = { date: string; value: number }

export type RatesData = {
  dfr: RatePoint[]      // ECB Deposit Facility Rate
  mro: RatePoint[]      // ECB Main Refinancing Operations rate
  oat10: RatePoint[]    // French OAT 10-year bond yield
  euribor3m: RatePoint[] // Euribor 3-month
}

// ── ECB key decisions ─────────────────────────────────────────────────────────

export type ECBEvent = {
  date: string   // YYYY-MM
  label: string
  type: 'hike' | 'cut' | 'hold' | 'milestone'
}

export const ECB_KEY_EVENTS: ECBEvent[] = [
  { date: '2022-07', label: '1ère hausse depuis 2011 (+50 pb)', type: 'hike' },
  { date: '2022-09', label: '+75 pb (record)', type: 'hike' },
  { date: '2023-07', label: 'DFR à 3,75 %', type: 'hike' },
  { date: '2023-09', label: 'DFR à 4,00 % — pic du cycle', type: 'milestone' },
  { date: '2024-06', label: '1ère baisse (-25 pb)', type: 'cut' },
  { date: '2024-12', label: 'DFR à 3,00 %', type: 'cut' },
  { date: '2025-01', label: 'DFR à 2,75 %', type: 'cut' },
]

// ── Impact context for the user ──────────────────────────────────────────────

export type RateImpact = {
  title: string
  detail: string
  icon: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

export function getRateImpacts(dfrCurrent: number | null): RateImpact[] {
  const r = dfrCurrent ?? 2.75
  const livretA = r > 3 ? 3.0 : r > 1.5 ? 3.0 : 2.4 // simplified proxy
  return [
    {
      title: 'Livret A & épargne',
      detail: `La Banque de France indexe le taux du Livret A sur l'Euribor 3M et l'inflation. Avec le DFR à ${r.toFixed(2)} %, le Livret A devrait rester autour de ${livretA.toFixed(1)} % en 2025. Votre épargne court terme est protégée.`,
      icon: '🏦',
      sentiment: r >= 2 ? 'positive' : 'neutral',
    },
    {
      title: 'Crédit immobilier',
      detail: `Les taux de crédit immobilier fixes sur 20 ans suivent l'OAT 10 ans + marge bancaire (~1,2–1,5 %). Avec l'OAT 10 ans autour de 3,3 %, un crédit en 2025 coûte ~4,5–4,8 % vs. ~1,1 % en 2021. L'achat d'un T2 à Nantes (220 K€) coûte ~500 €/mois de plus qu'en 2021.`,
      icon: '🏠',
      sentiment: r > 3 ? 'negative' : r > 1.5 ? 'neutral' : 'positive',
    },
    {
      title: "Inflation & pouvoir d'achat",
      detail: `La remontée des taux BCE (2022–2023) a contribué à faire baisser l'inflation en France de ~6 % (2022) vers ~1–2 % (2025). Votre pouvoir d'achat se stabilise. La BCE vise 2 % d'inflation à moyen terme.`,
      icon: '📉',
      sentiment: 'positive',
    },
    {
      title: 'Marché du travail IT',
      detail: `Des taux élevés ralentissent l'investissement des entreprises et peuvent freiner les recrutements IT. La normalisation des taux en 2024–2025 devrait progressivement relancer les projets de transformation digitale.`,
      icon: '💻',
      sentiment: 'neutral',
    },
  ]
}

// ── Mortgage calculator ───────────────────────────────────────────────────────

export type MortgageResult = {
  monthlyPayment: number
  totalCost: number
  totalInterest: number
  annualRate: number
}

export function computeMortgage(
  propertyPrice: number,
  downPaymentPct: number,  // 0–100
  durationYears: number,
  annualRatePct: number,
): MortgageResult {
  const principal = propertyPrice * (1 - downPaymentPct / 100)
  const monthlyRate = annualRatePct / 100 / 12
  const n = durationYears * 12

  let monthlyPayment: number
  if (monthlyRate === 0) {
    monthlyPayment = principal / n
  } else {
    monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
  }

  const totalCost = monthlyPayment * n
  const totalInterest = totalCost - principal

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalCost: Math.round(totalCost),
    totalInterest: Math.round(totalInterest),
    annualRate: annualRatePct,
  }
}

// Estimate current French mortgage rate from OAT 10 ans + spread
export function estimateMortgageRate(oat10: number | null): number {
  const oat = oat10 ?? 3.3
  return Math.round((oat + 1.35) * 100) / 100  // typical 2025 bank spread
}
