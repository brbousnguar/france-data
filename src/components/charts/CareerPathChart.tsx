"use client"

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, ReferenceDot,
} from 'recharts'
import { CAREER_PATHS } from '@/lib/jobMarket'

type Props = {
  currentSalary: number
}

// Build a unified x-axis from 0 to 12 years
const X_POINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function interpolate(path: typeof CAREER_PATHS[0], year: number): number | null {
  const pts = path.points
  if (year < pts[0].years || year > pts[pts.length - 1].years) return null
  for (let i = 0; i < pts.length - 1; i++) {
    if (year >= pts[i].years && year <= pts[i + 1].years) {
      const t = (year - pts[i].years) / (pts[i + 1].years - pts[i].years)
      return Math.round(pts[i].salary + t * (pts[i + 1].salary - pts[i].salary))
    }
  }
  return null
}

export default function CareerPathChart({ currentSalary }: Props) {
  const chartData = X_POINTS.map(y => {
    const row: Record<string, number | null> = { years: y }
    for (const path of CAREER_PATHS) {
      row[path.name] = interpolate(path, y)
    }
    return row
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-[#a4ac96] rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-[#313628] mb-2">{label} an{label > 1 ? 's' : ''} d&apos;expérience</p>
        {payload.map((p: any) => p.value !== null && (
          <p key={p.name} style={{ color: p.color }}>
            {p.name} : <span className="font-semibold">{p.value} K€</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#a4ac96" />
            <XAxis
              dataKey="years"
              tick={{ fill: '#595358', fontSize: 12 }}
              tickFormatter={v => `${v} ans`}
            />
            <YAxis
              tick={{ fill: '#595358', fontSize: 12 }}
              tickFormatter={v => `${v} K€`}
              domain={[30, 110]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* Current salary reference line */}
            <ReferenceLine
              y={currentSalary / 1000}
              stroke="#F7B500"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{ value: `Vous aujourd'hui (${(currentSalary / 1000).toFixed(0)} K€)`, fill: '#7a4200', fontSize: 11, position: 'insideTopRight' }}
            />

            {CAREER_PATHS.map(path => (
              <Line
                key={path.name}
                type="monotone"
                dataKey={path.name}
                stroke={path.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: path.color }}
                connectNulls={false}
                name={path.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-[#595358] bg-[#e5f2d3] border border-[#cadf9e] rounded p-3">
        <p className="font-semibold mb-1 text-[#313628]">📈 Projection salariale estimative</p>
        <p>
          Basé sur les données APEC, Glassdoor et LinkedIn Salary 2024 pour la France.
          Les fourchettes sont indicatives et varient selon l&apos;entreprise, la région et la certification.
          La ligne jaune représente votre salaire actuel.
        </p>
      </div>
    </div>
  )
}
