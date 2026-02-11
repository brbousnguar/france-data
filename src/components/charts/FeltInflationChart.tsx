"use client"

import React from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatPercentFR, formatDateMonthYearFR } from '@/lib/format'

type FeltInflationPoint = {
  date: string
  official: number
  felt: number
}

type Props = {
  data: FeltInflationPoint[]
  title?: string
  showLast?: number // Show only last N months
}

export default function FeltInflationChart({ data, title, showLast }: Props) {
  // Filter data if showLast is specified
  const displayData = showLast ? data.slice(-showLast) : data
  
  // Format data for Recharts
  const chartData = displayData.map(d => ({
    date: d.date,
    dateLabel: formatDateMonthYearFR(d.date + '-01'),
    official: d.official,
    felt: d.felt
  }))

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm text-[#313628] mb-2">{data.dateLabel}</p>
        <p className="text-xs text-[#857f74]">
          Officielle : <span className="font-semibold">{formatPercentFR(data.official / 100, 1)}</span>
        </p>
        <p className="text-xs text-[#595358]">
          Ressentie : <span className="font-semibold">{formatPercentFR(data.felt / 100, 1)}</span>
        </p>
        <p className="text-xs text-[#a4ac96] mt-1">
          Écart : <span className="font-semibold">{formatPercentFR((data.felt - data.official) / 100, 1)}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      {title && <h3 className="text-lg font-medium text-[#313628] mb-4">{title}</h3>}
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorFelt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#595358" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#595358" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              iconType="line"
            />
            
            {/* Official inflation line */}
            <Line
              type="monotone"
              dataKey="official"
              stroke="#857f74"
              strokeWidth={2}
              dot={false}
              name="Inflation officielle"
            />
            
            {/* Felt inflation area */}
            <Area
              type="monotone"
              dataKey="felt"
              stroke="#595358"
              strokeWidth={2}
              fill="url(#colorFelt)"
              name="Inflation ressentie"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Explanation box */}
      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">🎭 Inflation ressentie (indicateur ludique)</p>
        <p className="mb-2">
          L&apos;inflation <strong>ressentie</strong> n&apos;est pas une mesure officielle. 
          C&apos;est un proxy qui combine :
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>L&apos;inflation actuelle (60%)</li>
          <li>La mémoire des 6 derniers mois (40%)</li>
          <li>Un facteur de choc quand les prix accélèrent rapidement</li>
        </ul>
        <p className="mt-2 text-[#857f74] italic">
          Elle est souvent supérieure à l&apos;inflation officielle car les gens se souviennent 
          mieux des hausses de prix que des baisses (biais de négativité).
        </p>
      </div>
    </div>
  )
}
