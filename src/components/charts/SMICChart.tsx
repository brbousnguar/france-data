"use client"

import React from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { ANNUAL_SMIC_FOR_CHART } from '@/lib/smicSalary'

type Props = {
  userGrossMonthly: number
}

export default function SMICChart({ userGrossMonthly }: Props) {
  const chartData = ANNUAL_SMIC_FOR_CHART.map(p => ({
    year: String(p.year),
    smic: p.smicMensuel,
    user: userGrossMonthly,
    gap: Math.round(userGrossMonthly - p.smicMensuel),
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-2">{label}</p>
        <p className="text-[#857f74]">
          SMIC brut : <span className="font-semibold">{d.smic?.toLocaleString('fr-FR')} €</span>
        </p>
        <p className="text-[#F7B500]">
          Votre brut mensuel : <span className="font-semibold">{d.user?.toLocaleString('fr-FR')} €</span>
        </p>
        <p className="text-[#cadf9e] mt-1 border-t border-[#e0e0e0] pt-1">
          Écart : <span className="font-semibold">{d.gap?.toLocaleString('fr-FR')} €</span>
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#a4ac96" />
            <XAxis dataKey="year" tick={{ fill: '#595358', fontSize: 12 }} />
            <YAxis
              tick={{ fill: '#595358', fontSize: 12 }}
              tickFormatter={v => `${v.toLocaleString('fr-FR')} €`}
              domain={[1200, 4000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />

            {/* SMIC bars */}
            <Bar dataKey="smic" fill="#cadf9e" name="SMIC mensuel brut" radius={[2, 2, 0, 0]} />

            {/* User salary line */}
            <Line
              type="monotone"
              dataKey="user"
              stroke="#F7B500"
              strokeWidth={3}
              strokeDasharray="6 3"
              dot={false}
              name="Votre brut mensuel"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">📊 Comment lire ce graphique ?</p>
        <p>
          Les barres vertes montrent l&apos;évolution du SMIC mensuel brut (valeur en fin d&apos;année).
          La ligne jaune représente votre salaire brut mensuel (43 000 € / 12). Si les barres montent
          plus vite que la ligne, le SMIC se rapproche de votre salaire.
        </p>
      </div>
    </div>
  )
}
