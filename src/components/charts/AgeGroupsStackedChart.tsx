"use client"

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

type AgeGroupData = {
  date: string
  g0_14: number
  g15_29: number
  g30_44: number
  g45_59: number
  g60plus: number
}

type Props = {
  data: AgeGroupData[]
  title?: string
}

export default function AgeGroupsStackedChart({ data, title }: Props) {
  // Format data for Recharts (convert to percentages for display)
  const chartData = data.map(d => ({
    year: d.date,
    '0-14 ans': d.g0_14,
    '15-29 ans': d.g15_29,
    '30-44 ans': d.g30_44,
    '45-59 ans': d.g45_59,
    '60+ ans': d.g60plus
  }))

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm text-[#313628] mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name} : <span className="font-semibold">{entry.value}%</span>
          </p>
        ))}
      </div>
    )
  }

  // Color palette for age groups - using custom palette with variations
  const colors = {
    '0-14 ans': '#cadf9e',    // tea-green
    '15-29 ans': '#a4ac96',   // ash-grey
    '30-44 ans': '#857f74',   // grey-olive
    '45-59 ans': '#595358',   // charcoal
    '60+ ans': '#313628'      // charcoal-brown
  }

  return (
    <div className="card">
      {title && <h3 className="text-lg font-medium text-[#313628] mb-4">{title}</h3>}
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="0-14 ans" stackId="a" fill={colors['0-14 ans']} />
            <Bar dataKey="15-29 ans" stackId="a" fill={colors['15-29 ans']} />
            <Bar dataKey="30-44 ans" stackId="a" fill={colors['30-44 ans']} />
            <Bar dataKey="45-59 ans" stackId="a" fill={colors['45-59 ans']} />
            <Bar dataKey="60+ ans" stackId="a" fill={colors['60+ ans']} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
