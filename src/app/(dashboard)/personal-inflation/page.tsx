"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import ErrorState from '../../../components/ErrorState'
import PersonalInflationChart from '../../../components/charts/PersonalInflationChart'
import {
  CATEGORIES, loadWeights, saveWeights, defaultWeights, nationalWeights,
  computePersonalInflation, computePersonalKPIs, computeOtherWeight,
  type CategoryId, type CPIData, type PersonalInflationPoint, type PersonalInflationKPIs,
} from '../../../lib/personalInflation'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPct(n: number, showSign = false): string {
  return (showSign && n > 0 ? '+' : '') + n.toFixed(1).replace('.', ',') + ' %'
}

function gapColor(gap: number): string {
  if (gap > 1) return 'text-[#c0522a]'
  if (gap < -0.5) return 'text-[#4a7c59]'
  return 'text-[#595358]'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PersonalInflationPage() {
  const [cpiData, setCpiData] = useState<CPIData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [weights, setWeights] = useState<Record<CategoryId, number>>(defaultWeights())
  const [saved, setSaved] = useState(false)

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/personal-inflation')
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setCpiData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Load weights from localStorage
  useEffect(() => { setWeights(loadWeights()) }, [])

  // ── Derived ─────────────────────────────────────────────────────────────────

  const personalSeries = useMemo(
    () => computePersonalInflation(weights, cpiData),
    [weights, cpiData],
  )

  const kpis = useMemo(
    () => computePersonalKPIs(personalSeries, weights, cpiData),
    [personalSeries, weights, cpiData],
  )

  const totalUserWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const otherWeight = computeOtherWeight(weights)
  const weightError = totalUserWeight > 100

  // ── Weight handlers ─────────────────────────────────────────────────────────

  const handleSlider = (id: CategoryId, val: number) => {
    setWeights(prev => ({ ...prev, [id]: val }))
  }

  const handleSave = () => {
    saveWeights(weights)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = (mode: 'user' | 'national') => {
    const w = mode === 'national' ? nationalWeights() : defaultWeights()
    setWeights(w)
    saveWeights(w)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Mon Inflation Personnalisée' }]} />
        <PageHeader title="Mon Inflation Personnalisée" subtitle="Chargement des données INSEE…" />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mt-8"><ChartSkeleton height="lg" /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Mon Inflation Personnalisée' }]} />
        <PageHeader title="Mon Inflation Personnalisée" />
        <div className="mt-6"><ErrorState message={error} onRetry={fetchData} /></div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'Mon Inflation Personnalisée' }]} />

      <PageHeader
        title="Mon Inflation Personnalisée"
        subtitle="L'inflation officielle est une moyenne nationale. La vôtre dépend de comment vous dépensez réellement."
      />

      {/* ── KPI row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card border-l-4 border-[#0055A4]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Votre inflation aujourd&apos;hui</p>
          <p className="text-2xl font-bold text-[#0055A4]">{fmtPct(kpis.personalToday)}</p>
          <p className="text-xs text-[#857f74] mt-1">selon vos pondérations</p>
        </div>

        <div className="card border-l-4 border-[#857f74]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">IPC officiel aujourd&apos;hui</p>
          <p className="text-2xl font-bold text-[#595358]">{fmtPct(kpis.officialToday)}</p>
          <p className="text-xs text-[#857f74] mt-1">moyenne nationale INSEE</p>
        </div>

        <div className={`card border-l-4 ${kpis.gap > 0.5 ? 'border-red-400' : kpis.gap < -0.5 ? 'border-[#cadf9e]' : 'border-[#857f74]'}`}>
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Écart avec l&apos;officiel</p>
          <p className={`text-2xl font-bold ${gapColor(kpis.gap)}`}>{fmtPct(kpis.gap, true)}</p>
          <p className="text-xs text-[#857f74] mt-1">
            {kpis.gap > 0.5 ? 'Vous subissez plus que la moyenne'
              : kpis.gap < -0.5 ? 'Vous subissez moins que la moyenne'
              : 'Proche de la moyenne nationale'}
          </p>
        </div>

        <div className="card border-l-4 border-yellow-400">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Poste le plus inflationniste</p>
          <p className="text-lg font-bold text-[#313628] leading-tight">
            {kpis.mostExpensiveCategory?.label ?? '—'}
          </p>
          <p className="text-xs text-[#857f74] mt-1">
            {kpis.mostExpensiveCategory ? fmtPct(kpis.mostExpensiveCategory.value) + ' a/a' : '—'}
          </p>
        </div>
      </div>

      {/* ── 12-month average row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-[#f0f7ff] border border-[#b3d4f5] rounded">
          <p className="text-xs text-[#595358] uppercase tracking-wide mb-1">Votre inflation — moyenne 12 mois</p>
          <p className="text-2xl font-bold text-[#0055A4]">{fmtPct(kpis.avgPersonal12m)}</p>
        </div>
        <div className="p-4 bg-[#f5f5f5] border border-[#D9D9D9] rounded">
          <p className="text-xs text-[#595358] uppercase tracking-wide mb-1">IPC officiel — moyenne 12 mois</p>
          <p className="text-2xl font-bold text-[#595358]">{fmtPct(kpis.avgOfficial12m)}</p>
        </div>
      </div>

      {/* ── Spending weight configurator ─────────────────────────────────────── */}
      <div className="mb-8 p-5 bg-white border border-[#D9D9D9] rounded">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#313628]">Vos parts de budget</h2>
            <p className="text-xs text-[#857f74] mt-0.5">
              Ajustez chaque curseur. Le reste ({otherWeight} %) ira dans « Autres » (IPC général).
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleReset('user')}
              className="px-3 py-1.5 text-xs border border-[#a4ac96] rounded text-[#595358] hover:bg-[#f5f5f5] transition-colors"
            >
              Mon profil par défaut
            </button>
            <button
              onClick={() => handleReset('national')}
              className="px-3 py-1.5 text-xs border border-[#a4ac96] rounded text-[#595358] hover:bg-[#f5f5f5] transition-colors"
            >
              Panier INSEE moyen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map(cat => {
            const w = weights[cat.id] ?? 0
            const national = cat.nationalWeight
            const diff = w - national
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-[#313628]">
                    {cat.icon} {cat.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#a4ac96]">
                      INSEE : {national} %
                    </span>
                    <span className={`text-sm font-bold w-10 text-right ${diff > 5 ? 'text-[#c0522a]' : diff < -5 ? 'text-[#4a7c59]' : 'text-[#313628]'}`}>
                      {w} %
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={w}
                  onChange={e => handleSlider(cat.id, parseInt(e.target.value))}
                  className="w-full accent-[#0055A4]"
                />
                <p className="text-xs text-[#857f74] mt-0.5">{cat.description}</p>
              </div>
            )
          })}
        </div>

        {/* Total + Other row */}
        <div className="mt-5 pt-4 border-t border-[#E0E0E0] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#595358]">📦 Autres (vêtements, santé, etc.) :</span>
            <span className={`text-sm font-bold ${otherWeight < 0 ? 'text-red-500' : 'text-[#313628]'}`}>
              {otherWeight} %
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-semibold ${
            weightError ? 'bg-red-50 text-red-600 border border-red-300' : 'bg-[#e5f2d3] text-[#4a7c59] border border-[#cadf9e]'
          }`}>
            Total : {totalUserWeight + otherWeight} %
            {weightError ? ' ⚠ Dépasse 100 %, réduisez certains postes' : ' ✓'}
          </div>

          <button
            onClick={handleSave}
            disabled={weightError}
            className="ml-auto px-5 py-2 text-sm font-medium bg-[#0055A4] text-white rounded hover:bg-[#004494] disabled:opacity-40 transition-colors"
          >
            Enregistrer
          </button>
          {saved && <span className="text-sm text-[#4a7c59] font-medium">Sauvegardé</span>}
        </div>
      </div>

      {/* ── Category breakdown table ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Inflation actuelle par poste — votre impact
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border border-[#D9D9D9] rounded">
            <thead>
              <tr className="bg-[#f5f5f5] text-[#595358] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Catégorie</th>
                <th className="px-4 py-3 text-right">Inflation a/a</th>
                <th className="px-4 py-3 text-right">Votre part</th>
                <th className="px-4 py-3 text-right">Part INSEE</th>
                <th className="px-4 py-3 text-right">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, i) => {
                const coicop = { food: '01', housing: '04', transport: '07', tech: '08', recreation: '09', restaurants: '11' }[cat.id]
                const series = cpiData[coicop] ?? []
                const latest = series[series.length - 1]
                const userW = weights[cat.id] ?? 0
                const contribution = latest ? Math.round(userW * latest.value / 100 * 10) / 10 : null

                return (
                  <tr key={i} className="border-t border-[#E0E0E0]">
                    <td className="px-4 py-3 text-[#313628]">{cat.icon} {cat.label}</td>
                    <td className="px-4 py-3 text-right">
                      {latest ? (
                        <span className={`font-semibold ${latest.value >= 3 ? 'text-[#c0522a]' : latest.value >= 1.5 ? 'text-yellow-600' : latest.value <= 0 ? 'text-[#4a7c59]' : 'text-[#313628]'}`}>
                          {fmtPct(latest.value, true)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{userW} %</td>
                    <td className="px-4 py-3 text-right text-[#857f74]">{cat.nationalWeight} %</td>
                    <td className="px-4 py-3 text-right">
                      {contribution !== null ? (
                        <span className={`font-semibold ${contribution >= 0.5 ? 'text-[#c0522a]' : contribution <= 0 ? 'text-[#4a7c59]' : 'text-[#313628]'}`}>
                          {fmtPct(contribution, true)}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
              {/* Other row */}
              <tr className="border-t border-[#E0E0E0] bg-[#fafafa]">
                <td className="px-4 py-3 text-[#595358]">📦 Autres (IPC général)</td>
                <td className="px-4 py-3 text-right text-[#595358]">
                  {cpiData['00']?.at(-1) ? fmtPct(cpiData['00'].at(-1)!.value) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-[#595358]">{otherWeight} %</td>
                <td className="px-4 py-3 text-right text-[#857f74]">
                  {100 - CATEGORIES.reduce((s, c) => s + c.nationalWeight, 0)} %
                </td>
                <td className="px-4 py-3 text-right text-[#595358]">
                  {cpiData['00']?.at(-1)
                    ? fmtPct(Math.round(otherWeight * cpiData['00'].at(-1)!.value / 100 * 10) / 10)
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Chart ────────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Votre inflation personnelle vs. IPC officiel
        </h2>
        {personalSeries.length > 0
          ? <PersonalInflationChart data={personalSeries} />
          : <div className="p-8 text-center bg-white border border-[#D9D9D9] rounded text-[#666]">Données insuffisantes.</div>
        }
      </div>

      {/* ── Methodology ─────────────────────────────────────────────────────── */}
      <div className="mt-4 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Sources et méthodologie</p>
        <ul className="list-disc list-inside space-y-1">
          <li>IPC par division COICOP — INSEE Melodi API, DS_IPC_PRINC, France métropolitaine, glissement annuel.</li>
          <li>COICOP 01 Alimentation · 04 Logement/énergie · 07 Transport · 08 Communication · 09 Loisirs/culture · 11 Restaurants.</li>
          <li>Les pondérations nationales INSEE proviennent du panier IPC 2022 (base actualisée annuellement).</li>
          <li>La catégorie « Autres » utilise l&apos;IPC général (COICOP 00) comme proxy.</li>
          <li>Données et pondérations sauvegardées localement dans votre navigateur.</li>
        </ul>
      </div>
    </div>
  )
}
