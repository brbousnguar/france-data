"use client"

import React, { useEffect, useState, useCallback } from 'react'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import ErrorState from '../../../components/ErrorState'
import RatesChart from '../../../components/charts/RatesChart'
import {
  ECB_KEY_EVENTS, getRateImpacts, computeMortgage, estimateMortgageRate,
  type RatesData,
} from '../../../lib/rates'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtRate(v: number | null): string {
  return v !== null ? `${v.toFixed(2).replace('.', ',')} %` : '—'
}
function fmtEur(n: number): string { return n.toLocaleString('fr-FR') + ' €' }

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RatesPage() {
  const [data, setData] = useState<RatesData>({ dfr: [], mro: [], oat10: [], euribor3m: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mortgage calculator state
  const [price, setPrice] = useState('220000')
  const [downPct, setDownPct] = useState('10')
  const [duration, setDuration] = useState('20')
  const [rateOverride, setRateOverride] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/rates')
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`)
      const json = await res.json()
      setData({ dfr: json.dfr ?? [], mro: json.mro ?? [], oat10: json.oat10 ?? [], euribor3m: json.euribor3m ?? [] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Derived current values
  const currentDFR = data.dfr.at(-1)?.value ?? null
  const currentMRO = data.mro.at(-1)?.value ?? null
  const currentOAT = data.oat10.at(-1)?.value ?? null
  const currentEuribor = data.euribor3m.at(-1)?.value ?? null
  const estimatedMortgageRate = estimateMortgageRate(currentOAT)
  const impacts = getRateImpacts(currentDFR)

  // Mortgage calculation
  const mortgageRate = parseFloat(rateOverride) || estimatedMortgageRate
  const mortgageCurrent = (() => {
    const p = parseFloat(price)
    const d = parseFloat(downPct)
    const dur = parseInt(duration)
    if (isNaN(p) || isNaN(d) || isNaN(dur) || p <= 0) return null
    return computeMortgage(p, d, dur, mortgageRate)
  })()
  const mortgage2021 = (() => {
    const p = parseFloat(price)
    const d = parseFloat(downPct)
    const dur = parseInt(duration)
    if (isNaN(p) || isNaN(d) || isNaN(dur) || p <= 0) return null
    return computeMortgage(p, d, dur, 1.1)
  })()

  // ── Render states ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Taux d\'Intérêt & BCE' }]} />
        <PageHeader title="Taux d'Intérêt & BCE" subtitle="Chargement des données BCE…" />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mt-8"><ChartSkeleton height="xl" /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Taux d\'Intérêt & BCE' }]} />
        <PageHeader title="Taux d'Intérêt & BCE" />
        <div className="mt-6"><ErrorState message={error} onRetry={fetchData} /></div>
      </div>
    )
  }

  const dfrColor = (currentDFR ?? 0) > 3 ? 'text-[#c0522a]' : (currentDFR ?? 0) > 1 ? 'text-yellow-600' : 'text-[#4a7c59]'

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'Taux d\'Intérêt & BCE' }]} />

      <PageHeader
        title="Taux d'Intérêt & BCE"
        subtitle="Taux directeurs BCE, OAT 10 ans et impact concret sur votre vie économique à Nantes."
      />

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card border-l-4 border-[#0055A4]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">DFR — Taux directeur BCE</p>
          <p className={`text-2xl font-bold ${dfrColor}`}>{fmtRate(currentDFR)}</p>
          <p className="text-xs text-[#857f74] mt-1">Deposit Facility Rate · {data.dfr.at(-1)?.date ?? '—'}</p>
        </div>

        <div className="card border-l-4 border-[#4a7c59]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">MRO — Taux refi BCE</p>
          <p className="text-2xl font-bold text-[#595358]">{fmtRate(currentMRO)}</p>
          <p className="text-xs text-[#857f74] mt-1">Main Refinancing Operations</p>
        </div>

        <div className="card border-l-4 border-[#c0522a]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">OAT 10 ans (France)</p>
          <p className="text-2xl font-bold text-[#c0522a]">{fmtRate(currentOAT)}</p>
          <p className="text-xs text-[#857f74] mt-1">Emprunt souverain · Réf. crédit immo</p>
        </div>

        <div className="card border-l-4 border-yellow-400">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Taux crédit immo estimé</p>
          <p className="text-2xl font-bold text-yellow-600">{fmtRate(estimatedMortgageRate)}</p>
          <p className="text-xs text-[#857f74] mt-1">OAT 10 ans + ~1,35 % (marge banque)</p>
        </div>
      </div>

      {/* ── Rate history chart ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Évolution des taux d&apos;intérêt (2014 – aujourd&apos;hui)
        </h2>
        {data.dfr.length > 0 || data.oat10.length > 0 ? (
          <RatesChart {...data} />
        ) : (
          <div className="p-8 text-center bg-white border border-[#D9D9D9] rounded">
            <p className="text-[#666]">Données BCE indisponibles pour le moment.</p>
            <p className="text-sm text-[#999] mt-1">Réessayez ou vérifiez votre connexion internet.</p>
          </div>
        )}
      </div>

      {/* ── ECB timeline ────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">Décisions clés de la BCE</h2>
        <div className="relative pl-5">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[#D9D9D9]" />
          {ECB_KEY_EVENTS.map((ev, i) => (
            <div key={i} className="relative mb-4 pl-5">
              <div className={`absolute -left-0.5 top-1 w-3 h-3 rounded-full border-2 border-white ${
                ev.type === 'hike' ? 'bg-[#c0522a]' :
                ev.type === 'cut' ? 'bg-[#4a7c59]' :
                'bg-[#F7B500]'
              }`} />
              <p className="text-xs text-[#857f74]">{ev.date.replace('-', ' / ')}</p>
              <p className="text-sm font-medium text-[#313628]">{ev.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Impact cards ────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Impact concret sur votre situation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {impacts.map((impact, i) => (
            <div
              key={i}
              className={`p-4 rounded border ${
                impact.sentiment === 'positive' ? 'bg-[#e5f2d3] border-[#cadf9e]' :
                impact.sentiment === 'negative' ? 'bg-[#fff3e0] border-[#f6c87a]' :
                'bg-[#f5f5f5] border-[#D9D9D9]'
              }`}
            >
              <p className="text-sm font-semibold text-[#313628] mb-2">
                {impact.icon} {impact.title}
              </p>
              <p className="text-xs text-[#595358] leading-relaxed">{impact.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mortgage calculator ──────────────────────────────────────────────── */}
      <div className="mb-8 p-5 bg-white border border-[#D9D9D9] rounded">
        <h2 className="text-sm font-semibold text-[#313628] mb-1">
          Simulateur de crédit immobilier
        </h2>
        <p className="text-xs text-[#857f74] mb-4">
          Comparez ce qu&apos;un même bien vous coûterait en 2021 (taux ~1,1 %) vs. aujourd&apos;hui.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs text-[#595358] mb-1 block">Prix du bien</label>
            <div className="flex gap-1 items-center">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]" />
              <span className="text-xs text-[#857f74]">€</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#595358] mb-1 block">Apport (%)</label>
            <input type="number" value={downPct} onChange={e => setDownPct(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]" />
          </div>
          <div>
            <label className="text-xs text-[#595358] mb-1 block">Durée (ans)</label>
            <select value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4] bg-white">
              {[10, 15, 20, 25].map(y => <option key={y} value={y}>{y} ans</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#595358] mb-1 block">
              Taux {rateOverride ? '(saisi)' : '(estimé)'}
            </label>
            <div className="flex gap-1 items-center">
              <input type="number" step="0.1"
                value={rateOverride || estimatedMortgageRate.toFixed(2)}
                onChange={e => setRateOverride(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]" />
              <span className="text-xs text-[#857f74]">%</span>
            </div>
          </div>
        </div>

        {mortgageCurrent && mortgage2021 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current */}
            <div className="p-4 bg-[#fff3e0] border border-[#f6c87a] rounded">
              <p className="text-xs font-semibold text-[#7a4200] uppercase tracking-wide mb-3">
                Aujourd&apos;hui — {mortgageRate.toFixed(2).replace('.', ',')} %
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#595358]">Mensualité</span>
                  <span className="font-bold text-[#313628]">{fmtEur(mortgageCurrent.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#595358]">Coût total</span>
                  <span className="font-semibold text-[#313628]">{fmtEur(mortgageCurrent.totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#595358]">Intérêts payés</span>
                  <span className="font-semibold text-[#c0522a]">{fmtEur(mortgageCurrent.totalInterest)}</span>
                </div>
              </div>
            </div>

            {/* 2021 comparison */}
            <div className="p-4 bg-[#e5f2d3] border border-[#cadf9e] rounded">
              <p className="text-xs font-semibold text-[#313628] uppercase tracking-wide mb-3">
                En 2021 — 1,10 % (taux plancher)
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#595358]">Mensualité</span>
                  <span className="font-bold text-[#313628]">{fmtEur(mortgage2021.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#595358]">Coût total</span>
                  <span className="font-semibold text-[#313628]">{fmtEur(mortgage2021.totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#595358]">Intérêts payés</span>
                  <span className="font-semibold text-[#4a7c59]">{fmtEur(mortgage2021.totalInterest)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {mortgageCurrent && mortgage2021 && (
          <div className="mt-4 p-3 bg-[#f5f5f5] rounded text-sm">
            <span className="font-semibold text-[#313628]">Surcoût mensuel lié à la hausse des taux : </span>
            <span className="text-[#c0522a] font-bold">
              +{fmtEur(mortgageCurrent.monthlyPayment - mortgage2021.monthlyPayment)}/mois
            </span>
            <span className="text-[#595358] ml-2">
              · +{fmtEur(mortgageCurrent.totalInterest - mortgage2021.totalInterest)} d&apos;intérêts sur la durée totale
            </span>
          </div>
        )}
      </div>

      {/* ── Euribor note ─────────────────────────────────────────────────────── */}
      {currentEuribor !== null && (
        <div className="mb-8 p-4 bg-white border border-[#D9D9D9] rounded flex gap-3 items-start">
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <p className="text-sm text-[#595358]">
            <strong className="text-[#313628]">Euribor 3M : {fmtRate(currentEuribor)}</strong> —
            C&apos;est le taux de référence des crédits immobiliers à taux variable en France.
            Si vous aviez un prêt à taux variable signé en 2021 (Euribor ~-0,5 %), votre taux
            aurait plus que quadruplé. Les crédits à taux fixe (majoritaires en France) ne sont pas touchés.
          </p>
        </div>
      )}

      {/* ── Methodology ─────────────────────────────────────────────────────── */}
      <div className="mt-4 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Sources</p>
        <ul className="list-disc list-inside space-y-1">
          <li>DFR &amp; MRO : BCE — Statistical Data Warehouse (ECB SDW), flux FM, données quotidiennes agrégées mensuellement.</li>
          <li>OAT 10 ans : BCE SDW, flux IRS — taux souverain français à 10 ans harmonisé (zone euro).</li>
          <li>Euribor 3M : BCE SDW, flux FM — taux interbancaire de référence zone euro.</li>
          <li>Taux crédit immobilier estimé : OAT 10 ans + marge bancaire indicative (~1,35 %). Taux réels variables selon profil emprunteur.</li>
          <li>Simulateur de crédit : formule d&apos;annuité constante. Hors assurance emprunteur (~0,2–0,4 %/an), frais de dossier et frais de notaire.</li>
        </ul>
      </div>
    </div>
  )
}
