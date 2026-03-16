"use client"

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { formatDateMonthYearFR } from '@/lib/format'
import type { PersonalInflationPoint } from '@/lib/personalInflation'

type Props = {
  data: PersonalInflationPoint[]
}

export default function PersonalInflationChart({ data }: Props) {
  const chartData = data.map(d => ({
    ...d,
    dateLabel: formatDateMonthYearFR(d.date + '-01'),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    const gapSign = d.gap >= 0 ? '+' : ''
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-2">{d.dateLabel}</p>
        <p className="text-[#857f74]">
          IPC officiel : <span className="font-semibold">{d.official?.toFixed(1).replace('.', ',')} %</span>
        </p>
        <p className="text-[#0055A4]">
          Votre inflation : <span className="font-semibold">{d.personal?.toFixed(1).replace('.', ',')} %</span>
        </p>
        <p className={`mt-1 pt-1 border-t border-[#e0e0e0] font-semibold ${d.gap > 0 ? 'text-[#c0522a]' : 'text-[#4a7c59]'}`}>
          Écart : {gapSign}{d.gap?.toFixed(1).replace('.', ',')} pt
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              dataKey="official"
              stroke="#857f74"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              name="IPC officiel"
            />
            <Line
              type="monotone"
              dataKey="personal"
              stroke="#0055A4"
              strokeWidth={2.5}
              dot={false}
              name="Votre inflation personnelle"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">📐 Méthodologie</p>
        <p>
          Votre inflation personnelle = moyenne pondérée des IPC par catégorie (COICOP),
          en utilisant vos propres parts de budget. Si vous dépensez davantage en
          alimentation que le ménage moyen français, l&apos;inflation alimentaire pèse
          plus sur votre pouvoir d&apos;achat réel.
        </p>
      </div>
    </div>
  )
}
