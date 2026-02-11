import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header - INSEE style */}
      <section className="bg-[#0055A4] text-white py-8 px-6 -mx-6 -mt-6">
        <h1 className="text-3xl font-semibold mb-3 text-white">France Public Data Lab</h1>
        <p className="text-lg text-blue-100">
          Explorez les données publiques françaises issues des publications officielles de l'INSEE
        </p>
      </section>

      {/* Key Indicators - INSEE Homepage style */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/france-10-years" className="bg-white border border-[#D9D9D9] p-6 hover:shadow-md transition-shadow">
          <div className="text-[#0055A4] text-5xl mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#333333] mb-1">69,08<sup className="text-lg">M</sup></p>
            <p className="text-sm text-[#666666] font-medium">Population</p>
            <p className="text-xs text-[#999999] mt-1">France 2025</p>
          </div>
        </Link>

        <Link href="/cost-of-life" className="bg-white border border-[#D9D9D9] p-6 hover:shadow-md transition-shadow">
          <div className="text-[#0055A4] text-5xl mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#333333] mb-1">+ 0,3<sup className="text-xl">%</sup></p>
            <p className="text-sm text-[#666666] font-medium">Inflation</p>
            <p className="text-xs text-[#999999] mt-1">Février 2026</p>
          </div>
        </Link>

        <div className="bg-white border border-[#D9D9D9] p-6">
          <div className="text-[#0055A4] text-5xl mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#333333] mb-1">+ 0,2<sup className="text-xl">%</sup></p>
            <p className="text-sm text-[#666666] font-medium">Croissance</p>
            <p className="text-xs text-[#999999] mt-1">T4 2025</p>
          </div>
        </div>

        <div className="bg-white border border-[#D9D9D9] p-6">
          <div className="text-[#0055A4] text-5xl mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#333333] mb-1">7,9<sup className="text-xl">%</sup></p>
            <p className="text-sm text-[#666666] font-medium">Chômage</p>
            <p className="text-xs text-[#999999] mt-1">T4 2025</p>
          </div>
        </div>
      </section>

      {/* Latest Publications - INSEE style */}
      <section>
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-[#0055A4] mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h2 className="text-xl font-semibold text-[#333333]">Tableaux de bord disponibles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/france-10-years" 
            className="group bg-white border border-[#D9D9D9] p-5 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="flex-shrink-0 mr-4">
              <div className="w-16 h-16 bg-[#E8F4FD] rounded flex items-center justify-center">
                <svg className="w-8 h-8 text-[#0055A4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#333333] mb-1 group-hover:text-[#0055A4]">
                France en 10 ans
              </h3>
              <p className="text-sm text-[#666666] mb-2">
                Observatoire démographique national : évolution et projections
              </p>
              <p className="text-xs text-[#999999]">
                Données 2015-2025 • 69,08M habitants
              </p>
            </div>
            <svg className="w-5 h-5 text-[#0055A4] flex-shrink-0 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            href="/nantes-10-years" 
            className="group bg-white border border-[#D9D9D9] p-5 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="flex-shrink-0 mr-4">
              <div className="w-16 h-16 bg-[#E8F4FD] rounded flex items-center justify-center">
                <svg className="w-8 h-8 text-[#0055A4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#333333] mb-1 group-hover:text-[#0055A4]">
                Nantes en 10 ans
              </h3>
              <p className="text-sm text-[#666666] mb-2">
                Observatoire démographique : population et structure par âge
              </p>
              <p className="text-xs text-[#999999]">
                Données 2013-2024 • 325 800 habitants
              </p>
            </div>
            <svg className="w-5 h-5 text-[#0055A4] flex-shrink-0 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            href="/cost-of-life" 
            className="group bg-white border border-[#D9D9D9] p-5 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="flex-shrink-0 mr-4">
              <div className="w-16 h-16 bg-[#E8F4FD] rounded flex items-center justify-center">
                <svg className="w-8 h-8 text-[#0055A4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#333333] mb-1 group-hover:text-[#0055A4]">
                Observatoire du coût de la vie
              </h3>
              <p className="text-sm text-[#666666] mb-2">
                Inflation officielle et ressentie, tendances sur 10 ans
              </p>
              <p className="text-xs text-[#999999]">
                Février 2026 • 0,3% actuel
              </p>
            </div>
            <svg className="w-5 h-5 text-[#0055A4] flex-shrink-0 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
