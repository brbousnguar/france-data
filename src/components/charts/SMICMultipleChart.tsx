"use client"

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import type { SMICMultiplePoint } from '@/lib/smicSalary'

type Props = {
  data: SMICMultiplePoint[]
}

export default function SMICMultipleChart({ data }: Props) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-1">{label}</p>
        <p className="text-[#0055A4]">
          Multiple SMIC : <span className="font-semibold">×{d?.multiple?.toFixed(2)}</span>
        </p>
        <p className="text-xs text-[#857f74] mt-1">
          {d?.userGrossMensuel?.toLocaleString('fr-FR')} € ÷ {d?.smicMensuel?.toLocaleString('fr-FR')} €
        </p>
      </div>
    )
  }

  const minMultiple = Math.min(...data.map(d => d.multiple))
  const maxMultiple = Math.max(...data.map(d => d.multiple))

  return (
    <div className="card">
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data.map(d => ({ ...d, year: String(d.year) }))}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#a4ac96" />
            <XAxis dataKey="year" tick={{ fill: '#595358', fontSize: 12 }} />
            <YAxis
              tick={{ fill: '#595358', fontSize: 12 }}
              tickFormatter={v => `×${v.toFixed(1)}`}
              domain={[Math.floor(minMultiple * 10) / 10 - 0.1, Math.ceil(maxMultiple * 10) / 10 + 0.1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={data[data.length - 1]?.multiple}
              stroke="#0055A4"
              strokeDasharray="4 3"
              label={{ value: `Actuel ×${data[data.length - 1]?.multiple?.toFixed(2)}`, fill: '#0055A4', fontSize: 10, position: 'insideTopRight' }}
            />
            <Line
              type="monotone"
              dataKey="multiple"
              stroke="#c0522a"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#c0522a' }}
              name="Multiple SMIC"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-xs text-[#595358] bg-[#fff3e0] border border-[#f6c87a] rounded p-3">
        <p className="font-semibold mb-1 text-[#7a4200]">⚠️ Le multiple SMIC diminue</p>
        <p>
          Si votre salaire brut reste fixe à 43 000 €, votre multiple SMIC baisse chaque fois
          que le gouvernement revalorise le SMIC. Un multiple inférieur à ×2 est un signal
          fort pour négocier une augmentation.
        </p>
      </div>
    </div>
  )
}
