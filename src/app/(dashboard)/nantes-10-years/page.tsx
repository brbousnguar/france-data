"use client"
import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import Breadcrumbs from '../../../components/Breadcrumbs'
import PopulationLineChart from '../../../components/charts/PopulationLineChart'
import AgeGroupsStackedChart from '../../../components/charts/AgeGroupsStackedChart'
import ErrorState from '../../../components/ErrorState'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import DownloadButton from '../../../components/DownloadButton'
import EmptyState from '../../../components/EmptyState'
import DefinitionTooltip from '../../../components/DefinitionTooltip'
import {
  getPopulationTimeseries,
  getAgeGroupSharesTimeseries,
  getLatestSnapshot,
  calculatePopulationChange,
  getLatestPopulation,
  getNantesForeignPopulationTimeseries,
  getNantesTopNationalities,
  getLatestNantesForeignStats,
  type PopulationPoint,
  type AgeGroupShares,
  type NantesNationalityData,
  type NantesNationalityBreakdown
} from '../../../lib/nantesDemography'
import { formatNumberFR, formatPercentFR } from '../../../lib/format'
import { exportTimeseriesCSV } from '../../../lib/csvExport'

export default function Nantes10YearsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [populationData, setPopulationData] = useState<PopulationPoint[]>([])
  const [ageGroupsData, setAgeGroupsData] = useState<AgeGroupShares[]>([])
  const [foreignData, setForeignData] = useState<NantesNationalityData[]>([])
  const [nationalitiesData, setNationalitiesData] = useState<NantesNationalityBreakdown[]>([])
  const [latestPopulation, setLatestPopulation] = useState<number | null>(null)
  const [change, setChange] = useState<{ absolute: number; percent: number } | null>(null)
  const [medianAge, setMedianAge] = useState<number | null>(null)
  const [foreignStats, setForeignStats] = useState<NantesNationalityData | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [popData, ageData, snapshot] = await Promise.all([
        getPopulationTimeseries(),
        getAgeGroupSharesTimeseries(),
        getLatestSnapshot()
      ])

      const foreignPopData = getNantesForeignPopulationTimeseries()
      const nationalitiesBreakdown = getNantesTopNationalities()
      const latestForeign = getLatestNantesForeignStats()

      setPopulationData(popData)
      setAgeGroupsData(ageData)
      setForeignData(foreignPopData)
      setNationalitiesData(nationalitiesBreakdown)
      setLatestPopulation(getLatestPopulation(popData))
      setChange(calculatePopulationChange(popData))
      setMedianAge(snapshot.medianAge ?? null)
      setForeignStats(latestForeign)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDownloadPopulation = () => {
    exportTimeseriesCSV(
      populationData.map(d => ({ date: d.date, population: d.value })),
      'nantes-population'
    )
  }

  const handleDownloadAgeGroups = () => {
    exportTimeseriesCSV(ageGroupsData, 'nantes-age-groups')
  }

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs 
          items={[
            { label: 'Nantes en 10 ans' }
          ]}
        />
        <PageHeader
          title="Nantes en 10 ans"
          subtitle="Évolution de la population et structure par âge d'après les données publiques."
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
            { label: 'Nantes en 10 ans' }
          ]}
        />
        <PageHeader
          title="Nantes en 10 ans"
          subtitle="Évolution de la population et structure par âge d'après les données publiques."
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
            { label: 'Nantes en 10 ans' }
          ]}
        />
        <PageHeader
          title="Nantes en 10 ans"
          subtitle="Évolution de la population et structure par âge d'après les données publiques."
        />
        <div className="mt-6">
          <EmptyState
            title="Aucune donnée disponible"
            message="Les données de population et de structure par âge ne peuvent pas être chargées."
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
          { label: 'Nantes en 10 ans' }
        ]}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Nantes en 10 ans"
          subtitle="Évolution de la population et structure par âge d'après les données publiques."
        />
      </div>

      {/* KPIs Row - with hover effects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatCard
            title="Population actuelle"
            description={
              latestPopulation
                ? formatNumberFR(latestPopulation) + ' habitants'
                : 'Données non disponibles'
            }
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300 animation-delay-100">
          <StatCard
            title="Évolution sur 10 ans"
            description={
              change
                ? `${change.absolute > 0 ? '+' : ''}${formatNumberFR(change.absolute)} (${formatPercentFR(change.percent / 100, 1)})`
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

      {/* Charts */}
      <div className="mt-8 space-y-8">
        {populationData.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Évolution de la population</h3>
              <DownloadButton onClick={handleDownloadPopulation} label="Télécharger CSV" />
            </div>
            <PopulationLineChart
              data={populationData}
              title="Évolution de la population"
            />
          </div>
        ) : (
          <EmptyState
            title="Aucune donnée de population"
            message="Les données de population ne sont pas disponibles."
            icon="chart"
          />
        )}

        {ageGroupsData.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Répartition par tranche d'âge</h3>
              <DownloadButton onClick={handleDownloadAgeGroups} label="Télécharger CSV" />
            </div>
            <AgeGroupsStackedChart
              data={ageGroupsData}
              title="Répartition par tranche d'âge (%)"
            />
          </div>
        ) : (
          <EmptyState
            title="Aucune donnée de structure par âge"
            message="Les données de répartition par âge ne sont pas disponibles."
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
            </DefinitionTooltip> à Nantes
          </h2>
          <p className="text-sm text-[#666666]">
            Évolution de la population de nationalité étrangère
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
                </DefinitionTooltip> 2024
              </p>
              <p className="text-2xl font-bold text-[#333333]">{formatNumberFR(foreignStats.foreigners)}</p>
              <p className="text-sm text-[#666666] mt-1">{formatPercentFR(foreignStats.foreignersPercent / 100, 1)} de la population</p>
            </div>
            <div className="bg-[#E8F4FD] p-4 rounded border-l-4 border-[#4A90E2]">
              <p className="text-xs text-[#666666] uppercase font-medium mb-1">
                <DefinitionTooltip 
                  term="Immigré" 
                  definition="Personne née étrangère à l'étranger et résidant en France. Elle peut avoir acquis la nationalité française."
                >
                  Immigrés
                </DefinitionTooltip> 2024
              </p>
              <p className="text-2xl font-bold text-[#333333]">{formatNumberFR(foreignStats.immigrants)}</p>
              <p className="text-sm text-[#666666] mt-1">{formatPercentFR(foreignStats.immigrantsPercent / 100, 1)} de la population</p>
            </div>
            <div className="bg-[#E8F4FD] p-4 rounded border-l-4 border-[#F7B500]">
              <p className="text-xs text-[#666666] uppercase font-medium mb-1">Croissance étrangers</p>
              <p className="text-2xl font-bold text-[#333333]">+{formatNumberFR(foreignStats.foreigners - foreignData[0].foreigners)}</p>
              <p className="text-sm text-[#666666] mt-1">depuis 2013</p>
            </div>
            <div className="bg-[#E8F4FD] p-4 rounded border-l-4 border-[#FF9500]">
              <p className="text-xs text-[#666666] uppercase font-medium mb-1">Évolution</p>
              <p className="text-2xl font-bold text-[#333333]">
                +{formatPercentFR((foreignStats.foreignersPercent - foreignData[0].foreignersPercent) / 100, 1)}
              </p>
              <p className="text-sm text-[#666666] mt-1">points en 11 ans</p>
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
                label={{ value: 'Population', angle: -90, position: 'insideLeft', style: { fill: '#666666' } }}
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
                name="Étrangers"
              />
              <Line 
                type="monotone" 
                dataKey="immigrants" 
                stroke="#4A90E2" 
                strokeWidth={2}
                dot={{ fill: '#4A90E2', r: 3 }}
                name="Immigrés"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Nationalities Breakdown */}
      <div className="card mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333] mb-1">
            Principales nationalités étrangères à Nantes
          </h2>
          <p className="text-sm text-[#666666]">
            Répartition des étrangers par pays d'origine (2024)
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
                      {formatNumberFR(item.population)}
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
      <div className="mt-8 text-xs text-gray-500 border-t pt-4">
        <p>
          <strong>Source des données :</strong> INSEE / Recensement de la population (données officielles publiées)
        </p>
        <p className="mt-1">
          Les données affichées sont issues des publications officielles de l&apos;INSEE. 
          Population : Recensements 2013-2024 (données certifiées). 
          Structure par âge : Pyramide des âges Nantes Métropole (estimations démographiques officielles).
        </p>
        <div className="mt-3 pt-3 border-t border-gray-300">
          <p className="mb-2"><strong>Définitions :</strong></p>
          <ul className="space-y-1 text-gray-600">
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
