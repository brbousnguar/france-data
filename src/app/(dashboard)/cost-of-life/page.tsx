"use client"
import React, { useEffect, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import Breadcrumbs from '../../../components/Breadcrumbs'
import InflationLineChart from '../../../components/charts/InflationLineChart'
import FeltInflationChart from '../../../components/charts/FeltInflationChart'
import ErrorState from '../../../components/ErrorState'
import { ChartSkeleton, StatCardSkeleton } from '../../../components/LoadingSkeleton'
import DownloadButton from '../../../components/DownloadButton'
import EmptyState from '../../../components/EmptyState'
import {
  getInflationYoYTimeseries,
  getFeltInflationTimeseries,
  getInflationKPIs,
  type InflationPoint,
  type FeltInflationPoint,
  type InflationKPIs
} from '../../../lib/inflation'
import { formatPercentFR, formatDateMonthYearFR } from '../../../lib/format'
import { exportTimeseriesCSV } from '../../../lib/csvExport'

export default function CostOfLifePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inflationData, setInflationData] = useState<InflationPoint[]>([])
  const [feltData, setFeltData] = useState<FeltInflationPoint[]>([])
  const [latestDate, setLatestDate] = useState<string | null>(null)
  const [kpis, setKpis] = useState<InflationKPIs>({
    latestYoY: 0,
    avg12Months: 0,
    peak10Years: 0,
    peakDate: undefined
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [inflData, feltInflData, kpisData] = await Promise.all([
        getInflationYoYTimeseries(),
        getFeltInflationTimeseries(),
        getInflationKPIs()
      ])

      setInflationData(inflData)
      setFeltData(feltInflData)
      setKpis(kpisData)
      if (inflData.length > 0) {
        setLatestDate(inflData[inflData.length - 1].date)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDownloadInflation = () => {
    exportTimeseriesCSV(
      inflationData.map(d => ({ date: d.date, inflation_yoy: d.value })),
      'france-inflation'
    )
  }

  const handleDownloadFelt = () => {
    exportTimeseriesCSV(feltData, 'france-inflation-felt')
  }

  // Format peak date
  const peakDateFormatted = kpis.peakDate
    ? formatDateMonthYearFR(kpis.peakDate + '-01')
    : 'N/A'

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs 
          items={[
            { label: 'Observatoire du coût de la vie' }
          ]}
        />
        <PageHeader
          title="Observatoire du coût de la vie"
          subtitle="Suivez l'évolution de l'inflation officielle et d'un indicateur d'inflation ressentie."
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
            { label: 'Observatoire du coût de la vie' }
          ]}
        />
        <PageHeader
          title="Observatoire du coût de la vie"
          subtitle="Suivez l'évolution de l'inflation officielle et d'un indicateur d'inflation ressentie."
        />
        <div className="mt-6">
          <ErrorState message={error} onRetry={fetchData} />
        </div>
      </div>
    )
  }

  if (inflationData.length === 0 && feltData.length === 0) {
    return (
      <div className="animate-fadeIn">
        <Breadcrumbs 
          items={[
            { label: 'Observatoire du coût de la vie' }
          ]}
        />
        <PageHeader
          title="Observatoire du coût de la vie"
          subtitle="Suivez l'évolution de l'inflation officielle et d'un indicateur d'inflation ressentie."
        />
        <div className="mt-6">
          <EmptyState
            title="Aucune donnée disponible"
            message="Les données d'inflation ne peuvent pas être chargées."
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
          { label: 'Observatoire du coût de la vie' }
        ]}
      />
      
      {/* Header */}
      <PageHeader
        title="Observatoire du coût de la vie"
        subtitle="Suivez l'évolution de l'inflation officielle et d'un indicateur d'inflation ressentie."
      />

      {/* KPIs Row - with hover effects */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatCard
            title={latestDate ? `Inflation actuelle (${formatDateMonthYearFR(latestDate + '-01')})` : 'Inflation actuelle'}
            description={formatPercentFR(kpis.latestYoY / 100, 1)}
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300 animation-delay-100">
          <StatCard
            title="Moyenne 12 mois"
            description={formatPercentFR(kpis.avg12Months / 100, 1)}
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300 animation-delay-200">
          <StatCard
            title="Pic sur 10 ans"
            description={`${formatPercentFR(kpis.peak10Years / 100, 1)} (${peakDateFormatted})`}
          />
        </div>
      </div>

      {/* Main explanation */}
      <div className="mt-6 bg-[#e5f2d3] border border-[#cadf9e] rounded-lg p-4">
        <h4 className="font-semibold text-sm text-[#313628] mb-2">
          📊 Qu&apos;est-ce que l&apos;inflation ?
        </h4>
        <p className="text-xs text-[#595358] mb-2">
          L&apos;<strong>inflation officielle</strong> mesure l&apos;augmentation générale des prix 
          sur un an (glissement annuel ou "a/a" = année/année), calculée à partir de l&apos;Indice 
          des Prix à la Consommation (IPC). La Banque Centrale Européenne vise une inflation de 2% par an.
        </p>
        <p className="text-xs text-[#595358]">
          L&apos;<strong>inflation ressentie</strong> est un indicateur ludique qui tente de capturer 
          comment les gens perçoivent l&apos;inflation au quotidien. Elle est souvent plus élevée 
          que l&apos;inflation officielle car nous remarquons davantage les hausses de prix 
          (pain, essence, loyer) que les baisses (électronique, vêtements).
        </p>
      </div>

      {/* Charts */}
      <div className="mt-8 space-y-8">
        {inflationData.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Inflation annuelle (glissement sur 12 mois)</h3>
              <DownloadButton onClick={handleDownloadInflation} label="Télécharger CSV" />
            </div>
            <InflationLineChart
              data={inflationData}
              title="Inflation annuelle (glissement sur 12 mois)"
              showLast={36} // Show last 3 years
            />
          </div>
        ) : (
          <EmptyState
            title="Aucune donnée d'inflation"
            message="Les données officielles d'inflation ne sont pas disponibles."
            icon="chart"
          />
        )}

        {feltData.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Inflation officielle vs ressentie</h3>
              <DownloadButton onClick={handleDownloadFelt} label="Télécharger CSV" />
            </div>
            <FeltInflationChart
              data={feltData}
              title="Comparaison : Inflation officielle vs ressentie"
              showLast={36} // Show last 3 years
            />
          </div>
        ) : (
          <EmptyState
            title="Aucune donnée d'inflation ressentie"
            message="La comparaison de l'inflation ressentie n'est pas disponible."
            icon="chart"
          />
        )}
      </div>

      {/* Methodology note */}
      <div className="mt-8 text-xs text-[#595358] border-t border-[#a4ac96] pt-4">
        <p className="font-semibold mb-2 text-[#313628]">Sources et méthodologie</p>
        <p className="mb-1">
          <strong>Inflation officielle :</strong> INSEE / Eurostat - Indice des Prix à la Consommation (IPC) harmonisé.
          Les données affichées sont les valeurs officielles publiées mensuellement
          {inflationData.length > 0 && ` (${formatDateMonthYearFR(inflationData[0].date + '-01')} – ${formatDateMonthYearFR(inflationData[inflationData.length - 1].date + '-01')})`}.
          Source : Publications INSEE - Conjoncture mensuelle.
        </p>
        <p className="mb-1">
          <strong>Inflation ressentie :</strong> Calculée selon la formule :<br />
          <code className="bg-[#e5f2d3] px-1 py-0.5 rounded text-xs text-[#313628]">
            inflation_ressentie = 0.6 × inflation_actuelle + 0.4 × moyenne_6_mois + facteur_choc
          </code>
        </p>
        <p className="mt-2 text-[#857f74] italic">
          Toutes les données d&apos;inflation officielle sont issues des publications de l&apos;INSEE.
          Les valeurs reflètent l&apos;évolution réelle de l&apos;IPC en France métropolitaine.
        </p>
      </div>
    </div>
  )
}
