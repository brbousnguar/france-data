"use client"

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatDateMonthYearFR } from '@/lib/format'
import type { CategoryImpactPoint } from '@/lib/purchasingPower'

type Props = {
  data: CategoryImpactPoint[]
}

export default function CategoryInflationChart({ data }: Props) {
  const displayData = data.map(d => ({
    ...d,
    dateLabel: formatDateMonthYearFR(d.date + '-01'),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    const fmt = (v: number | null) =>
      v !== null ? `${v.toFixed(1).replace('.', ',')} %` : '—'
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-2">{d.dateLabel}</p>
        <p style={{ color: '#857f74' }}>Général : <span className="font-semibold">{fmt(d.general)}</span></p>
        <p style={{ color: '#c0522a' }}>Alimentation : <span className="font-semibold">{fmt(d.food)}</span></p>
        <p style={{ color: '#0055A4' }}>Logement / énergie : <span className="font-semibold">{fmt(d.housing)}</span></p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#a4ac96" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: '#595358', fontSize: 11 }}
              tickLine={{ stroke: '#a4ac96' }}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: '#595358', fontSize: 12 }}
              tickLine={{ stroke: '#a4ac96' }}
              tickFormatter={v => `${v} %`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <ReferenceLine
              y={2}
              stroke="#a4ac96"
              strokeDasharray="4 3"
              label={{ value: 'Cible BCE 2 %', fill: '#595358', fontSize: 10 }}
            />

            <Line
              type="monotone"
              dataKey="general"
              stroke="#857f74"
              strokeWidth={2}
              dot={false}
              name="Inflation générale"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="food"
              stroke="#c0522a"
              strokeWidth={2}
              dot={false}
              name="Alimentation"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="housing"
              stroke="#0055A4"
              strokeWidth={2}
              dot={false}
              name="Logement / énergie"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">🛒 Pourquoi plusieurs courbes ?</p>
        <p>
          L&apos;inflation officielle (IPC général) est une moyenne pondérée de tous les postes.
          Si vous dépensez davantage en <strong>alimentation</strong> qu&apos;un ménage moyen, votre
          inflation réelle est plus proche de la courbe orange. Le logement / énergie impacte
          directement votre loyer et vos charges.
        </p>
      </div>
    </div>
  )
}
