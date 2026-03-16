/**
 * Dashboard — personal profile, health score, and module status computation
 */

import { loadProfile } from './purchasingPower'
import { loadEvents, countUnread, loadRules } from './alerts'
import { loadWeights, CATEGORIES, computePersonalInflation, type CPIData } from './personalInflation'
import { ANNUAL_SMIC_FOR_CHART } from './smicSalary'

// ── Extended profile ──────────────────────────────────────────────────────────

export type DashboardProfile = {
  displayName: string
  jobTitle: string
  company: string
  city: string
  grossAnnual: number
}

const PROFILE_KEY = 'fdl-dashboard-profile'

export const DEFAULT_DASHBOARD_PROFILE: DashboardProfile = {
  displayName: 'Mon profil',
  jobTitle: 'Intégrateur MuleSoft',
  company: 'SQLI',
  city: 'Nantes',
  grossAnnual: 43000,
}

export function loadDashboardProfile(): DashboardProfile {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_PROFILE
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? { ...DEFAULT_DASHBOARD_PROFILE, ...JSON.parse(raw) } : DEFAULT_DASHBOARD_PROFILE
  } catch { return DEFAULT_DASHBOARD_PROFILE }
}

export function saveDashboardProfile(p: DashboardProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
}

// ── Module card definition ────────────────────────────────────────────────────

export type ModuleStatus = 'green' | 'orange' | 'red' | 'neutral'

export type ModuleCard = {
  id: string
  label: string
  icon: string
  href: string
  kpi: string
  sub: string
  status: ModuleStatus
  statusLabel: string
}

// ── Health item ───────────────────────────────────────────────────────────────

export type HealthItem = {
  label: string
  status: ModuleStatus
  detail: string
}

export type HealthScore = {
  status: ModuleStatus
  headline: string
  summary: string
  items: HealthItem[]
}

// ── Dashboard snapshot (live data passed from API) ────────────────────────────

export type DashboardSnapshot = {
  fetchedAt: string
  inflation: number | null
  inflationPrevious: number | null
  unemployment: number | null
  gdp: number | null
  irlLatest: number | null
  irlPeriod: string | null
  irlYoY: number | null
  dfr: number | null
  oat10: number | null
  mortgageRateEstimate: number | null
}

// ── Computation ───────────────────────────────────────────────────────────────

function fmt(v: number | null, suffix = ' %', decimals = 1): string {
  return v !== null ? v.toFixed(decimals).replace('.', ',') + suffix : '—'
}

