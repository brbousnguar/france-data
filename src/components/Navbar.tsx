"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white border-b border-[#a4ac96] shadow-sm">
      <div className="container container-max mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-[#313628] hover:text-[#cadf9e] transition-colors">
          France Public Data Lab
        </Link>
        <nav className="flex items-center space-x-1">
          <Link 
            href="/nantes-10-years" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/nantes-10-years')
                ? 'bg-[#cadf9e] text-[#313628]'
                : 'text-[#595358] hover:text-[#313628] hover:bg-[#e5f2d3]'
            }`}
          >
            Nantes in 10 years
          </Link>
          <Link 
            href="/cost-of-life" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/cost-of-life')
                ? 'bg-[#cadf9e] text-[#313628]'
                : 'text-[#595358] hover:text-[#313628] hover:bg-[#e5f2d3]'
            }`}
          >
            Cost of Life
          </Link>
          <Link 
            href="/api-docs" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/api-docs')
                ? 'bg-[#cadf9e] text-[#313628]'
                : 'text-[#857f74] hover:text-[#313628] hover:bg-[#e5f2d3]'
            }`}
          >
            🔌 API
          </Link>
        </nav>
      </div>
    </header>
  )
}
