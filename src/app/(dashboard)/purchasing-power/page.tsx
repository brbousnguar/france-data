"use client"

import React, { useEffect, useState, useCallback } from 'react'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import ErrorState from '../../../components/ErrorState'
import PurchasingPowerChart from '../../../components/charts/PurchasingPowerChart'
import CategoryInflationChart from '../../../components/charts/CategoryInflationChart'
import {
  loadProfile, saveProfile, estimateNetMonthly,
  computePurchasingPower, mergeCategories, computeKPIs,
  DEFAULT_PROFILE,
  type UserProfile, type PurchasingPowerPoint, type CategoryImpactPoint, type PurchasingPowerKPIs,
  type InflationSeries,
} from '../../../lib/purchasingPower'

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtEur(n: number): string {
  return n.toLocaleString('fr-FR') + ' €'
}

function fmtPct(n: number): string {
  return n.toFixed(1).replace('.', ',') + ' %'
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PurchasingPowerPage() {
  // Remote data
  const [generalCPI, setGeneralCPI] = useState<InflationSeries>([])
  const [foodCPI, setFoodCPI] = useState<InflationSeries>([])
  const [housingCPI, setHousingCPI] = useState<InflationSeries>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived chart data
  const [ppSeries, setPpSeries] = useState<PurchasingPowerPoint[]>([])
  const [catSeries, setCatSeries] = useState<CategoryImpactPoint[]>([])
  const [kpis, setKpis] = useState<PurchasingPowerKPIs | null>(null)

  // Profile state
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [formGross, setFormGross] = useState('43000')
  const [formNet, setFormNet] = useState(String(DEFAULT_PROFILE.netMonthly))
  const [formRent, setFormRent] = useState(String(DEFAULT_PROFILE.rentMonthly))
  const [formFood, setFormFood] = useState(String(DEFAULT_PROFILE.foodMonthly))
  const [formTech, setFormTech] = useState(String(DEFAULT_PROFILE.techMonthly))
  const [profileSaved, setProfileSaved] = useState(false)

  // ── Fetch raw CPI data ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/purchasing-power')
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Erreur inconnue')
      setGeneralCPI(json.data.general)
      setFoodCPI(json.data.food)
      setHousingCPI(json.data.housing)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Load profile from localStorage ─────────────────────────────────────────

  useEffect(() => {
    const saved = loadProfile()
    setProfile(saved)
    setFormNet(String(saved.netMonthly))
    setFormRent(String(saved.rentMonthly))
    setFormFood(String(saved.foodMonthly))
    setFormTech(String(saved.techMonthly))
  }, [])

  // ── Recompute derived data when CPI or profile changes ─────────────────────

  useEffect(() => {
    if (generalCPI.length === 0) return
    const pp = computePurchasingPower(profile, generalCPI)
    const cat = mergeCategories(generalCPI, foodCPI, housingCPI)
    const k = computeKPIs(profile, pp, foodCPI, generalCPI)
    setPpSeries(pp)
    setCatSeries(cat)
    setKpis(k)
  }, [profile, generalCPI, foodCPI, housingCPI])

  // ── Profile form handlers ───────────────────────────────────────────────────

  const handleGrossChange = (v: string) => {
    setFormGross(v)
    const g = parseInt(v)
    if (!isNaN(g) && g > 0) setFormNet(String(estimateNetMonthly(g)))
  }

  const handleSaveProfile = () => {
    const net = parseInt(formNet)
    const rent = parseInt(formRent)
    const food = parseInt(formFood)
    const tech = parseInt(formTech)
    if ([net, rent, food, tech].some(isNaN)) return
    const updated: UserProfile = { netMonthly: net, rentMonthly: rent, foodMonthly: food, techMonthly: tech }
    saveProfile(updated)
    setProfile(updated)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  // ── Render states ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Mon Pouvoir d\'Achat' }]} />
        <PageHeader title="Mon Pouvoir d'Achat" subtitle="Chargement des données INSEE…" />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mt-8 space-y-8">
          <ChartSkeleton height="lg" />
          <ChartSkeleton height="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs items={[{ label: 'Mon Pouvoir d\'Achat' }]} />
        <PageHeader title="Mon Pouvoir d'Achat" />
        <div className="mt-6"><ErrorState message={error} onRetry={fetchData} /></div>
      </div>
    )
  }

  const rentBurdenColor =
    (kpis?.rentBurden ?? 0) > 33 ? 'text-red-500' :
    (kpis?.rentBurden ?? 0) > 25 ? 'text-yellow-600' : 'text-[#4a7c59]'

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'Mon Pouvoir d\'Achat' }]} />

      <PageHeader
        title="Mon Pouvoir d'Achat"
        subtitle="Mesurez l'érosion réelle de votre salaire face à l'inflation depuis janvier 2022."
      />

      {/* ── Profile configuration ─────────────────────────────────────────── */}
      <div className="mb-8 p-5 bg-white border border-[#D9D9D9] rounded">
        <h2 className="text-sm font-semibold text-[#313628] mb-4 flex items-center gap-2">
          <span>Votre profil financier</span>
          <span className="text-xs font-normal text-[#857f74]">(stocké localement, modifiable)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-[#595358] mb-1 block">Salaire brut annuel</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={formGross}
                onChange={e => handleGrossChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]"
              />
              <span className="text-xs text-[#857f74] flex-shrink-0">€</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#595358] mb-1 block">
              Salaire net mensuel
              <span className="ml-1 text-[#a4ac96]">(estimé)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={formNet}
                onChange={e => setFormNet(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#0055A4] rounded focus:outline-none focus:border-[#0055A4] bg-[#f0f7ff]"
              />
              <span className="text-xs text-[#857f74] flex-shrink-0">€</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#595358] mb-1 block">Loyer mensuel</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={formRent}
                onChange={e => setFormRent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]"
              />
              <span className="text-xs text-[#857f74] flex-shrink-0">€</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#595358] mb-1 block">Budget alimentation / mois</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={formFood}
                onChange={e => setFormFood(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]"
              />
              <span className="text-xs text-[#857f74] flex-shrink-0">€</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#595358] mb-1 block">Budget tech / mois</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={formTech}
                onChange={e => setFormTech(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]"
              />
              <span className="text-xs text-[#857f74] flex-shrink-0">€</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2 text-sm font-medium bg-[#0055A4] text-white rounded hover:bg-[#004494] transition-colors"
          >
            Recalculer
          </button>
          {profileSaved && (
            <span className="text-sm text-[#4a7c59] font-medium">Profil mis à jour</span>
          )}
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────────── */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card border-l-4 border-[#cadf9e]">
            <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Pouvoir d&apos;achat réel</p>
            <p className="text-2xl font-bold text-[#313628]">{fmt€(kpis.realValueToday)}</p>
            <p className="text-xs text-[#857f74] mt-1">en euros jan. 2022</p>
          </div>

          <div className="card border-l-4 border-red-400">
            <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Perte mensuelle</p>
            <p className="text-2xl font-bold text-red-500">−{fmt€(kpis.monthlyLoss)}</p>
            <p className="text-xs text-[#857f74] mt-1">vs jan. 2022</p>
          </div>

          <div className="card border-l-4 border-red-300">
            <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Perte cumulée</p>
            <p className="text-2xl font-bold text-red-500">−{fmt€(kpis.cumulativeLoss)}</p>
            <p className="text-xs text-[#857f74] mt-1">depuis jan. 2022</p>
          </div>

          <div className={`card border-l-4 ${kpis.rentBurden > 33 ? 'border-red-400' : kpis.rentBurden > 25 ? 'border-yellow-400' : 'border-[#cadf9e]'}`}>
            <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Poids du loyer</p>
            <p className={`text-2xl font-bold ${rentBurdenColor}`}>{fmtPct(kpis.rentBurden)}</p>
            <p className="text-xs text-[#857f74] mt-1">
              {kpis.rentBurden > 33 ? 'Taux d\'effort élevé (>33%)' : kpis.rentBurden > 25 ? 'Au-dessus de la médiane' : 'Taux d\'effort raisonnable'}
            </p>
          </div>
        </div>
      )}

      {/* ── Inflation summary box ────────────────────────────────────────────── */}
      {kpis && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#fff3e0] border border-[#f6c87a] rounded">
            <p className="text-xs font-semibold text-[#7a4200] uppercase tracking-wide mb-1">Inflation alimentaire cumulée depuis jan. 2022</p>
            <p className="text-2xl font-bold text-[#c0522a]">+{fmtPct(kpis.foodInflationCumul)}</p>
            <p className="text-xs text-[#7a4200] mt-1">
              vs +{fmtPct(kpis.generalInflationCumul)} pour l&apos;inflation générale
              {kpis.foodInflationCumul > kpis.generalInflationCumul && (
                <span className="ml-1 font-semibold">— la nourriture a davantage augmenté</span>
              )}
            </p>
          </div>

          <div className="p-4 bg-[#e5f2d3] border border-[#cadf9e] rounded">
            <p className="text-xs font-semibold text-[#313628] uppercase tracking-wide mb-1">Votre budget alimentation aujourd&apos;hui vaut</p>
            <p className="text-2xl font-bold text-[#4a7c59]">
              {fmt€(Math.round(profile.foodMonthly / (1 + kpis.foodInflationCumul / 100)))}
            </p>
            <p className="text-xs text-[#595358] mt-1">
              en pouvoir d&apos;achat jan. 2022 (budget nominal : {fmt€(profile.foodMonthly)})
            </p>
          </div>
        </div>
      )}

      {/* ── Charts ───────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        {ppSeries.length > 12 && (
          <div>
            <h3 className="text-lg font-medium text-[#313628] mb-4">
              Évolution de votre pouvoir d&apos;achat mensuel
            </h3>
            <PurchasingPowerChart data={ppSeries} />
          </div>
        )}

        {catSeries.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-[#313628] mb-4">
              Inflation par poste de dépense
            </h3>
            <CategoryInflationChart data={catSeries} />
          </div>
        )}
      </div>

      {/* ── Methodology ─────────────────────────────────────────────────────── */}
      <div className="mt-8 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Sources et méthodologie</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Indice des Prix à la Consommation (IPC) — INSEE / Melodi API, France métropolitaine.</li>
          <li>Alimentation : COICOP 01 — Produits alimentaires et boissons non alcoolisées.</li>
          <li>Logement / énergie : COICOP 04 — Logement, eau, gaz, électricité.</li>
          <li>L&apos;indice de prix cumulé est calculé par chaînage des glissements annuels (base jan. 2022 = 100).</li>
          <li>Le salaire net estimé utilise un taux de charge moyen de 23 % (hors impôt sur le revenu).</li>
        </ul>
      </div>
    </div>
  )
}
