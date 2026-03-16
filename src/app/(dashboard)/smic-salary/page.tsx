"use client"

import React, { useEffect, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import Breadcrumbs from '../../../components/Breadcrumbs'
import SMICChart from '../../../components/charts/SMICChart'
import SMICMultipleChart from '../../../components/charts/SMICMultipleChart'
import { loadProfile } from '../../../lib/purchasingPower'
import {
  SMIC_HISTORY, SALARY_REFERENCES, computeSMICMultiples, smicGrowthSince, convergenceAlert,
} from '../../../lib/smicSalary'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtEur(n: number): string { return n.toLocaleString('fr-FR') + ' €' }
function fmtK(n: number): string { return (n / 1000).toFixed(0) + ' K€' }
function fmtPct(n: number, sign = false): string {
  return (sign && n > 0 ? '+' : '') + n.toFixed(1).replace('.', ',') + ' %'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SMICSalaryPage() {
  const grossAnnual = 43000
  const grossMonthly = grossAnnual / 12

  const [netMonthly, setNetMonthly] = useState(2759)
  useEffect(() => {
    const p = loadProfile()
    setNetMonthly(p.netMonthly)
  }, [])

  // Derived
  const latestSMIC = SMIC_HISTORY[SMIC_HISTORY.length - 1]
  const smicMultiple = Math.round((grossMonthly / latestSMIC.monthlyBrut) * 100) / 100
  const smicGrowth2022 = smicGrowthSince(2022)
  const convergence = convergenceAlert(grossAnnual, 2022)
  const multipleData = computeSMICMultiples(grossAnnual)

  // Salary scale positions (gross monthly, min 1400, max 6000 for visualization)
  const SCALE_MIN = 1400
  const SCALE_MAX = 6000
  const scalePct = (v: number) => Math.max(0, Math.min(100, ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100))

  const scaleMarkers = [
    { label: 'SMIC', value: latestSMIC.monthlyBrut, color: '#c0522a' },
    { label: 'Médiane nationale', value: 27600 / 12, color: '#857f74' },
    { label: 'Vous', value: grossMonthly, color: '#F7B500' },
    { label: 'Médiane IT cadres', value: 52000 / 12, color: '#0055A4' },
    { label: 'Médiane cadres', value: 60000 / 12, color: '#4a7c59' },
  ].sort((a, b) => a.value - b.value)

  return (
    <div className="animate-fadeIn">
      <Breadcrumbs items={[{ label: 'SMIC & Repères Salariaux' }]} />

      <PageHeader
        title="SMIC & Repères Salariaux"
        subtitle="Suivez l'évolution du SMIC et positionnez votre salaire face aux médianes nationales."
      />

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card border-l-4 border-[#cadf9e]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">SMIC mensuel brut</p>
          <p className="text-2xl font-bold text-[#313628]">{fmtEur(latestSMIC.monthlyBrut)}</p>
          <p className="text-xs text-[#857f74] mt-1">{latestSMIC.label} · {latestSMIC.hourlyBrut.toFixed(2).replace('.', ',')} €/h</p>
        </div>

        <div className={`card border-l-4 ${smicMultiple < 2.1 ? 'border-yellow-400' : 'border-[#0055A4]'}`}>
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Votre multiple SMIC</p>
          <p className={`text-2xl font-bold ${smicMultiple < 2.1 ? 'text-yellow-600' : 'text-[#313628]'}`}>
            ×{smicMultiple.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-[#857f74] mt-1">
            {smicMultiple < 2 ? 'Proche du seuil ×2 — vigilance' : smicMultiple < 2.5 ? 'Marge modérée' : 'Marge confortable'}
          </p>
        </div>

        <div className="card border-l-4 border-red-300">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">SMIC +{fmtPct(smicGrowth2022)} depuis 2022</p>
          <p className="text-2xl font-bold text-[#c0522a]">{fmtPct(smicGrowth2022, true)}</p>
          <p className="text-xs text-[#857f74] mt-1">Revalorisation cumulée depuis jan. 2022</p>
        </div>

        <div className="card border-l-4 border-[#857f74]">
          <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Médiane IT cadres</p>
          <p className="text-2xl font-bold text-[#595358]">52 K€</p>
          <p className="text-xs text-[#857f74] mt-1">
            Écart : {fmtK(52000 - grossAnnual)} sous la médiane IT (INSEE 2022)
          </p>
        </div>
      </div>

      {/* ── Convergence alert ──────────────────────────────────────────────── */}
      {convergence.smicGrowthPct > 5 && (
        <div className="mb-8 p-4 bg-[#fff3e0] border border-[#f6c87a] rounded flex gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-[#7a4200] mb-1">Signal : convergence vers le SMIC</p>
            <p className="text-sm text-[#595358]">{convergence.message}</p>
            <p className="text-xs text-[#857f74] mt-1">
              Pour maintenir votre multiple SMIC de départ (×{(grossMonthly / (SMIC_HISTORY.find(s => s.date === '2022-01')?.monthlyBrut ?? 1)).toFixed(2)}),
              votre salaire devrait être d&apos;au moins <strong>{fmtK(latestSMIC.monthlyBrut * 12 * (grossMonthly / (SMIC_HISTORY.find(s => s.date === '2022-01')?.monthlyBrut ?? 1)))}</strong> brut annuel.
            </p>
          </div>
        </div>
      )}

      {/* ── Salary position scale ───────────────────────────────────────────── */}
      <div className="mb-8 p-5 bg-white border border-[#D9D9D9] rounded">
        <h2 className="text-sm font-semibold text-[#313628] mb-5">
          Votre position sur l&apos;échelle des salaires bruts mensuels
        </h2>

        {/* Scale bar */}
        <div className="relative h-10 mb-2">
          <div className="absolute inset-y-4 left-0 right-0 bg-gradient-to-r from-[#cadf9e] via-[#f6c87a] to-[#0055A4] rounded-full opacity-20" />
          <div className="absolute inset-y-4 left-0 right-0 bg-[#f0f0f0] rounded-full" />
          {scaleMarkers.map(m => (
            <div
              key={m.label}
              className="absolute top-0 bottom-0 flex flex-col items-center"
              style={{ left: `${scalePct(m.value)}%` }}
            >
              <div
                className="w-0.5 h-full"
                style={{ backgroundColor: m.label === 'Vous' ? '#F7B500' : m.color }}
              />
              {m.label === 'Vous' && (
                <div
                  className="absolute top-1 w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: '#F7B500' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Scale labels */}
        <div className="relative h-12">
          {scaleMarkers.map(m => (
            <div
              key={m.label}
              className="absolute text-center"
              style={{ left: `${scalePct(m.value)}%`, transform: 'translateX(-50%)' }}
            >
              <p
                className={`text-xs font-semibold whitespace-nowrap ${m.label === 'Vous' ? 'text-[#7a4200]' : 'text-[#595358]'}`}
              >
                {m.label}
              </p>
              <p className="text-xs text-[#a4ac96]">{fmtEur(Math.round(m.value))}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-[#a4ac96] mt-2">
          <span>{fmtEur(SCALE_MIN)}</span>
          <span>{fmtEur(SCALE_MAX)}</span>
        </div>
      </div>

      {/* ── Salary reference table ────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Repères salariaux — votre position
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border border-[#D9D9D9] rounded">
            <thead>
              <tr className="bg-[#f5f5f5] text-[#595358] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Repère</th>
                <th className="px-4 py-3 text-right">Mensuel net</th>
                <th className="px-4 py-3 text-right">Annuel brut</th>
                <th className="px-4 py-3 text-right">Écart vs. vous</th>
                <th className="px-4 py-3 text-right">Année</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_REFERENCES.map((ref, i) => {
                const diffAnnual = grossAnnual - ref.annualGross
                const diffPct = Math.round(((grossAnnual / ref.annualGross) - 1) * 100)
                const isUser = false
                return (
                  <tr key={i} className="border-t border-[#E0E0E0]">
                    <td className="px-4 py-3 font-medium text-[#313628]">{ref.label}</td>
                    <td className="px-4 py-3 text-right text-[#595358]">{fmtEur(ref.monthlyNet)}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#313628]">{fmtK(ref.annualGross)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${diffAnnual > 0 ? 'text-[#4a7c59]' : 'text-[#c0522a]'}`}>
                        {diffAnnual > 0 ? '+' : ''}{fmtK(diffAnnual)}
                        <span className="ml-1 text-xs font-normal">({diffPct > 0 ? '+' : ''}{diffPct} %)</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#857f74] text-xs">{ref.year}</td>
                    <td className="px-4 py-3 text-[#857f74] text-xs">{ref.source}</td>
                  </tr>
                )
              })}
              {/* User row */}
              <tr className="border-t-2 border-[#F7B500] bg-[#fffbeb]">
                <td className="px-4 py-3 font-semibold text-[#7a4200]">
                  Vous (SQLI)
                  <span className="ml-2 text-xs text-[#7a4200] bg-[#FFF3CD] px-1.5 py-0.5 rounded">actuel</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#7a4200]">{fmtEur(netMonthly)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#7a4200]">{fmtK(grossAnnual)}</td>
                <td className="px-4 py-3 text-right text-[#857f74]">—</td>
                <td className="px-4 py-3 text-right text-[#857f74] text-xs">2025</td>
                <td className="px-4 py-3 text-[#857f74] text-xs">Votre profil</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#857f74] mt-2">
          Comparaison avec votre brut annuel de 43 000 €.
          Montants nets calculés avec un taux de charges moyen de ~23 %.
          Données DADS 2022 (dernière publication INSEE disponible).
        </p>
      </div>

      {/* ── SMIC chart ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-4">
          Évolution du SMIC mensuel brut (2015 – 2025)
        </h2>
        <SMICChart userGrossMonthly={grossMonthly} />
      </div>

      {/* ── SMIC multiple chart ───────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#313628] mb-2">
          Votre multiple SMIC — évolution depuis 2015
        </h2>
        <p className="text-sm text-[#595358] mb-4">
          Combien de SMIC représente votre salaire ? Un multiple qui baisse = le SMIC rattrape votre rémunération.
        </p>
        <SMICMultipleChart data={multipleData} />
      </div>

      {/* ── Action box ─────────────────────────────────────────────────────── */}
      <div className="mb-8 p-5 bg-[#e5f2d3] border border-[#cadf9e] rounded">
        <h2 className="text-sm font-semibold text-[#313628] mb-3">
          💡 Ce que disent les données pour votre situation
        </h2>
        <ul className="space-y-2 text-sm text-[#595358]">
          <li className="flex gap-2">
            <span className="text-[#c0522a] font-bold flex-shrink-0">•</span>
            <span>
              Votre 43 K€ est <strong>sous la médiane IT cadres</strong> (52 K€, secteur J, INSEE 2022)
              et <strong>sous la médiane APEC cadres</strong> (57 K€ en 2023).
              La marge de négociation est de <strong>+9 à +14 K€</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#c0522a] font-bold flex-shrink-0">•</span>
            <span>
              Le SMIC a augmenté de <strong>{fmtPct(smicGrowth2022)}</strong> depuis janvier 2022.
              Votre multiple SMIC est passé de <strong>×{(grossMonthly / (SMIC_HISTORY.find(s => s.date === '2022-01')?.monthlyBrut ?? 1)).toFixed(2)}</strong> à{' '}
              <strong>×{smicMultiple.toFixed(2)}</strong> — mécaniquement, sans augmentation.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#4a7c59] font-bold flex-shrink-0">•</span>
            <span>
              Vous êtes <strong>au-dessus du salaire médian tous salariés</strong> (~27,6 K€ brut)
              et au-dessus du SMIC annuel (~21,6 K€ brut).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#0055A4] font-bold flex-shrink-0">•</span>
            <span>
              Pour atteindre la médiane IT cadres, il faudrait une hausse de{' '}
              <strong>{fmtPct(((52000 / grossAnnual) - 1) * 100)}</strong> soit
              environ <strong>+{fmtK(52000 - grossAnnual)}</strong>/an brut.
            </span>
          </li>
        </ul>
      </div>

      {/* ── Methodology ──────────────────────────────────────────────────────── */}
      <div className="mt-4 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Sources</p>
        <ul className="list-disc list-inside space-y-1">
          <li>SMIC : Journal Officiel — décrets de revalorisation. Mensuel = horaire × 151,67h (35h/semaine).</li>
          <li>Salaires médians : INSEE DADS/DSN 2022 (Première n°1985, Oct. 2024). Données nettes des salariés du privé.</li>
          <li>Médiane cadres APEC : Baromètre de l&apos;emploi cadre APEC 2023. Hors variables et intéressement.</li>
          <li>Le salaire net estimé utilise un taux de charge salariale de 23 % (hors IR).</li>
        </ul>
      </div>
    </div>
  )
}
