"use client"

import React, { useEffect, useState, useCallback } from 'react'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import CareerPathChart from '../../../components/charts/CareerPathChart'
import { loadProfile } from '../../../lib/purchasingPower'
import {
  SALARY_BENCHMARKS, CAREER_PATHS, NANTES_IT_COMPANIES,
  QUICK_SEARCHES, MARKET_SIGNALS,
  buildFranceTravailUrl,
  type SalaryRange,
} from '../../../lib/jobMarket'
import type { VacantJobsPoint } from '../../../app/api/v1/job-market/route'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtK(n: number): string {
  return `${n} K€`
}

function salaryPositionPct(salary: number, minK: number, maxK: number): number {
  return Math.max(0, Math.min(100, ((salary / 1000 - minK) / (maxK - minK)) * 100))
}

function salaryAssessment(salary: number, b: SalaryRange): { label: string; color: string } {
  const s = salary / 1000
  if (s < b.minK) return { label: 'Sous le marché', color: 'text-red-500' }
  if (s < b.medianK - 2) return { label: 'Sous la médiane', color: 'text-yellow-600' }
  if (s <= b.medianK + 2) return { label: 'Dans la médiane', color: 'text-[#4a7c59]' }
  return { label: 'Au-dessus de la médiane', color: 'text-[#0055A4]' }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobMarketPage() {
  const [vacantJobs, setVacantJobs] = useState<VacantJobsPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [netMonthly, setNetMonthly] = useState(2759)
  const grossAnnual = 43000 // default; overridden by profile

  const currentSalaryK = grossAnnual / 1000 // 43K

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/job-market')
      if (res.ok) {
        const json = await res.json()
        setVacantJobs(json.vacantJobs ?? [])
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    const p = loadProfile()
    setNetMonthly(p.netMonthly)
  }, [])

  // Find the most relevant benchmark for the user (MuleSoft Confirmé 2-5 ans)
  const primaryBenchmark = SALARY_BENCHMARKS.find(b => b.role === 'Développeur MuleSoft' && b.level === 'Confirmé')!
  const assessment = salaryAssessment(grossAnnual, primaryBenchmark)

  const latestVacancy = vacantJobs.at(-1)
  const prevVacancy = vacantJobs.at(-5)
  const vacancyTrend = latestVacancy && prevVacancy
    ? Math.round((latestVacancy.vacancyRate - prevVacancy.vacancyRate) * 10) / 10
    : null

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'Marché de l\'Emploi Tech' }]} />

      <PageHeader
        title="Marché de l'Emploi Tech"
        subtitle="Votre valeur sur le marché, les trajectoires salariales MuleSoft/SAP et les signaux du secteur IT."
      />

      {/* ── Profile KPIs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card border-l-4 border-[#F7B500]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Votre salaire actuel</p>
          <p className="text-2xl font-bold text-[#313628]">43 K€</p>
          <p className="text-xs text-[#857f74] mt-1">brut annuel — SQLI</p>
        </div>

        <div className={`card border-l-4 ${assessment.color.includes('red') ? 'border-red-400' : assessment.color.includes('yellow') ? 'border-yellow-400' : 'border-[#cadf9e]'}`}>
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Positionnement marché</p>
          <p className={`text-lg font-bold leading-tight ${assessment.color}`}>{assessment.label}</p>
          <p className="text-xs text-[#857f74] mt-1">MuleSoft confirmé 2-5 ans</p>
        </div>

        <div className="card border-l-4 border-[#0055A4]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Médiane marché (MuleSoft confirmé)</p>
          <p className="text-2xl font-bold text-[#0055A4]">{fmtK(primaryBenchmark.medianK)}</p>
          <p className="text-xs text-[#857f74] mt-1">
            Écart : {primaryBenchmark.medianK - currentSalaryK > 0 ? '+' : ''}{Math.round((primaryBenchmark.medianK - currentSalaryK) * 10) / 10} K€
          </p>
        </div>

        <div className={`card border-l-4 ${latestVacancy ? 'border-[#cadf9e]' : 'border-[#D9D9D9]'}`}>
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Emplois vacants IT (DARES)</p>
          <p className="text-2xl font-bold text-[#313628]">
            {latestVacancy ? `${latestVacancy.vacancyRate.toFixed(1).replace('.', ',')} %` : '—'}
          </p>
          <p className="text-xs text-[#857f74] mt-1">
            {latestVacancy?.date ?? 'Données DARES non disponibles'}
            {vacancyTrend !== null && ` · tendance ${vacancyTrend > 0 ? '↑' : '↓'}`}
          </p>
        </div>
      </div>

      {/* ── Salary benchmarks ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Fourchettes salariales — votre stack
        </h2>

        <div className="space-y-3">
          {SALARY_BENCHMARKS.map((b, i) => {
            const isCurrentRole = b.role === 'Développeur MuleSoft' && b.level === 'Confirmé'
            const showUserMarker = isCurrentRole
            const userPct = showUserMarker ? salaryPositionPct(grossAnnual, b.minK, b.maxK) : null
            const medianPct = salaryPositionPct(b.medianK * 1000, b.minK, b.maxK)
            const a = salaryAssessment(grossAnnual, b)

            return (
              <div
                key={i}
                className={`p-4 bg-white border rounded ${isCurrentRole ? 'border-[#F7B500] ring-1 ring-[#F7B500]' : 'border-[#D9D9D9]'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-sm font-semibold text-[#313628]">{b.role}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      b.level === 'Expert' ? 'bg-purple-100 text-purple-700' :
                      b.level === 'Senior' ? 'bg-[#E8F4FD] text-[#0055A4]' :
                      b.level === 'Confirmé' ? 'bg-[#e5f2d3] text-[#4a7c59]' :
                      'bg-[#f5f5f5] text-[#595358]'
                    }`}>
                      {b.level} · {b.expYears}
                    </span>
                    {isCurrentRole && (
                      <span className="ml-2 text-xs bg-[#FFF3CD] text-[#7a4200] px-2 py-0.5 rounded-full font-medium">
                        Votre profil
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#857f74]">{b.source}</span>
                </div>

                {/* Tech stack tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {b.techStack.map(t => (
                    <span key={t} className="text-xs bg-[#f0f7ff] text-[#0055A4] px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Salary range bar */}
                <div className="relative h-6">
                  {/* Background track */}
                  <div className="absolute inset-y-2 left-0 right-0 bg-[#f0f0f0] rounded-full" />

                  {/* Filled range */}
                  <div className="absolute inset-y-2 bg-[#cadf9e] rounded-full" style={{ left: 0, right: 0 }} />

                  {/* Median marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#857f74]"
                    style={{ left: `${medianPct}%` }}
                    title={`Médiane : ${fmtK(b.medianK)}`}
                  />

                  {/* User marker */}
                  {userPct !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[#F7B500] rounded"
                      style={{ left: `${userPct}%` }}
                      title={`Vous : 43 K€`}
                    />
                  )}
                </div>

                {/* Min/Max labels + assessment */}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-[#857f74]">{fmtK(b.minK)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#595358]">
                      Médiane : <strong>{fmtK(b.medianK)}</strong>
                    </span>
                    {showUserMarker && (
                      <span className={`text-xs font-semibold ${a.color}`}>
                        Vous : 43 K€ — {a.label}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#857f74]">{fmtK(b.maxK)}</span>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-[#857f74] mt-3">
          Sources : APEC Baromètre de l&apos;emploi cadre, Glassdoor France, LinkedIn Salary Insights — France, 2024.
          Fourchettes indicatives, hors variables et intéressement.
        </p>
      </div>

      {/* ── Career progression chart ──────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Trajectoire salariale — projections à 10 ans
        </h2>
        <CareerPathChart currentSalary={grossAnnual} />
      </div>

      {/* ── Market signals ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Signaux du marché IT
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MARKET_SIGNALS.map((signal, i) => (
            <div
              key={i}
              className={`p-4 rounded border ${
                signal.sentiment === 'positive' ? 'bg-[#e5f2d3] border-[#cadf9e]' :
                signal.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
                'bg-[#f5f5f5] border-[#D9D9D9]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">
                  {signal.sentiment === 'positive' ? '📈' : signal.sentiment === 'negative' ? '📉' : '➡️'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#313628] mb-1">{signal.title}</p>
                  <p className="text-xs text-[#595358]">{signal.body}</p>
                  <p className="text-xs text-[#a4ac96] mt-1">Source : {signal.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick job search ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Recherche d&apos;emploi — liens rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_SEARCHES.map((s, i) => (
            <a
              key={i}
              href={buildFranceTravailUrl(s.keyword)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white border border-[#D9D9D9] rounded hover:border-[#0055A4] hover:bg-[#f0f7ff] transition-colors group"
            >
              <span className="text-2xl">{s.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#313628] group-hover:text-[#0055A4]">{s.label}</p>
                <p className="text-xs text-[#857f74]">France Travail — Pays de la Loire</p>
              </div>
              <svg className="w-4 h-4 text-[#a4ac96] ml-auto flex-shrink-0 group-hover:text-[#0055A4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
          <a
            href="https://www.apec.fr/candidat/recherche-emploi.html/emploi?motsCles=MuleSoft+SAP&lieuPrincipalSelectSuggest=Nantes%2044~Nantes~44&pageSize=20"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white border border-[#D9D9D9] rounded hover:border-[#0055A4] hover:bg-[#f0f7ff] transition-colors group"
          >
            <span className="text-2xl">💼</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#313628] group-hover:text-[#0055A4]">MuleSoft / SAP — APEC cadres</p>
              <p className="text-xs text-[#857f74]">APEC — Nantes et région</p>
            </div>
            <svg className="w-4 h-4 text-[#a4ac96] ml-auto flex-shrink-0 group-hover:text-[#0055A4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* ── Nantes IT ecosystem ───────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Ecosystème IT Nantais — employeurs clés pour votre profil
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border border-[#D9D9D9] rounded">
            <thead>
              <tr className="bg-[#f5f5f5] text-[#595358] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Entreprise</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Pertinence pour votre profil</th>
                <th className="px-4 py-3 text-center">Carrières</th>
              </tr>
            </thead>
            <tbody>
              {NANTES_IT_COMPANIES.map((c, i) => (
                <tr key={i} className={`border-t border-[#E0E0E0] ${c.name.includes('SQLI') ? 'bg-[#fffbeb]' : ''}`}>
                  <td className="px-4 py-3 font-medium text-[#313628]">
                    {c.name}
                    {c.name.includes('SQLI') && (
                      <span className="ml-2 text-xs text-[#7a4200] bg-[#FFF3CD] px-1.5 py-0.5 rounded">actuel</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#595358]">{c.type}</td>
                  <td className="px-4 py-3 text-[#595358]">{c.relevance}</td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0055A4] hover:underline text-xs"
                    >
                      Voir offres ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Methodology ─────────────────────────────────────────────────────── */}
      <div className="mt-4 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Sources et notes</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Emplois vacants secteur IT : DARES — Enquête sur les postes vacants, secteur J (Information et communication), données cvs-cjo.</li>
          <li>Fourchettes salariales : APEC Baromètre emploi cadre 2024, Glassdoor France, LinkedIn Salary Insights, Indeed France.</li>
          <li>Projections salariales : modèles indicatifs basés sur les données de marché ; les trajectoires réelles dépendent de l&apos;entreprise, du secteur et des certifications.</li>
          <li>La certification MuleSoft MCD Level 1 est fortement recommandée pour dépasser la médiane confirmée.</li>
        </ul>
      </div>
    </div>
  )
}
