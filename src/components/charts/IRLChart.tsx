"use client"

import React from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { formatQuarterFR } from '@/lib/rentalMarket'
import type { IRLPoint } from '@/lib/rentalMarket'

type Props = {
  data: IRLPoint[]
}

function barColor(yoy: number | null): string {
  if (yoy === null) return '#a4ac96'
  if (yoy >= 3) return '#c0522a'
  if (yoy >= 1.5) return '#f6c87a'
  return '#cadf9e'
}

export default function IRLChart({ data }: Props) {
  const chartData = data.map(d => ({
    label: formatQuarterFR(d.period),
    irl: d.value,
    yoy: d.yoyChange,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-2">{d.label}</p>
        <p className="text-[#857f74]">
          IRL : <span className="font-semibold">{d.irl?.toFixed(2).replace('.', ',')}</span>
        </p>
        {d.yoy !== null && (
          <p style={{ color: barColor(d.yoy) }}>
            Variation a/a :{' '}
            <span className="font-semibold">
              {d.yoy >= 0 ? '+' : ''}{d.yoy?.toFixed(2).replace('.', ',')} %
            </span>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#a4ac96" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#595358', fontSize: 11 }}
              tickLine={{ stroke: '#a4ac96' }}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            {/* Left axis: YoY % */}
            <YAxis
              yAxisId="yoy"
              orientation="left"
              tick={{ fill: '#595358', fontSize: 11 }}
              tickFormatter={v => `${v} %`}
              domain={[0, 'auto']}
            />
            {/* Right axis: IRL index */}
            <YAxis
              yAxisId="irl"
              orientation="right"
              tick={{ fill: '#857f74', fontSize: 11 }}
              tickFormatter={v => v.toFixed(0)}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            <ReferenceLine
              yAxisId="yoy"
              y={0}
              stroke="#a4ac96"
              strokeDasharray="3 3"
            />

            {/* YoY % change bars */}
            <Bar yAxisId="yoy" dataKey="yoy" name="Variation a/a (%)" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.yoy)} />
              ))}
            </Bar>

            {/* IRL index line */}
            <Line
              yAxisId="irl"
              type="monotone"
              dataKey="irl"
              stroke="#857f74"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              name="IRL (indice)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">📋 Comment lire ce graphique ?</p>
        <p>
          Les <strong>barres</strong> montrent la variation annuelle de l&apos;IRL (glissement
          sur 4 trimestres). C&apos;est la hausse maximale que votre bailleur peut appliquer
          à chaque renouvellement. La <strong>ligne pointillée</strong> montre l&apos;indice
          absolu (base T4 2002 = 100).
        </p>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-[#cadf9e]" /> &lt; 1,5 %</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-[#f6c87a]" /> 1,5 – 3 %</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-[#c0522a]" /> &gt; 3 %</span>
        </div>
      </div>
    </div>
  )
}
