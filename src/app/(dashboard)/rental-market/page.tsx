"use client"

import React, { useEffect, useState, useCallback } from 'react'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import ErrorState from '../../../components/ErrorState'
import IRLChart from '../../../components/charts/IRLChart'
import { loadProfile } from '../../../lib/purchasingPower'
import {
  enrichIRL, computeMaxIncrease, getLatestYoY, formatQuarterFR,
  NANTES_BENCHMARKS,
  type IRLPoint, type NantesLoyerData,
} from '../../../lib/rentalMarket'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtEur(n: number): string {
  return n.toLocaleString('fr-FR') + ' €'
}

function fmtPct(n: number, sign = false): string {
  return (sign && n > 0 ? '+' : '') + n.toFixed(2).replace('.', ',') + ' %'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RentalMarketPage() {
  const [irl, setIrl] = useState<IRLPoint[]>([])
  const [nantesLoyer, setNantesLoyer] = useState<NantesLoyerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculator state
  const [calcRent, setCalcRent] = useState('700')
  const [calcRefPeriod, setCalcRefPeriod] = useState('')

  // User profile (rent pre-fill)
  const [profileRent, setProfileRent] = useState(700)

  // ── Data fetch ──────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/rental-market')
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`)
      const json = await res.json()
      const enriched = enrichIRL(json.irl ?? [])
      setIrl(enriched)
      setNantesLoyer(json.nantesLoyer ?? null)
      // Default calc reference = oldest available period
      if (enriched.length > 0 && !calcRefPeriod) {
        setCalcRefPeriod(enriched[0].period)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }, [])  // eslint-disable-line

  useEffect(() => { fetchData() }, [fetchData])

  // Load rent from profile
  useEffect(() => {
    const p = loadProfile()
    setProfileRent(p.rentMonthly)
    setCalcRent(String(p.rentMonthly))
  }, [])

  // ── Derived values ──────────────────────────────────────────────────────────

  const latestIRL = irl.length > 0 ? irl[irl.length - 1] : null
  const latestYoY = getLatestYoY(irl)

  const calcResult = (() => {
    const rent = parseFloat(calcRent)
    const refIRL = irl.find(p => p.period === calcRefPeriod)
    if (!refIRL || !latestIRL || isNaN(rent) || rent <= 0) return null
    return computeMaxIncrease(rent, refIRL.value, latestIRL.value)
  })()

  // Nantes T2 median rent for comparison
  const t2Benchmark = NANTES_BENCHMARKS.find(b => b.type === 'T2')!
  const userVsT2 = t2Benchmark
    ? Math.round(((profileRent / t2Benchmark.medianTotal) - 1) * 100)
    : 0

  // ── Render states ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Marché Locatif Nantais' }]} />
        <PageHeader title="Marché Locatif Nantais" subtitle="Chargement…" />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mt-8 space-y-8"><ChartSkeleton height="lg" /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Marché Locatif Nantais' }]} />
        <PageHeader title="Marché Locatif Nantais" />
        <div className="mt-6"><ErrorState message={error} onRetry={fetchData} /></div>
      </div>
    )
  }

  const yoyColor = (v: number | null) =>
    v === null ? 'text-[#333]' :
    v >= 3 ? 'text-[#c0522a]' :
    v >= 1.5 ? 'text-yellow-600' : 'text-[#4a7c59]'

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'Marché Locatif Nantais' }]} />

      <PageHeader
        title="Marché Locatif Nantais"
        subtitle="Suivez l'IRL (plafond légal de hausse de loyer), comparez votre loyer au marché nantais."
      />

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card border-l-4 border-[#0055A4]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">IRL actuel</p>
          <p className="text-2xl font-bold text-[#313628]">
            {latestIRL ? latestIRL.value.toFixed(2).replace('.', ',') : '—'}
          </p>
          <p className="text-xs text-[#857f74] mt-1">
            {latestIRL ? formatQuarterFR(latestIRL.period) : '—'} • base T4 2002 = 100
          </p>
        </div>

        <div className="card border-l-4 border-yellow-400">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Hausse IRL a/a</p>
          <p className={`text-2xl font-bold ${yoyColor(latestYoY?.value ?? null)}`}>
            {latestYoY ? fmtPct(latestYoY.value, true) : '—'}
          </p>
          <p className="text-xs text-[#857f74] mt-1">Plafond légal de renouvellement</p>
        </div>

        <div className={`card border-l-4 ${userVsT2 < -10 ? 'border-[#cadf9e]' : userVsT2 > 10 ? 'border-red-400' : 'border-yellow-400'}`}>
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Votre loyer vs T2 médian</p>
          <p className={`text-2xl font-bold ${userVsT2 < -10 ? 'text-[#4a7c59]' : userVsT2 > 10 ? 'text-red-500' : 'text-yellow-600'}`}>
            {userVsT2 > 0 ? '+' : ''}{userVsT2} %
          </p>
          <p className="text-xs text-[#857f74] mt-1">
            {fmtEur(profileRent)} vs médian {fmtEur(t2Benchmark.medianTotal)}
          </p>
        </div>

        <div className="card border-l-4 border-[#cadf9e]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Hausse max ce trimestre</p>
          <p className={`text-2xl font-bold ${yoyColor(latestYoY?.value ?? null)}`}>
            {latestYoY ? fmtPct(latestYoY.value) : '—'}
          </p>
          <p className="text-xs text-[#857f74] mt-1">Si renouvellement ce trimestre</p>
        </div>
      </div>

      {/* ── Legal increase calculator ────────────────────────────────────────── */}
      <div className="mb-8 p-5 bg-white border border-[#D9D9D9] rounded">
        <h2 className="text-sm font-semibold text-[#313628] mb-1">
          Simulateur — Hausse légale maximale de mon loyer
        </h2>
        <p className="text-xs text-[#857f74] mb-4">
          En France, lors du renouvellement d&apos;un bail, la hausse est plafonnée à la
          variation de l&apos;IRL entre le trimestre de référence du bail et le même
          trimestre un an plus tard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-[#595358] mb-1 block">Loyer actuel</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={calcRent}
                onChange={e => setCalcRent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]"
              />
              <span className="text-xs text-[#857f74]">€/mois</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#595358] mb-1 block">Trimestre de référence du bail</label>
            <select
              value={calcRefPeriod}
              onChange={e => setCalcRefPeriod(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4] bg-white"
            >
              {irl.map(p => (
                <option key={p.period} value={p.period}>
                  {formatQuarterFR(p.period)} (IRL : {p.value.toFixed(2).replace('.', ',')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#595358] mb-1 block">IRL de référence (dernier connu)</label>
            <div className="px-3 py-2 text-sm bg-[#f5f5f5] border border-[#D9D9D9] rounded text-[#595358]">
              {latestIRL
                ? `${formatQuarterFR(latestIRL.period)} → IRL ${latestIRL.value.toFixed(2).replace('.', ',')}`
                : '—'}
            </div>
          </div>
        </div>

        {calcResult && (
          <div className={`p-4 rounded border ${
            calcResult.maxIncreasePercent > 3 ? 'bg-[#fff3e0] border-[#f6c87a]' :
            calcResult.maxIncreasePercent > 0 ? 'bg-[#e5f2d3] border-[#cadf9e]' :
            'bg-[#f0f7ff] border-[#b3d4f5]'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#595358] uppercase tracking-wide mb-1">Hausse maximale</p>
                <p className={`text-2xl font-bold ${yoyColor(calcResult.maxIncreasePercent)}`}>
                  {fmtPct(calcResult.maxIncreasePercent, true)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#595358] uppercase tracking-wide mb-1">Nouveau loyer max légal</p>
                <p className="text-2xl font-bold text-[#313628]">{fmtEur(calcResult.maxNewRent)}/mois</p>
              </div>
              <div>
                <p className="text-xs text-[#595358] uppercase tracking-wide mb-1">Augmentation en €</p>
                <p className={`text-2xl font-bold ${calcResult.absoluteIncrease > 0 ? 'text-[#c0522a]' : 'text-[#4a7c59]'}`}>
                  {calcResult.absoluteIncrease > 0 ? '+' : ''}{fmtEur(calcResult.absoluteIncrease)}/mois
                </p>
              </div>
            </div>
            <p className="text-xs text-[#595358] mt-3 italic">
              Calcul : Loyer actuel × (IRL {latestIRL ? formatQuarterFR(latestIRL.period) : '—'} / IRL {formatQuarterFR(calcRefPeriod)}) =
              {' '}{parseFloat(calcRent).toFixed(0)} € × ({latestIRL?.value.toFixed(2)} / {irl.find(p => p.period === calcRefPeriod)?.value.toFixed(2)})
            </p>
          </div>
        )}
      </div>

      {/* ── IRL chart ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Évolution de l&apos;IRL — variations annuelles trimestrielles
        </h2>
        {irl.length > 0 ? (
          <IRLChart data={irl} />
        ) : (
          <div className="p-8 text-center bg-white border border-[#D9D9D9] rounded text-[#666]">
            Données IRL indisponibles pour le moment.
          </div>
        )}
      </div>

      {/* ── Nantes rent comparison ───────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Loyers médians à Nantes — référence marché
        </h2>

        {nantesLoyer && (
          <div className="mb-4 p-3 bg-[#e5f2d3] border border-[#cadf9e] rounded text-sm">
            <span className="font-semibold text-[#313628]">Données live data.gouv.fr : </span>
            <span className="text-[#595358]">
              Nantes — {nantesLoyer.rentPerM2.toFixed(1).replace('.', ',')} €/m² médian ({nantesLoyer.year})
              · Source : {nantesLoyer.source}
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border border-[#D9D9D9] rounded">
            <thead>
              <tr className="bg-[#f5f5f5] text-[#595358] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Surface typ.</th>
                <th className="px-4 py-3 text-right">Prix /m²</th>
                <th className="px-4 py-3 text-right">Loyer médian</th>
                <th className="px-4 py-3 text-right">Votre loyer</th>
                <th className="px-4 py-3 text-right">Écart</th>
              </tr>
            </thead>
            <tbody>
              {NANTES_BENCHMARKS.map((b, i) => {
                const isT2 = b.type === 'T2'
                const diff = isT2 ? profileRent - b.medianTotal : null
                const diffPct = isT2 ? Math.round(((profileRent / b.medianTotal) - 1) * 100) : null
                return (
                  <tr
                    key={i}
                    className={`border-t border-[#E0E0E0] ${isT2 ? 'bg-[#f0f7ff]' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-[#313628]">
                      {b.type}
                      {isT2 && (
                        <span className="ml-2 text-xs text-[#0055A4] font-normal">(votre profil)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#595358]">{b.descSurface}</td>
                    <td className="px-4 py-3 text-right text-[#595358]">
                      {b.medianRentPerM2.toFixed(1).replace('.', ',')} €/m²
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#313628]">
                      {fmtEur(b.medianTotal)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#0055A4]">
                      {isT2 ? fmtEur(profileRent) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {diff !== null && diffPct !== null ? (
                        <span className={`font-semibold ${diff < 0 ? 'text-[#4a7c59]' : diff > 0 ? 'text-[#c0522a]' : 'text-[#333]'}`}>
                          {diff > 0 ? '+' : ''}{fmtEur(diff)}
                          {' '}({diffPct > 0 ? '+' : ''}{diffPct} %)
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[#857f74] mt-2">
          Référence : OLAN / Observatoire des Loyers Agglomération Nantaise + annonces SeLoger / PAP, Nantes intra-muros 2023.
          Les benchmarks sont des médianes d&apos;annonce, non des loyers en cours de bail.
        </p>
      </div>

      {/* ── Methodology ─────────────────────────────────────────────────────── */}
      <div className="mt-4 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Sources et notes légales</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>IRL</strong> : INSEE — BDM série 001515333, France entière, base T4 2002 = 100. Publié trimestriellement.</li>
          <li>La hausse légale est encadrée par l&apos;article 17-1 de la loi n°89-462 du 6 juillet 1989.</li>
          <li>Le bailleur peut appliquer la hausse IRL à la <strong>date anniversaire</strong> du bail et seulement si le contrat le prévoit.</li>
          <li>En zone tendue (dont Nantes), la révision ne peut dépasser l&apos;IRL même si le marché a davantage progressé.</li>
          <li>Données Nantes : {nantesLoyer ? nantesLoyer.source : 'Benchmarks statiques OLAN/SeLoger 2023'}.</li>
        </ul>
      </div>
    </div>
  )
}
