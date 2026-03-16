"use client"

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { StatCardSkeleton } from '../../../components/LoadingSkeleton'
import {
  loadDashboardProfile, saveDashboardProfile, DEFAULT_DASHBOARD_PROFILE,
  computeDashboardModules, computeHealthScore, getUpcomingEvents,
  type DashboardProfile, type ModuleCard, type HealthScore, type DashboardSnapshot,
} from '../../../lib/dashboard'
import type { CPIData } from '../../../lib/personalInflation'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  green: 'bg-green-500',
  orange: 'bg-yellow-400',
  red: 'bg-red-500',
  neutral: 'bg-[#a4ac96]',
}

const STATUS_RING: Record<string, string> = {
  green: 'ring-green-500 bg-green-50',
  orange: 'ring-yellow-400 bg-yellow-50',
  red: 'ring-red-500 bg-red-50',
  neutral: 'ring-[#a4ac96] bg-[#f5f5f5]',
}

const STATUS_TEXT: Record<string, string> = {
  green: 'text-green-700',
  orange: 'text-yellow-700',
  red: 'text-red-700',
  neutral: 'text-[#595358]',
}

const EVENT_COLOR: Record<string, string> = {
  ecb: 'bg-[#0055A4] text-white',
  insee: 'bg-[#cadf9e] text-[#313628]',
  smic: 'bg-yellow-400 text-[#313628]',
  other: 'bg-[#f5f5f5] text-[#595358]',
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MonProfilPage() {
  const [snap, setSnap] = useState<DashboardSnapshot | null>(null)
  const [cpiData, setCpiData] = useState<CPIData>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Profile editor state
  const [profile, setProfile] = useState<DashboardProfile>(DEFAULT_DASHBOARD_PROFILE)
  const [editMode, setEditMode] = useState(false)
  const [formProfile, setFormProfile] = useState<DashboardProfile>(DEFAULT_DASHBOARD_PROFILE)
  const [profileSaved, setProfileSaved] = useState(false)

  // Computed
  const [modules, setModules] = useState<ModuleCard[]>([])
  const [health, setHealth] = useState<HealthScore | null>(null)

  const upcomingEvents = getUpcomingEvents(5)

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, cpiRes] = await Promise.all([
        fetch('/api/v1/dashboard'),
        fetch('/api/v1/personal-inflation'),
      ])
      if (dashRes.ok) {
        const json = await dashRes.json()
        setSnap(json)
        setLastUpdated(json.fetchedAt)
      }
      if (cpiRes.ok) {
        const json = await cpiRes.json()
        if (json.success) setCpiData(json.data)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Load profile ─────────────────────────────────────────────────────────

  useEffect(() => {
    const p = loadDashboardProfile()
    setProfile(p)
    setFormProfile(p)
  }, [])

  // ── Recompute when data changes ───────────────────────────────────────────

  useEffect(() => {
    if (!snap) return
    const cards = computeDashboardModules(snap, cpiData)
    const h = computeHealthScore(cards)
    setModules(cards)
    setHealth(h)
  }, [snap, cpiData])

  // ── Profile save ─────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    saveDashboardProfile(formProfile)
    setProfile(formProfile)
    setEditMode(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
    // Recompute
    if (snap) {
      const cards = computeDashboardModules(snap, cpiData)
      setModules(cards)
      setHealth(computeHealthScore(cards))
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'Mon Tableau de Bord' }]} />

      {/* ── Profile header ──────────────────────────────────────────────── */}
      <div className="mb-6 p-5 bg-white border border-[#D9D9D9] rounded flex flex-wrap items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-[#0055A4] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#313628]">{profile.displayName}</h1>
          <p className="text-sm text-[#595358]">
            {profile.jobTitle} · {profile.company} · {profile.city}
          </p>
          <p className="text-xs text-[#857f74] mt-0.5">
            {profile.grossAnnual.toLocaleString('fr-FR')} € brut/an
            {lastUpdated && (
              <span className="ml-3">
                · Mis à jour : {new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="px-3 py-1.5 text-xs border border-[#a4ac96] rounded text-[#595358] hover:bg-[#f5f5f5] disabled:opacity-50 transition-colors"
          >
            {loading ? '…' : '↻ Actualiser'}
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-3 py-1.5 text-xs bg-[#0055A4] text-white rounded hover:bg-[#004494] transition-colors"
          >
            {editMode ? 'Fermer' : 'Modifier'}
          </button>
        </div>
      </div>

      {/* ── Profile editor ──────────────────────────────────────────────── */}
      {editMode && (
        <div className="mb-6 p-5 bg-[#f0f7ff] border border-[#b3d4f5] rounded">
          <h3 className="text-sm font-semibold text-[#313628] mb-4">Modifier mon profil</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {([
              ['Prénom / Pseudo', 'displayName'],
              ['Intitulé de poste', 'jobTitle'],
              ['Entreprise', 'company'],
              ['Ville', 'city'],
            ] as [string, keyof DashboardProfile][]).map(([label, key]) => (
              <div key={key}>
                <label className="text-xs text-[#595358] mb-1 block">{label}</label>
                <input
                  type="text"
                  value={formProfile[key] as string}
                  onChange={e => setFormProfile(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-[#595358] mb-1 block">Salaire brut annuel (€)</label>
              <input
                type="number"
                value={formProfile.grossAnnual}
                onChange={e => setFormProfile(prev => ({ ...prev, grossAnnual: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm border border-[#a4ac96] rounded focus:outline-none focus:border-[#0055A4]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 text-sm font-medium bg-[#0055A4] text-white rounded hover:bg-[#004494] transition-colors"
            >
              Enregistrer
            </button>
            {profileSaved && <span className="text-sm text-[#4a7c59] font-medium">Sauvegardé</span>}
          </div>
        </div>
      )}

      {/* ── Health score ─────────────────────────────────────────────────── */}
      {health && (
        <div className={`mb-6 p-5 rounded border ring-2 ${STATUS_RING[health.status]}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
              health.status === 'green' ? 'bg-green-500' :
              health.status === 'red' ? 'bg-red-500' : 'bg-yellow-400'
            }`}>
              <span className="text-white text-xl">
                {health.status === 'green' ? '✓' : health.status === 'red' ? '!' : '~'}
              </span>
            </div>
            <div className="flex-1">
              <p className={`text-lg font-bold mb-1 ${STATUS_TEXT[health.status]}`}>
                {health.headline}
              </p>
              <p className="text-sm text-[#595358]">{health.summary}</p>
              {health.items.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {health.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLOR[item.status]}`} />
                      <span className="font-medium text-[#313628]">{item.label} :</span>
                      <span className="text-[#595358]">{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Module cards grid ────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">Tableau de bord complet</h2>
        {loading && modules.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {modules.map(card => (
              <Link
                key={card.id}
                href={card.href}
                className="group bg-white border border-[#D9D9D9] rounded p-4 hover:border-[#0055A4] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{card.icon}</span>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${STATUS_COLOR[card.status]}`} title={card.statusLabel} />
                </div>
                <p className="text-xs text-[#666] uppercase tracking-wide mb-1">{card.label}</p>
                <p className="text-xl font-bold text-[#313628] leading-tight group-hover:text-[#0055A4] transition-colors">
                  {card.kpi}
                </p>
                <p className="text-xs text-[#857f74] mt-1 leading-snug">{card.sub}</p>
                <p className={`text-xs font-medium mt-2 ${STATUS_TEXT[card.status]}`}>
                  {card.statusLabel}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Macro indicators row ─────────────────────────────────────────── */}
      {snap && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-[#313628] mb-4">Indicateurs macro — France</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Inflation a/a', value: snap.inflation, suffix: ' %', link: '/cost-of-life' },
              { label: 'Chômage', value: snap.unemployment, suffix: ' %', link: '/france-10-years' },
              { label: 'Croissance PIB', value: snap.gdp, suffix: ' %', link: '/' },
              { label: 'Taux directeur BCE', value: snap.dfr, suffix: ' %', link: '/rates' },
            ].map(item => (
              <Link key={item.label} href={item.link} className="card hover:shadow-sm transition-shadow">
                <p className="text-xs text-[#666] uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-[#313628]">
                  {item.value !== null ? item.value.toFixed(1).replace('.', ',') + item.suffix : '—'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Economic calendar ────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">Agenda économique à venir</h2>
        <div className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-[#666]">Aucun événement à venir dans le calendrier.</p>
          ) : (
            upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white border border-[#D9D9D9] rounded">
                <span className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ${EVENT_COLOR[ev.type]}`}>
                  {ev.type === 'ecb' ? 'BCE' : ev.type === 'insee' ? 'INSEE' : ev.type === 'smic' ? 'SMIC' : 'INFO'}
                </span>
                <span className="text-xs text-[#857f74] flex-shrink-0 w-28">{formatEventDate(ev.date)}</span>
                <span className="text-sm text-[#313628]">{ev.label}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Quick nav ────────────────────────────────────────────────────── */}
      <div className="mb-4 p-4 bg-[#e5f2d3] border border-[#cadf9e] rounded">
        <p className="text-xs font-semibold text-[#313628] mb-3">Navigation rapide</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Alertes', href: '/alerts' },
            { label: 'Pouvoir d\'achat', href: '/purchasing-power' },
            { label: 'Mon inflation', href: '/personal-inflation' },
            { label: 'Loyers Nantes', href: '/rental-market' },
            { label: 'Emploi Tech', href: '/job-market' },
            { label: 'SMIC & Salaires', href: '/smic-salary' },
            { label: 'Taux & BCE', href: '/rates' },
            { label: 'Coût de la vie', href: '/cost-of-life' },
          ].map(nav => (
            <Link
              key={nav.href}
              href={nav.href}
              className="px-3 py-1.5 text-xs bg-white border border-[#a4ac96] rounded text-[#313628] hover:bg-[#0055A4] hover:text-white hover:border-[#0055A4] transition-colors"
            >
              {nav.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
