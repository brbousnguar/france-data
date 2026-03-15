"use client"

import React from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatDateMonthYearFR } from '@/lib/format'
import type { PurchasingPowerPoint } from '@/lib/purchasingPower'

type Props = {
  data: PurchasingPowerPoint[]
}

export default function PurchasingPowerChart({ data }: Props) {
  // Start from month 12 where we have actual chained index data
  const displayData = data.slice(12).map(d => ({
    ...d,
    dateLabel: formatDateMonthYearFR(d.date + '-01'),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-2">{d.dateLabel}</p>
        <p className="text-[#0055A4]">
          Salaire nominal : <span className="font-semibold">{d.nominal.toLocaleString('fr-FR')} €</span>
        </p>
        <p className="text-[#4a7c59]">
          Pouvoir d&apos;achat réel : <span className="font-semibold">{d.real.toLocaleString('fr-FR')} €</span>
        </p>
        <p className="text-red-500 mt-1 border-t border-[#e0e0e0] pt-1">
          Perte mensuelle : <span className="font-semibold">−{d.loss.toLocaleString('fr-FR')} €</span>
        </p>
        <p className="text-xs text-[#857f74] mt-1">
          Indice des prix : {d.priceIndex.toFixed(1).replace('.', ',')} (base jan. 2022 = 100)
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <ComposedChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              tickFormatter={v => `${v.toLocaleString('fr-FR')} €`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* Nominal salary area (background reference) */}
            <Area
              type="monotone"
              dataKey="nominal"
              fill="#E8F4FD"
              stroke="#0055A4"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fillOpacity={0.4}
              name="Salaire nominal"
              dot={false}
            />

            {/* Real purchasing power area */}
            <Area
              type="monotone"
              dataKey="real"
              fill="#cadf9e"
              stroke="#4a7c59"
              strokeWidth={2}
              fillOpacity={0.7}
              name="Pouvoir d'achat réel"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">📉 Comment lire ce graphique ?</p>
        <p>
          La zone bleue représente votre salaire en euros courants (valeur nominale). La zone verte
          représente ce que ce salaire vous permet <em>réellement d&apos;acheter</em> en euros constants
          (valeur réelle). L&apos;écart entre les deux est votre <strong>perte de pouvoir d&apos;achat</strong>
          due à l&apos;inflation.
        </p>
      </div>
    </div>
  )
}
