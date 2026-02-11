"use client"
import React, { useEffect, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import Breadcrumbs from '../../../components/Breadcrumbs'
import PopulationLineChart from '../../../components/charts/PopulationLineChart'
import AgeGroupsStackedChart from '../../../components/charts/AgeGroupsStackedChart'
import ErrorState from '../../../components/ErrorState'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import DownloadButton from '../../../components/DownloadButton'
import EmptyState from '../../../components/EmptyState'
import {
  getPopulationTimeseries,
  getAgeGroupSharesTimeseries,
  getLatestSnapshot,
  calculatePopulationChange,
  getLatestPopulation,
  type PopulationPoint,
  type AgeGroupShares
} from '../../../lib/nantesDemography'
import { formatNumberFR, formatPercentFR } from '../../../lib/format'
import { exportTimeseriesCSV } from '../../../lib/csvExport'

export default function Nantes10YearsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [populationData, setPopulationData] = useState<PopulationPoint[]>([])
  const [ageGroupsData, setAgeGroupsData] = useState<AgeGroupShares[]>([])
  const [latestPopulation, setLatestPopulation] = useState<number | null>(null)
  const [change, setChange] = useState<{ absolute: number; percent: number } | null>(null)
  const [medianAge, setMedianAge] = useState<number | null>(null)

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

      setPopulationData(popData)
      setAgeGroupsData(ageData)
      setLatestPopulation(getLatestPopulation(popData))
      setChange(calculatePopulationChange(popData))
      setMedianAge(snapshot.medianAge ?? null)
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
            title="No Data Available"
            message="Population and age group data could not be loaded."
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
              <DownloadButton onClick={handleDownloadPopulation} label="Download CSV" />
            </div>
            <PopulationLineChart
              data={populationData}
              title="Évolution de la population"
            />
          </div>
        ) : (
          <EmptyState
            title="No Population Data"
            message="Population timeseries data is not available."
            icon="chart"
          />
        )}

        {ageGroupsData.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Répartition par tranche d'âge</h3>
              <DownloadButton onClick={handleDownloadAgeGroups} label="Download CSV" />
            </div>
            <AgeGroupsStackedChart
              data={ageGroupsData}
              title="Répartition par tranche d'âge (%)"
            />
          </div>
        ) : (
          <EmptyState
            title="No Age Group Data"
            message="Age distribution data is not available."
            icon="chart"
          />
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
      </div>
    </div>
  )
}
