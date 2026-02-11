import Link from 'next/link'
import React from 'react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

export default function Home() {
  return (
    <div>
      <PageHeader title="France Public Data Lab" subtitle="Nantes dashboards" />

      {/* Real Data Badge */}
      <div className="mt-6 bg-[#e5f2d3] border-l-4 border-[#cadf9e] rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-[#cadf9e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-[#313628]">✅ Données officielles réelles - INSEE</h3>
            <p className="mt-1 text-xs text-[#595358]">
              Toutes les données affichées proviennent des <strong>publications officielles de l&apos;INSEE</strong>.
              Pas de données de test, pas de simulations - uniquement des valeurs vérifiées et certifiées.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/nantes-10-years" className="block">
          <StatCard 
            title="Nantes en 10 ans" 
            description="Observatoire démographique : population et structure par âge" 
          />
        </Link>

        <Link href="/cost-of-life" className="block">
          <StatCard 
            title="Observatoire du coût de la vie" 
            description="Inflation officielle et ressentie, tendances sur 10 ans" 
          />
        </Link>
      </div>
    </div>
  )
}
