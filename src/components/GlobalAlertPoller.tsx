"use client"

/**
 * GlobalAlertPoller — invisible background component
 *
 * Mounted in the root layout. Polls /api/v1/alerts/check every 15 minutes,
 * evaluates user-defined rules, and writes new AlertEvents to localStorage.
 * Dispatches a custom 'fdl-alerts-updated' event so the badge and alerts page
 * can react without a full page reload.
 */

import { useEffect } from 'react'
import { loadRules, loadEvents, saveEvents, evaluateRules, type IndicatorSnapshot } from '../lib/alerts'

const POLL_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

async function runCheck(): Promise<void> {
  try {
    const res = await fetch('/api/v1/alerts/check')
    if (!res.ok) return
    const json = await res.json()
    if (!json.success) return

    const snapshot: IndicatorSnapshot = json.snapshot
    const rules = loadRules()
    const existing = loadEvents()
    const newEvents = evaluateRules(rules, snapshot, existing)

    if (newEvents.length > 0) {
      saveEvents([...existing, ...newEvents])
      window.dispatchEvent(new Event('fdl-alerts-updated'))
    }
  } catch {
    // Silent — background poller should never throw to the UI
  }
}

export default function GlobalAlertPoller() {
  useEffect(() => {
    runCheck()
    const timer = setInterval(runCheck, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return null
}
