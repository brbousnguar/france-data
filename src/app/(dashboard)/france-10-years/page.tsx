"use client"
import React, { useEffect, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import Breadcrumbs from '../../../components/Breadcrumbs'
import ErrorState from '../../../components/ErrorState'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import DownloadButton from '../../../components/DownloadButton'
import EmptyState from '../../../components/EmptyState'
import {
  getFrancePopulationTimeseries,
  getFranceAgeGroupSharesTimeseries,
  getLatestFrancePopulation,
  calculateFrancePopulationChange,
  calculateFranceMedianAge,
  type FrancePopulationPoint,
  type FranceAgeGroupShares
} from '../../../lib/franceDemography'
import { formatNumberFR, formatPercentFR } from '../../../lib/format'
import { exportTimeseriesCSV } from '../../../lib/csvExport'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function France10YearsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [populationData, setPopulationData] = useState<FrancePopulationPoint[]>([])
  const [ageGroupsData, setAgeGroupsData] = useState<FranceAgeGroupShares[]>([])
  const [latestPopulation, setLatestPopulation] = useState<number | null>(null)
  const [change, setChange] = useState<{ absolute: number; percent: number } | null>(null)
  const [medianAge, setMedianAge] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const popData = getFrancePopulationTimeseries()
      const ageData = getFranceAgeGroupSharesTimeseries()
      const latest = getLatestFrancePopulation()
      const changeData = calculateFrancePopulationChange()
      const median = calculateFranceMedianAge()

      setPopulationData(popData)
      setAgeGroupsData(ageData)
      setLatestPopulation(latest)
      setChange(changeData)
      setMedianAge(median)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load France demographics data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPopulation = () => {
    exportTimeseriesCSV(
      populationData.map(d => ({ date: d.date, year: d.year, population_millions: d.population })),
      'france-population'
    )
  }

  const handleDownloadAgeGroups = () => {
    exportTimeseriesCSV(
      ageGroupsData.map(d => ({ 
        date: d.date, 
        year: d.year, 
        '0-19': d['0-19'],
        '20-39': d['20-39'],
        '40-59': d['40-59'],
        '60-74': d['60-74'],
        '75+': d['75+']
      })),
      'france-age-groups'
    )
  }

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs 
          items={[
            { label: 'France en 10 ans' }
          ]}
        />
        <PageHeader
          title="France en 10 ans"
          subtitle="Évolution de la population nationale et structure par âge d'après les données publiques."
        />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="mt-8 space-y-8">
          <ChartSkeleton height="lg" />
          <ChartSkeleton height="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs 
          items={[
            { label: 'France en 10 ans' }
          ]}
        />
        <PageHeader
          title="France en 10 ans"
          subtitle="Évolution de la population nationale et structure par âge d'après les données publiques."
        />
        <div className="mt-6">
          <ErrorState message={error} onRetry={fetchData} />
        </div>
      </div>
    )
  }

  if (populationData.length === 0 && ageGroupsData.length === 0) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs 
          items={[
            { label: 'France en 10 ans' }
          ]}
        />
        <PageHeader
          title="France en 10 ans"
          subtitle="Évolution de la population nationale et structure par âge d'après les données publiques."
        />
        <div className="mt-6">
          <EmptyState
            title="No Data Available"
            message="France population data could not be loaded."
            icon="data"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'France en 10 ans' }
        ]}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="France en 10 ans"
          subtitle="Évolution de la population nationale et structure par âge d'après les données publiques."
        />
      </div>

      {/* KPIs Row - with hover effects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatCard
            title="Population actuelle"
            description={
              latestPopulation
                ? formatNumberFR(latestPopulation) + ' M habitants'
                : 'Données non disponibles'
            }
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300 animation-delay-100">
          <StatCard
            title="Évolution sur 10 ans"
            description={
              change
                ? `${change.absolute > 0 ? '+' : ''}${formatNumberFR(change.absolute)}M (${formatPercentFR(change.percent / 100, 1)})`
                : '—'
            }
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300 animation-delay-200">
          <StatCard
            title="Âge médian"
            description={medianAge ? `${medianAge.toFixed(1)} ans` : '—'}
          />
        </div>
      </div>

      {/* Population Evolution Chart */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#333333] mb-1">
              Évolution de la population française
            </h2>
            <p className="text-sm text-[#666666]">
              Population totale de la France métropolitaine et d'outre-mer (millions)
            </p>
          </div>
          <DownloadButton onClick={handleDownloadPopulation} label="Télécharger CSV" />
        </div>

        {populationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={populationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis 
                dataKey="year" 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666666"
                style={{ fontSize: '12px' }}
                label={{ value: 'Population (M)', angle: -90, position: 'insideLeft', style: { fill: '#666666' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #D9D9D9',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="population" 
                stroke="#0055A4" 
                strokeWidth={3}
                dot={{ fill: '#0055A4', r: 4 }}
                activeDot={{ r: 6 }}
                name="Population (millions)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            title="Aucune donnée"
            message="Les données de population ne sont pas disponibles."
            icon="chart"
          />
        )}
      </div>

      {/* Age Groups Distribution Chart */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#333333] mb-1">
              Répartition par tranches d'âge
            </h2>
            <p className="text-sm text-[#666666]">
              Évolution de la structure démographique (en % de la population totale)
            </p>
          </div>
          <DownloadButton onClick={handleDownloadAgeGroups} label="Télécharger CSV" />
        </div>

        {ageGroupsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ageGroupsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis 
                dataKey="year" 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666666"
                style={{ fontSize: '12px' }}
                label={{ value: 'Pourcentage (%)', angle: -90, position: 'insideLeft', style: { fill: '#666666' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #D9D9D9',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Bar dataKey="0-19" stackId="a" fill="#0055A4" name="0-19 ans" />
              <Bar dataKey="20-39" stackId="a" fill="#4A90E2" name="20-39 ans" />
              <Bar dataKey="40-59" stackId="a" fill="#F7B500" name="40-59 ans" />
              <Bar dataKey="60-74" stackId="a" fill="#FF9500" name="60-74 ans" />
              <Bar dataKey="75+" stackId="a" fill="#FF6B6B" name="75+ ans" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            title="Aucune donnée"
            message="Les données de structure par âge ne sont pas disponibles."
            icon="chart"
          />
        )}
      </div>

      {/* Data Source Note */}
      <div className="mt-6 p-4 bg-[#E8F4FD] border-l-4 border-[#0055A4] rounded">
        <p className="text-sm text-[#333333]">
          <strong>Source :</strong> Institut national de la statistique et des études économiques (INSEE).
          Données de population issues des recensements et estimations officielles.
        </p>
      </div>
    </div>
  )
}
