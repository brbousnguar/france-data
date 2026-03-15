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
  g0_24: number
  g25_59: number
  g60_74: number
  g75plus: number
}

type Props = {
  data: AgeGroupData[]
  title?: string
}

export default function AgeGroupsStackedChart({ data, title }: Props) {
  const chartData = data.map(d => ({
    year: d.date,
    '0-24 ans': d.g0_24,
    '25-59 ans': d.g25_59,
    '60-74 ans': d.g60_74,
    '75+ ans': d.g75plus,
  }))

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

  const colors = {
    '0-24 ans': '#cadf9e',   // tea-green
    '25-59 ans': '#a4ac96',  // ash-grey
    '60-74 ans': '#857f74',  // grey-olive
    '75+ ans': '#313628',    // charcoal-brown
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
            <Bar dataKey="0-24 ans" stackId="a" fill={colors['0-24 ans']} />
            <Bar dataKey="25-59 ans" stackId="a" fill={colors['25-59 ans']} />
            <Bar dataKey="60-74 ans" stackId="a" fill={colors['60-74 ans']} />
            <Bar dataKey="75+ ans" stackId="a" fill={colors['75+ ans']} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
