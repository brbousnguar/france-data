"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import AlertBadge from './AlertBadge'

const NAV_LINKS = [
  { href: '/cost-of-life',       label: 'Coût de la vie' },
  { href: '/purchasing-power',   label: 'Pouvoir d\'achat' },
  { href: '/personal-inflation', label: 'Mon inflation' },
  { href: '/rental-market',      label: 'Loyers' },
  { href: '/rates',              label: 'Taux & BCE' },
  { href: '/smic-salary',        label: 'SMIC' },
  { href: '/job-market',         label: 'Emploi Tech' },
  { href: '/france-10-years',    label: 'France' },
  { href: '/nantes-10-years',    label: 'Nantes' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-[#0055A4] text-white shadow-sm">
      <div className="container container-max mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-lg font-semibold text-white hover:text-[#F7B500] transition-colors flex items-center flex-shrink-0"
        >
          <span className="mr-2 text-xl">📊</span>
          <span className="hidden sm:inline">France Public Data Lab</span>
          <span className="sm:hidden">FPD Lab</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-wrap">
          {/* Mon Profil — primary CTA */}
          <Link
            href="/mon-profil"
            className={`px-3 py-2 text-sm font-semibold transition-colors rounded ${
              isActive('/mon-profil')
                ? 'bg-[#F7B500] text-[#313628]'
                : 'bg-white/10 text-[#F7B500] border border-[#F7B500]/50 hover:bg-[#F7B500] hover:text-[#313628]'
            }`}
          >
            Mon Profil
          </Link>

          <span className="text-white/30 mx-1">|</span>

          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-white text-[#0055A4] rounded'
                  : 'text-white hover:text-[#F7B500]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/alerts"
            className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
              isActive('/alerts')
                ? 'bg-white text-[#0055A4] rounded'
                : 'text-white hover:text-[#F7B500]'
            }`}
          >
            Alertes
            <AlertBadge />
          </Link>
        </nav>

        {/* Mobile: Mon Profil + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <Link
            href="/mon-profil"
            className="px-3 py-1.5 text-xs font-semibold bg-[#F7B500] text-[#313628] rounded"
          >
            Mon Profil
          </Link>
          <Link href="/alerts" className="flex items-center text-white">
            <span className="text-sm">🔔</span>
            <AlertBadge />
          </Link>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 text-white hover:text-[#F7B500]"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/20 bg-[#004494]">
          <nav className="container container-max mx-auto px-4 py-3 grid grid-cols-2 gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  isActive(link.href)
                    ? 'bg-white text-[#0055A4] font-medium'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
