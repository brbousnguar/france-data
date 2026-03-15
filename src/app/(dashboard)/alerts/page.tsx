"use client"

import React, { useEffect, useState, useCallback } from 'react'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import {
  loadRules, saveRules, loadEvents, saveEvents, evaluateRules, countUnread,
  INDICATOR_LABELS, CONDITION_LABELS,
  type AlertRule, type AlertEvent, type AlertIndicator, type AlertCondition,
  type IndicatorSnapshot,
} from '../../../lib/alerts'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateFR(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const INDICATORS: AlertIndicator[] = ['inflation', 'inflation_spike', 'unemployment', 'gdp']
const CONDITIONS: AlertCondition[] = ['above', 'below']

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [events, setEvents] = useState<AlertEvent[]>([])
  const [snapshot, setSnapshot] = useState<IndicatorSnapshot | null>(null)
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  // Add-rule form
  const [formIndicator, setFormIndicator] = useState<AlertIndicator>('inflation')
  const [formCondition, setFormCondition] = useState<AlertCondition>('above')
  const [formThreshold, setFormThreshold] = useState('3')
  const [formLabel, setFormLabel] = useState('')

  // ── Load from localStorage ──────────────────────────────────────────────────

  useEffect(() => {
    setRules(loadRules())
    setEvents(loadEvents())

    const onUpdate = () => {
      setRules(loadRules())
      setEvents(loadEvents())
    }
    window.addEventListener('fdl-alerts-updated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('fdl-alerts-updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  // ── Check now ───────────────────────────────────────────────────────────────

  const checkNow = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/v1/alerts/check')
      if (!res.ok) return
      const json = await res.json()
      if (!json.success) return

      const snap: IndicatorSnapshot = json.snapshot
      setSnapshot(snap)
      setLastChecked(snap.fetchedAt)

      const currentRules = loadRules()
      const currentEvents = loadEvents()
      const newEvents = evaluateRules(currentRules, snap, currentEvents)

      if (newEvents.length > 0) {
        const updated = [...currentEvents, ...newEvents]
        saveEvents(updated)
        setEvents(updated)
        window.dispatchEvent(new Event('fdl-alerts-updated'))
      }
    } catch { /* ignore */ } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => { checkNow() }, [checkNow])

  // ── Rule actions ────────────────────────────────────────────────────────────

  const toggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    saveRules(updated)
    setRules(updated)
  }

  const deleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id)
    saveRules(updated)
    setRules(updated)
  }

  const addRule = () => {
    const threshold = parseFloat(formThreshold)
    if (isNaN(threshold)) return
    const isSpike = formIndicator === 'inflation_spike'
    const unit = isSpike ? 'pt' : '%'
    const autoLabel =
      formLabel.trim() ||
      `${INDICATOR_LABELS[formIndicator]} ${formCondition === 'above' ? '>' : '<'} ${formThreshold} ${unit}`
    const newRule: AlertRule = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      label: autoLabel,
      indicator: formIndicator,
      condition: formCondition,
      threshold,
      enabled: true,
      createdAt: new Date().toISOString(),
    }
    const updated = [...rules, newRule]
    saveRules(updated)
    setRules(updated)
    setFormLabel('')
    setFormThreshold('3')
  }

  // ── Event actions ───────────────────────────────────────────────────────────

  const markRead = (id: string) => {
    const updated = events.map(e => e.id === id ? { ...e, read: true } : e)
    saveEvents(updated)
    setEvents(updated)
  }

  const markAllRead = () => {
    const updated = events.map(e => ({ ...e, read: true }))
    saveEvents(updated)
    setEvents(updated)
  }

  const clearAllEvents = () => {
    saveEvents([])
    setEvents([])
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const unread = countUnread(events)
  const sortedEvents = [...events].reverse()
  const activeRules = rules.filter(r => r.enabled).length

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'Surveillance & Alertes' }]} />

      <PageHeader
        title="Surveillance & Alertes"
        subtitle="Définissez des seuils sur les indicateurs économiques clés et soyez notifié lors des franchissements."
      />

      {/* ── Status bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-[#D9D9D9] rounded mb-6">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${checking ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
        <span className="text-sm text-[#595358] flex-1">
          {checking
            ? 'Vérification en cours…'
            : lastChecked
              ? `Dernière vérification : ${formatDateFR(lastChecked)}`
              : 'Vérification au chargement…'}
        </span>
        <button
          onClick={checkNow}
          disabled={checking}
          className="px-4 py-2 text-sm font-medium bg-[#0055A4] text-white rounded hover:bg-[#004494] disabled:opacity-50 transition-colors"
        >
          {checking ? 'En cours…' : 'Vérifier maintenant'}
        </button>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card border-l-4 border-red-400">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Alertes non lues</p>
          <p className={`text-2xl font-bold ${unread > 0 ? 'text-red-500' : 'text-[#333]'}`}>{unread}</p>
        </div>
        <div className="card border-l-4 border-[#0055A4]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Règles actives</p>
          <p className="text-2xl font-bold text-[#333]">{activeRules}</p>
        </div>
        <div className="card border-l-4 border-[#cadf9e]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Inflation actuelle</p>
          <p className="text-2xl font-bold text-[#333]">
            {snapshot?.inflation !== null && snapshot?.inflation !== undefined
              ? `${snapshot.inflation.toFixed(1).replace('.', ',')} %`
              : '—'}
          </p>
        </div>
        <div className="card border-l-4 border-[#cadf9e]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Chômage actuel</p>
          <p className="text-2xl font-bold text-[#333]">
            {snapshot?.unemployment !== null && snapshot?.unemployment !== undefined
              ? `${snapshot.unemployment.toFixed(1).replace('.', ',')} %`
              : '—'}
          </p>
        </div>
      </div>

      {/* ── Triggered events ────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#313628]">
            Alertes déclenchées
            <span className="ml-2 text-sm font-normal text-[#857f74]">({events.length})</span>
          </h2>
          <div className="flex gap-3">
            {unread > 0 && (
              <button onClick={markAllRead} className="text-sm text-[#0055A4] hover:underline">
                Tout marquer comme lu
              </button>
            )}
            {events.length > 0 && (
              <button onClick={clearAllEvents} className="text-sm text-red-400 hover:underline">
                Effacer tout
              </button>
            )}
          </div>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="p-10 text-center bg-white border border-[#D9D9D9] rounded">
            <p className="text-[#666] font-medium">Aucune alerte déclenchée pour l&apos;instant.</p>
            <p className="text-sm text-[#999] mt-1">
              Les alertes apparaissent ici lorsqu&apos;un seuil est franchi. La vérification automatique a lieu toutes les 15 minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEvents.map(event => (
              <div
                key={event.id}
                className={`flex items-start gap-4 p-4 rounded border transition-opacity ${
                  event.read
                    ? 'bg-white border-[#E0E0E0] opacity-60'
                    : 'bg-[#fff8e1] border-yellow-300'
                }`}
              >
                <div
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    event.read ? 'bg-[#ccc]' : 'bg-yellow-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#313628]">{event.message}</p>
                  <p className="text-xs text-[#857f74] mt-0.5">{formatDateFR(event.triggeredAt)}</p>
                </div>
                {!event.read && (
                  <button
                    onClick={() => markRead(event.id)}
                    className="flex-shrink-0 text-xs text-[#666] hover:text-[#333] px-2 py-1 hover:bg-[#f0f0f0] rounded transition-colors"
                  >
                    Lu
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Alert rules ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-[#313628] mb-3">
          Règles de surveillance
          <span className="ml-2 text-sm font-normal text-[#857f74]">({rules.length})</span>
        </h2>

        {rules.length === 0 ? (
          <div className="p-6 text-center bg-white border border-[#D9D9D9] rounded mb-4">
            <p className="text-[#666]">Aucune règle configurée.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`flex items-center gap-4 p-4 bg-white border rounded transition-opacity ${
                  rule.enabled ? 'border-[#D9D9D9]' : 'border-[#E8E8E8] opacity-55'
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleRule(rule.id)}
                  aria-label={rule.enabled ? 'Désactiver la règle' : 'Activer la règle'}
                  className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${
                    rule.enabled ? 'bg-[#0055A4]' : 'bg-[#ccc]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      rule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#313628]">{rule.label}</p>
                  <p className="text-xs text-[#857f74]">
                    {INDICATOR_LABELS[rule.indicator]} — {CONDITION_LABELS[rule.condition]}{' '}
                    {rule.threshold.toFixed(1).replace('.', ',')}
                    {rule.indicator === 'inflation_spike' ? ' pt' : ' %'}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add rule form */}
        <div className="p-5 bg-[#e5f2d3] border border-[#cadf9e] rounded">
          <h3 className="text-sm font-semibold text-[#313628] mb-4">Ajouter une règle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-[#595358] mb-1 block">Indicateur</label>
              <select
                value={formIndicator}
                onChange={e => setFormIndicator(e.target.value as AlertIndicator)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded bg-white focus:outline-none focus:border-[#0055A4]"
              >
                {INDICATORS.map(i => (
                  <option key={i} value={i}>{INDICATOR_LABELS[i]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[#595358] mb-1 block">Condition</label>
              <select
                value={formCondition}
                onChange={e => setFormCondition(e.target.value as AlertCondition)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded bg-white focus:outline-none focus:border-[#0055A4]"
              >
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[#595358] mb-1 block">
                Seuil {formIndicator === 'inflation_spike' ? '(pt)' : '(%)'}
              </label>
              <input
                type="number"
                value={formThreshold}
                onChange={e => setFormThreshold(e.target.value)}
                step="0.1"
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded bg-white focus:outline-none focus:border-[#0055A4]"
              />
            </div>

            <div>
              <label className="text-xs text-[#595358] mb-1 block">Label (optionnel)</label>
              <input
                type="text"
                value={formLabel}
                onChange={e => setFormLabel(e.target.value)}
                placeholder="Auto-généré"
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded bg-white focus:outline-none focus:border-[#0055A4]"
              />
            </div>
          </div>

          <button
            onClick={addRule}
            className="mt-4 px-5 py-2 text-sm font-medium bg-[#0055A4] text-white rounded hover:bg-[#004494] transition-colors"
          >
            Ajouter la règle
          </button>
        </div>
      </section>

      {/* ── Info footer ─────────────────────────────────────────────────────── */}
      <div className="mt-8 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Comment ça marche ?</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Les règles et alertes sont stockées localement dans votre navigateur (localStorage).</li>
          <li>La vérification automatique a lieu toutes les 15 minutes en arrière-plan.</li>
          <li>Une seule alerte par règle par jour (anti-spam).</li>
          <li>Les indicateurs proviennent des API publiques INSEE et BDM.</li>
        </ul>
      </div>
    </div>
  )
}
