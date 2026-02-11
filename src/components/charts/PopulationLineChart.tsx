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
  Legend
} from 'recharts'
import { formatNumberFR } from '@/lib/format'

type PopulationDataPoint = {
  date: string
  value: number
}

type Props = {
  data: PopulationDataPoint[]
  title?: string
}

export default function PopulationLineChart({ data, title }: Props) {
  // Format data for Recharts
  const chartData = data.map(d => ({
    year: d.date,
    population: d.value
  }))

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm text-[#313628]">{data.year}</p>
        <p className="text-sm text-[#857f74]">
          Population : <span className="font-semibold">{formatNumberFR(data.population)}</span>
        </p>
      </div>
    )
  }

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
              dataKey="year"
              tick={{ fill: '#595358', fontSize: 12 }}
              tickLine={{ stroke: '#a4ac96' }}
            />
            <YAxis
              tick={{ fill: '#595358', fontSize: 12 }}
              tickLine={{ stroke: '#a4ac96' }}
              tickFormatter={(value) => formatNumberFR(value / 1000) + 'k'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={() => 'Population'}
            />
            <Line
              type="monotone"
              dataKey="population"
              stroke="#857f74"
              strokeWidth={3}
              dot={{ fill: '#cadf9e', r: 4 }}
              activeDot={{ r: 6 }}
              name="Population"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
