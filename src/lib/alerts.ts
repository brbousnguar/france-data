/**
 * Alert System — localStorage-backed rules and event engine
 *
 * Rules define thresholds on economic indicators.
 * Events are fired (and stored) when a threshold is crossed.
 * Storage is entirely client-side (localStorage); no backend required.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type AlertIndicator = 'inflation' | 'inflation_spike' | 'unemployment' | 'gdp'
export type AlertCondition = 'above' | 'below'

export type AlertRule = {
  id: string
  label: string
  indicator: AlertIndicator
  condition: AlertCondition
  threshold: number
  enabled: boolean
  createdAt: string
}

export type AlertEvent = {
  id: string
  ruleId: string
  ruleLabelSnapshot: string
  triggeredAt: string
  value: number
  message: string
  read: boolean
}

export type IndicatorSnapshot = {
  inflation: number | null        // Latest YoY %
  inflationPrevious: number | null // Previous month YoY %
  unemployment: number | null     // Latest quarterly %
  gdp: number | null              // Latest quarterly growth %
  fetchedAt: string               // ISO timestamp
}

// ── Labels ─────────────────────────────────────────────────────────────────────

export const INDICATOR_LABELS: Record<AlertIndicator, string> = {
  inflation: 'Inflation a/a',
  inflation_spike: 'Accélération inflation (variation mensuelle)',
  unemployment: 'Taux de chômage',
  gdp: 'Croissance PIB (trimestrielle)',
}

export const CONDITION_LABELS: Record<AlertCondition, string> = {
  above: 'au-dessus de',
  below: 'en-dessous de',
}

// ── Constants ──────────────────────────────────────────────────────────────────

const RULES_KEY = 'fdl-alert-rules'
const EVENTS_KEY = 'fdl-alert-events'
const MAX_EVENTS = 100

// ── Default rules (tailored to the user's profile) ────────────────────────────

const DEFAULT_RULES: Omit<AlertRule, 'id' | 'createdAt'>[] = [
  {
    label: 'Inflation > 3 %',
    indicator: 'inflation',
    condition: 'above',
    threshold: 3,
    enabled: true,
  },
  {
    label: 'Accélération inflation > 0,5 pt/mois',
    indicator: 'inflation_spike',
    condition: 'above',
    threshold: 0.5,
    enabled: true,
  },
  {
    label: 'Chômage > 8 %',
    indicator: 'unemployment',
    condition: 'above',
    threshold: 8,
    enabled: true,
  },
  {
    label: 'PIB trimestriel < 0 % (récession)',
    indicator: 'gdp',
    condition: 'below',
    threshold: 0,
    enabled: true,
  },
]

// ── ID generator ───────────────────────────────────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ── Rules storage ──────────────────────────────────────────────────────────────

export function loadRules(): AlertRule[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RULES_KEY)
    if (!raw) return initDefaultRules()
    return JSON.parse(raw) as AlertRule[]
  } catch {
    return initDefaultRules()
  }
}

function initDefaultRules(): AlertRule[] {
  const rules: AlertRule[] = DEFAULT_RULES.map(r => ({
    ...r,
    id: uid(),
    createdAt: new Date().toISOString(),
  }))
  saveRules(rules)
  return rules
}

export function saveRules(rules: AlertRule[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(RULES_KEY, JSON.stringify(rules))
}

// ── Events storage ─────────────────────────────────────────────────────────────

export function loadEvents(): AlertEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? (JSON.parse(raw) as AlertEvent[]) : []
  } catch {
    return []
  }
}

export function saveEvents(events: AlertEvent[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
}

export function countUnread(events: AlertEvent[]): number {
  return events.filter(e => !e.read).length
}

// ── Rule evaluation engine ─────────────────────────────────────────────────────

/**
 * Evaluate all enabled rules against a fresh indicator snapshot.
 * Returns only new events (not yet in existingEvents).
 * Deduplication: one event per rule per day.
 */
export function evaluateRules(
  rules: AlertRule[],
  snapshot: IndicatorSnapshot,
  existingEvents: AlertEvent[],
): AlertEvent[] {
  const newEvents: AlertEvent[] = []
  const today = snapshot.fetchedAt.slice(0, 10) // YYYY-MM-DD

  for (const rule of rules) {
    if (!rule.enabled) continue

    let value: number | null = null

    if (rule.indicator === 'inflation') {
      value = snapshot.inflation
    } else if (rule.indicator === 'inflation_spike') {
      if (snapshot.inflation !== null && snapshot.inflationPrevious !== null) {
        value = parseFloat((snapshot.inflation - snapshot.inflationPrevious).toFixed(2))
      }
    } else if (rule.indicator === 'unemployment') {
      value = snapshot.unemployment
    } else if (rule.indicator === 'gdp') {
      value = snapshot.gdp
    }

    if (value === null) continue

    const triggered =
      (rule.condition === 'above' && value > rule.threshold) ||
      (rule.condition === 'below' && value < rule.threshold)

    if (!triggered) continue

    // One alert per rule per day
    if (existingEvents.some(e => e.ruleId === rule.id && e.triggeredAt.startsWith(today))) continue

    const isSpike = rule.indicator === 'inflation_spike'
    const valStr = value.toFixed(1).replace('.', ',') + (isSpike ? ' pt' : ' %')
    const thrStr = rule.threshold.toFixed(1).replace('.', ',') + (isSpike ? ' pt' : ' %')
    const cond = CONDITION_LABELS[rule.condition]

    newEvents.push({
      id: uid(),
      ruleId: rule.id,
      ruleLabelSnapshot: rule.label,
      triggeredAt: snapshot.fetchedAt,
      value,
      message: `${rule.label} — valeur actuelle : ${valStr} (seuil ${cond} ${thrStr})`,
      read: false,
    })
  }

  return newEvents
}