export function computeDashboardModules(
  snap: DashboardSnapshot,
  cpiData: CPIData,
): ModuleCard[] {
  const profile = loadProfile()
  const dpProfile = loadDashboardProfile()
  const events = loadEvents()
  const unread = countUnread(events)
  const weights = loadWeights()
  const grossAnnual = dpProfile.grossAnnual
  const grossMonthly = grossAnnual / 12

  // Personal inflation
  const personalSeries = Object.keys(cpiData).length > 0
    ? computePersonalInflation(weights, cpiData)
    : []
  const personalInflation = personalSeries.at(-1)?.personal ?? snap.inflation

  // Purchasing power estimate (simplified: net / cumulative CPI index)
  // We estimate cumulative CPI since 2022 from YoY chain (rough: sum of YoY/12 over months)
  const cumulativeInflEst = snap.inflation !== null ? snap.inflation * 3 / 100 : 0.12
  const realSalary = Math.round(profile.netMonthly / (1 + cumulativeInflEst))
  const monthlyLoss = profile.netMonthly - realSalary

  // SMIC multiple
  const latestSMIC = ANNUAL_SMIC_FOR_CHART[ANNUAL_SMIC_FOR_CHART.length - 1].smicMensuel
  const smicMultiple = Math.round((grossMonthly / latestSMIC) * 100) / 100

  // Rent burden
  const rentBurden = Math.round((profile.rentMonthly / profile.netMonthly) * 1000) / 10

  // IRL max legal increase
  const irlYoY = snap.irlYoY

  const cards: ModuleCard[] = [
    {
      id: 'purchasing-power',
      label: 'Pouvoir d\'Achat',
      icon: '💰',
      href: '/purchasing-power',
      kpi: fmt(realSalary, ' €', 0),
      sub: `−${monthlyLoss.toLocaleString('fr-FR')} €/mois depuis jan. 2022`,
      status: monthlyLoss > profile.netMonthly * 0.08 ? 'red' : monthlyLoss > profile.netMonthly * 0.04 ? 'orange' : 'green',
      statusLabel: monthlyLoss > profile.netMonthly * 0.08 ? 'Érosion forte' : monthlyLoss > 0 ? 'Légère érosion' : 'Stable',
    },
    {
      id: 'personal-inflation',
      label: 'Mon Inflation',
      icon: '📊',
      href: '/personal-inflation',
      kpi: fmt(personalInflation),
      sub: `vs ${fmt(snap.inflation)} officiel`,
      status: (personalInflation ?? 0) > 4 ? 'red' : (personalInflation ?? 0) > 2 ? 'orange' : 'green',
      statusLabel: (personalInflation ?? 0) > 4 ? 'Inflation élevée' : (personalInflation ?? 0) > 2 ? 'Au-dessus cible' : 'Maîtrisée',
    },
    {
      id: 'cost-of-life',
      label: 'Coût de la Vie',
      icon: '🛒',
      href: '/cost-of-life',
      kpi: fmt(snap.inflation),
      sub: `Chômage : ${fmt(snap.unemployment)} · PIB : ${fmt(snap.gdp)}`,
      status: (snap.inflation ?? 0) > 4 ? 'red' : (snap.inflation ?? 0) > 2 ? 'orange' : 'green',
      statusLabel: (snap.inflation ?? 0) > 4 ? 'Inflation forte' : (snap.inflation ?? 0) > 2 ? 'Au-dessus cible BCE' : 'Proche cible',
    },
    {
      id: 'rental-market',
      label: 'Marché Locatif',
      icon: '🏠',
      href: '/rental-market',
      kpi: `${fmt(irlYoY)} IRL`,
      sub: `Charge loyer : ${rentBurden.toFixed(1).replace('.', ',')} % du net`,
      status: rentBurden > 40 ? 'red' : rentBurden > 33 ? 'orange' : 'green',
      statusLabel: rentBurden > 40 ? 'Taux d\'effort critique' : rentBurden > 33 ? 'Au-dessus seuil 33 %' : 'Taux d\'effort OK',
    },
    {
      id: 'job-market',
      label: 'Emploi Tech',
      icon: '💼',
      href: '/job-market',
      kpi: '43 K€',
      sub: `Médiane MuleSoft confirmé : 53 K€ (−${((53000 - grossAnnual) / 1000).toFixed(0)} K€)`,
      status: grossAnnual < 46000 ? 'orange' : grossAnnual < 53000 ? 'orange' : 'green',
      statusLabel: grossAnnual < 46000 ? 'Sous la fourchette' : 'Sous la médiane',
    },
    {
      id: 'smic-salary',
      label: 'SMIC & Salaires',
      icon: '📈',
      href: '/smic-salary',
      kpi: `×${smicMultiple.toFixed(2).replace('.', ',')} SMIC`,
      sub: `Médiane IT cadres : 52 K€ · écart −${((52000 - grossAnnual) / 1000).toFixed(0)} K€`,
      status: smicMultiple < 2.0 ? 'orange' : smicMultiple < 2.5 ? 'neutral' : 'green',
      statusLabel: smicMultiple < 2.0 ? 'Multiple proche de ×2' : 'Multiple acceptable',
    },
    {
      id: 'rates',
      label: 'Taux & BCE',
      icon: '🏦',
      href: '/rates',
      kpi: fmt(snap.dfr),
      sub: `OAT 10 ans : ${fmt(snap.oat10)} · Immo estimé : ${fmt(snap.mortgageRateEstimate)}`,
      status: (snap.mortgageRateEstimate ?? 0) > 5 ? 'red' : (snap.mortgageRateEstimate ?? 0) > 4 ? 'orange' : 'green',
      statusLabel: (snap.mortgageRateEstimate ?? 0) > 5 ? 'Crédit immo cher' : (snap.mortgageRateEstimate ?? 0) > 4 ? 'Taux élevés' : 'Taux normalisés',
    },
    {
      id: 'alerts',
      label: 'Alertes',
      icon: '🔔',
      href: '/alerts',
      kpi: unread === 0 ? 'RAS' : `${unread} alerte${unread > 1 ? 's' : ''}`,
      sub: `${loadRules().filter(r => r.enabled).length} règles actives`,
      status: unread > 2 ? 'red' : unread > 0 ? 'orange' : 'green',
      statusLabel: unread === 0 ? 'Aucune alerte' : `${unread} non lue${unread > 1 ? 's' : ''}`,
    },
  ]

  return cards
}

