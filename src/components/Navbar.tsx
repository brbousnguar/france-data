"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-[#0055A4] text-white shadow-sm">
      <div className="container container-max mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-white hover:text-[#F7B500] transition-colors flex items-center">
          <span className="mr-2 text-2xl">📊</span>
          France Public Data Lab
        </Link>
        <nav className="flex items-center space-x-1">
          <Link 
            href="/france-10-years" 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/france-10-years')
                ? 'bg-white text-[#0055A4] rounded'
                : 'text-white hover:text-[#F7B500]'
            }`}
          >
            France in 10 years
          </Link>
          <Link 
            href="/nantes-10-years" 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/nantes-10-years')
                ? 'bg-white text-[#0055A4] rounded'
                : 'text-white hover:text-[#F7B500]'
            }`}
          >
            Nantes in 10 years
          </Link>
          <Link 
            href="/cost-of-life" 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/cost-of-life')
                ? 'bg-white text-[#0055A4] rounded'
                : 'text-white hover:text-[#F7B500]'
            }`}
          >
            Cost of Life
          </Link>
        </nav>
      </div>
    </header>
  )
}

