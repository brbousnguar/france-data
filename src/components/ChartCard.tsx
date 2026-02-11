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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

type LinePoint = { x?: string; year?: string; value: number }

export default function ChartCard({
  title,
  chartType,
  data
}: {
  title?: string
  chartType: 'line' | 'radar'
  data: any
}) {
  return (
    <div className="card">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {chartType === 'line' ? (
            <LineChart data={data as LinePoint[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(d: any) => d.year ?? d.x} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <RadarChart cx="50%" cy="50%" outerRadius={90} data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
              <Radar name="Cost" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
