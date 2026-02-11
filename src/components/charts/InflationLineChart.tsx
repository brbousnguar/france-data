"use client"

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'
import { formatPercentFR, formatDateMonthYearFR } from '@/lib/format'

type InflationDataPoint = {
  date: string
  value: number
}

type Props = {
  data: InflationDataPoint[]
  title?: string
  showLast?: number // Show only last N months (optional)
}

export default function InflationLineChart({ data, title, showLast }: Props) {
  // Filter data if showLast is specified
  const displayData = showLast ? data.slice(-showLast) : data
  
  // Format data for Recharts
  const chartData = displayData.map(d => ({
    date: d.date,
    dateLabel: formatDateMonthYearFR(d.date + '-01'), // Add day for parsing
    inflation: d.value
  }))

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm text-[#313628]">{data.dateLabel}</p>
        <p className="text-sm text-[#857f74]">
          Inflation : <span className="font-semibold">{formatPercentFR(data.inflation / 100, 1)}</span>
        </p>
      </div>
    )
  }

  // Determine color based on inflation level - using palette colors
  const getLineColor = (avgInflation: number) => {
    if (avgInflation < 2) return '#cadf9e' // tea-green (low)
    if (avgInflation < 4) return '#857f74' // grey-olive (moderate)
    return '#595358' // charcoal (high)
  }

  const avgInflation = displayData.reduce((sum, d) => sum + d.value, 0) / displayData.length
  const lineColor = getLineColor(avgInflation)

  return (
    <div className="card">
      {title && <h3 className="text-lg font-medium text-[#313628] mb-4">{title}</h3>}
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
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
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={() => 'Inflation annuelle'}
            />
            
            {/* Reference line at 2% (ECB target) */}
            <ReferenceLine
              y={2}
              stroke="#857f74"
              strokeDasharray="3 3"
              label={{ value: 'Cible BCE (2%)', fill: '#595358', fontSize: 11 }}
            />
            
            <Line
              type="monotone"
              dataKey="inflation"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, r: 3 }}
              activeDot={{ r: 5 }}
              name="Inflation annuelle"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Info note */}
      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">💡 Inflation officielle (IPC)</p>
        <p>
          L&apos;inflation mesure la variation des prix sur un an (glissement annuel).
          La cible de la BCE est de 2% par an pour assurer la stabilité des prix.
        </p>
      </div>
    </div>
  )
}
