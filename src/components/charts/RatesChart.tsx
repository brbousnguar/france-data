"use client"

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { formatDateMonthYearFR } from '@/lib/format'
import { ECB_KEY_EVENTS } from '@/lib/rates'
import type { RatePoint } from '@/lib/rates'

type Props = {
  dfr: RatePoint[]
  mro: RatePoint[]
  oat10: RatePoint[]
  euribor3m: RatePoint[]
}

export default function RatesChart({ dfr, mro, oat10, euribor3m }: Props) {
  // Merge all series by date
  const allDates = Array.from(
    new Set([
      ...dfr.map(p => p.date),
      ...mro.map(p => p.date),
      ...oat10.map(p => p.date),
      ...euribor3m.map(p => p.date),
    ]),
  ).sort()

  const dfrMap = new Map(dfr.map(p => [p.date, p.value]))
  const mroMap = new Map(mro.map(p => [p.date, p.value]))
  const oatMap = new Map(oat10.map(p => [p.date, p.value]))
  const eurMap = new Map(euribor3m.map(p => [p.date, p.value]))

  const chartData = allDates.map(date => ({
    date,
    dateLabel: formatDateMonthYearFR(date + '-01'),
    dfr: dfrMap.get(date) ?? null,
    mro: mroMap.get(date) ?? null,
    oat10: oatMap.get(date) ?? null,
    euribor3m: eurMap.get(date) ?? null,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    const fmt = (v: number | null) =>
      v !== null ? `${v.toFixed(2).replace('.', ',')} %` : '—'
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-2">{d.dateLabel}</p>
        {d.dfr !== null && <p style={{ color: '#0055A4' }}>DFR : <span className="font-semibold">{fmt(d.dfr)}</span></p>}
        {d.mro !== null && <p style={{ color: '#4a7c59' }}>MRO : <span className="font-semibold">{fmt(d.mro)}</span></p>}
        {d.oat10 !== null && <p style={{ color: '#c0522a' }}>OAT 10 ans : <span className="font-semibold">{fmt(d.oat10)}</span></p>}
        {d.euribor3m !== null && <p style={{ color: '#857f74' }}>Euribor 3M : <span className="font-semibold">{fmt(d.euribor3m)}</span></p>}
      </div>
    )
  }

  const eventsByMonth = new Map(ECB_KEY_EVENTS.map(e => [e.date, e]))

  return (
    <div className="card">
      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#a4ac96" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: '#595358', fontSize: 10 }}
              tickLine={{ stroke: '#a4ac96' }}
              interval="preserveStartEnd"
              angle={-40}
              textAnchor="end"
              height={75}
            />
            <YAxis
              tick={{ fill: '#595358', fontSize: 12 }}
              tickFormatter={v => `${v} %`}
              domain={[-1, 6]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />

            {/* ECB key event reference lines */}
            {ECB_KEY_EVENTS.map(ev => {
              const match = chartData.find(d => d.date.startsWith(ev.date))
              if (!match) return null
              return (
                <ReferenceLine
                  key={ev.date}
                  x={match.dateLabel}
                  stroke={ev.type === 'hike' ? '#c0522a' : ev.type === 'cut' ? '#4a7c59' : '#F7B500'}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              )
            })}

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#a4ac96" strokeWidth={1} />

            {dfr.length > 0 && (
              <Line type="stepAfter" dataKey="dfr" stroke="#0055A4" strokeWidth={2.5} dot={false} name="DFR (taux directeur BCE)" connectNulls />
            )}
            {mro.length > 0 && (
              <Line type="stepAfter" dataKey="mro" stroke="#4a7c59" strokeWidth={2} dot={false} name="MRO (taux refi BCE)" connectNulls />
            )}
            {oat10.length > 0 && (
              <Line type="monotone" dataKey="oat10" stroke="#c0522a" strokeWidth={2} dot={false} strokeDasharray="5 2" name="OAT 10 ans (France)" connectNulls />
            )}
            {euribor3m.length > 0 && (
              <Line type="monotone" dataKey="euribor3m" stroke="#857f74" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Euribor 3M" connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Event legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#c0522a] inline-block" style={{ borderTop: '2px dashed #c0522a' }} />
          Hausse BCE
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#4a7c59] inline-block" style={{ borderTop: '2px dashed #4a7c59' }} />
          Baisse BCE
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#F7B500] inline-block" style={{ borderTop: '2px dashed #F7B500' }} />
          Événement clé
        </span>
      </div>

      <div className="mt-3 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">📋 Les trois taux</p>
        <p>
          <strong>DFR</strong> (bleu) : taux que la BCE verse aux banques sur leurs dépôts — le taux directeur depuis 2022.
          <strong className="ml-1">MRO</strong> (vert) : taux auquel les banques empruntent à la BCE.
          <strong className="ml-1">OAT 10 ans</strong> (orange) : emprunt souverain français à 10 ans — référence pour les crédits immobiliers.
          <strong className="ml-1">Euribor 3M</strong> (gris) : référence pour les crédits à taux variable.
        </p>
      </div>
    </div>
  )
}