export function computeHealthScore(cards: ModuleCard[]): HealthScore {
  const reds = cards.filter(c => c.status === 'red').length
  const oranges = cards.filter(c => c.status === 'orange').length

  const status: ModuleStatus = reds > 0 ? 'red' : oranges >= 2 ? 'orange' : oranges === 1 ? 'orange' : 'green'

  const headlines: Record<ModuleStatus, string> = {
    green: 'Situation économique saine',
    orange: 'Quelques points de vigilance',
    red: 'Alertes économiques actives',
    neutral: 'Situation à surveiller',
  }

  const summaries: Record<ModuleStatus, string> = {
    green: 'Tous vos indicateurs sont dans la zone verte. Continuez à surveiller régulièrement.',
    orange: `${oranges} indicateur${oranges > 1 ? 's' : ''} mérite${oranges > 1 ? 'nt' : ''} votre attention. Consultez les modules concernés.`,
    red: `${reds} indicateur${reds > 1 ? 's' : ''} en zone rouge nécessite${reds > 1 ? 'nt' : ''} une action ou une veille active.`,
    neutral: 'Situation à surveiller régulièrement.',
  }

  const items: HealthItem[] = cards
    .filter(c => c.status !== 'green')
    .map(c => ({
      label: c.label,
      status: c.status,
      detail: c.sub,
    }))

  return {
    status,
    headline: headlines[status],
    summary: summaries[status],
    items,
  }
}

// ── Economic calendar ─────────────────────────────────────────────────────────

export type EcoEvent = {
  date: string
  label: string
  type: 'ecb' | 'insee' | 'smic' | 'other'
}

// Upcoming 2025 dates (static, updated annually)
export const ECO_CALENDAR: EcoEvent[] = [
  { date: '2025-04-17', label: 'Réunion BCE — décision de taux', type: 'ecb' },
  { date: '2025-05-14', label: 'INSEE — Publication IPC avril', type: 'insee' },
  { date: '2025-06-05', label: 'Réunion BCE — décision de taux', type: 'ecb' },
  { date: '2025-06-11', label: 'INSEE — Publication IPC mai', type: 'insee' },
  { date: '2025-07-01', label: 'SMIC — éventuelle revalorisation annuelle', type: 'smic' },
  { date: '2025-07-24', label: 'Réunion BCE — décision de taux', type: 'ecb' },
  { date: '2025-09-11', label: 'Réunion BCE — décision de taux', type: 'ecb' },
  { date: '2025-10-30', label: 'Réunion BCE — décision de taux', type: 'ecb' },
  { date: '2025-12-18', label: 'Réunion BCE — décision de taux', type: 'ecb' },
]

export function getUpcomingEvents(limit = 4): EcoEvent[] {
  const today = new Date().toISOString().slice(0, 10)
  return ECO_CALENDAR
    .filter(e => e.date >= today)
    .slice(0, limit)
}
