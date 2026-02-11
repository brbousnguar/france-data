"use client"
import React, { useEffect, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import Breadcrumbs from '../../../components/Breadcrumbs'
import ErrorState from '../../../components/ErrorState'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import DownloadButton from '../../../components/DownloadButton'
import EmptyState from '../../../components/EmptyState'
import DefinitionTooltip from '../../../components/DefinitionTooltip'
import {
  getFrancePopulationTimeseries,
  getFranceAgeGroupSharesTimeseries,
  getLatestFrancePopulation,
  calculateFrancePopulationChange,
  calculateFranceMedianAge,
  getFranceForeignPopulationTimeseries,
  getFranceTopNationalities,
  getLatestFranceForeignStats,
  type FrancePopulationPoint,
  type FranceAgeGroupShares,
  type FranceNationalityData,
  type FranceNationalityBreakdown
} from '../../../lib/franceDemography'
import { formatNumberFR, formatPercentFR } from '../../../lib/format'
import { exportTimeseriesCSV } from '../../../lib/csvExport'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function France10YearsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [populationData, setPopulationData] = useState<FrancePopulationPoint[]>([])
  const [ageGroupsData, setAgeGroupsData] = useState<FranceAgeGroupShares[]>([])
  const [foreignData, setForeignData] = useState<FranceNationalityData[]>([])
  const [nationalitiesData, setNationalitiesData] = useState<FranceNationalityBreakdown[]>([])
  const [latestPopulation, setLatestPopulation] = useState<number | null>(null)
  const [change, setChange] = useState<{ absolute: number; percent: number } | null>(null)
  const [medianAge, setMedianAge] = useState<number | null>(null)
  const [foreignStats, setForeignStats] = useState<FranceNationalityData | null>(null)

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
      const foreignPopData = getFranceForeignPopulationTimeseries()
      const nationalitiesBreakdown = getFranceTopNationalities()
      const latest = getLatestFrancePopulation()
      const changeData = calculateFrancePopulationChange()
      const median = calculateFranceMedianAge()
      const latestForeign = getLatestFranceForeignStats()

      setPopulationData(popData)
      setAgeGroupsData(ageData)
      setForeignData(foreignPopData)
      setNationalitiesData(nationalitiesBreakdown)
      setLatestPopulation(latest)
      setChange(changeData)
      setMedianAge(median)
      setForeignStats(latestForeign)
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

      {/* Foreign Population Section */}
      <div className="card mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333] mb-1">
            Population <DefinitionTooltip 
              term="Étranger" 
              definition="Personne qui réside en France et ne possède pas la nationalité française, quelle que soit son lieu de naissance."
            >
              étrangère
            </DefinitionTooltip> et <DefinitionTooltip 
              term="Immigré" 
              definition="Personne née étrangère à l'étranger et résidant en France. Elle peut avoir acquis la nationalité française ou rester de nationalité étrangère."
            >
              immigrée
            </DefinitionTooltip>
          </h2>
          <p className="text-sm text-[#666666]">
            Évolution de la population de nationalité étrangère en France
          </p>
        </div>

        {foreignStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E8F4FD] p-4 rounded border-l-4 border-[#0055A4]">
              <p className="text-xs text-[#666666] uppercase font-medium mb-1">
                <DefinitionTooltip 
                  term="Étranger" 
                  definition="Personne qui réside en France et ne possède pas la nationalité française."
                >
                  Étrangers
                </DefinitionTooltip> 2025
              </p>
              <p className="text-2xl font-bold text-[#333333]">{formatNumberFR(foreignStats.foreigners)}M</p>
              <p className="text-sm text-[#666666] mt-1">{formatPercentFR(foreignStats.foreignersPercent / 100, 1)} de la population</p>
            </div>
            <div className="bg-[#E8F4FD] p-4 rounded border-l-4 border-[#4A90E2]">
              <p className="text-xs text-[#666666] uppercase font-medium mb-1">
                <DefinitionTooltip 
                  term="Immigré" 
                  definition="Personne née étrangère à l'étranger et résidant en France. Elle peut avoir acquis la nationalité française."
                >
                  Immigrés
                </DefinitionTooltip> 2025
              </p>
              <p className="text-2xl font-bold text-[#333333]">{formatNumberFR(foreignStats.immigrants)}M</p>
              <p className="text-sm text-[#666666] mt-1">{formatPercentFR(foreignStats.immigrantsPercent / 100, 1)} de la population</p>
            </div>
            <div className="bg-[#E8F4FD] p-4 rounded border-l-4 border-[#F7B500]">
              <p className="text-xs text-[#666666] uppercase font-medium mb-1">Croissance étrangers</p>
              <p className="text-2xl font-bold text-[#333333]">+{formatNumberFR(foreignStats.foreigners - foreignData[0].foreigners)}M</p>
              <p className="text-sm text-[#666666] mt-1">depuis 2015</p>
            </div>
            <div className="bg-[#E8F4FD] p-4 rounded border-l-4 border-[#FF9500]">
              <p className="text-xs text-[#666666] uppercase font-medium mb-1">Évolution</p>
              <p className="text-2xl font-bold text-[#333333]">
                +{formatPercentFR((foreignStats.foreignersPercent - foreignData[0].foreignersPercent) / 100, 1)}
              </p>
              <p className="text-sm text-[#666666] mt-1">points en 10 ans</p>
            </div>
          </div>
        )}

        {foreignData.length > 0 && (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={foreignData}>
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
                dataKey="foreigners" 
                stroke="#0055A4" 
                strokeWidth={2}
                dot={{ fill: '#0055A4', r: 3 }}
                name="Étrangers (millions)"
              />
              <Line 
                type="monotone" 
                dataKey="immigrants" 
                stroke="#4A90E2" 
                strokeWidth={2}
                dot={{ fill: '#4A90E2', r: 3 }}
                name="Immigrés (millions)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Nationalities Breakdown */}
      <div className="card mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333] mb-1">
            Principales nationalités étrangères
          </h2>
          <p className="text-sm text-[#666666]">
            Répartition des étrangers par pays d'origine (2025)
          </p>
        </div>

        {nationalitiesData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#D9D9D9]">
                  <th className="text-left py-3 px-2 font-semibold text-[#333333]">Pays</th>
                  <th className="text-right py-3 px-2 font-semibold text-[#333333]">Population</th>
                  <th className="text-right py-3 px-2 font-semibold text-[#333333]">% des étrangers</th>
                  <th className="text-right py-3 px-2 font-semibold text-[#333333]">% population totale</th>
                </tr>
              </thead>
              <tbody>
                {nationalitiesData.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#E8E8E8] hover:bg-[#F5F5F5]">
                    <td className="py-3 px-2 text-[#333333] font-medium">{item.nationality}</td>
                    <td className="py-3 px-2 text-right text-[#666666]">
                      {item.nationality === 'Autres' ? 
                        formatNumberFR(item.population) + ' 000' : 
                        formatNumberFR(item.population) + ' 000'}
                    </td>
                    <td className="py-3 px-2 text-right text-[#666666]">
                      {formatPercentFR(item.percentOfForeigners / 100, 1)}
                    </td>
                    <td className="py-3 px-2 text-right text-[#666666]">
                      {formatPercentFR(item.percentOfTotal / 100, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Source Note */}
      <div className="mt-6 p-4 bg-[#E8F4FD] border-l-4 border-[#0055A4] rounded">
        <p className="text-sm text-[#333333] mb-3">
          <strong>Source :</strong> Institut national de la statistique et des études économiques (INSEE).
          Données de population issues des recensements et estimations officielles.
        </p>
        <div className="mt-3 pt-3 border-t border-[#0055A4]/20">
          <p className="text-xs text-[#333333] mb-2"><strong>Définitions :</strong></p>
          <ul className="text-xs text-[#666666] space-y-1">
            <li>
              <strong className="text-[#0055A4]">Étranger :</strong> Personne qui réside en France et ne possède pas la nationalité française, quelle que soit son lieu de naissance (y compris les personnes nées en France).
            </li>
            <li>
              <strong className="text-[#0055A4]">Immigré :</strong> Personne née étrangère à l'étranger et résidant en France. Un immigré peut avoir acquis la nationalité française ou rester de nationalité étrangère. Un immigré n'est pas forcément étranger et réciproquement.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
