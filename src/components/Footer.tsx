import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#D9D9D9] mt-auto">
      <div className="container container-max mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-[#666666]">
          <p className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-[#0055A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Built with France public open data</span>
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="https://www.data.gouv.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#666666] hover:text-[#0055A4] hover:underline transition-colors"
            >
              data.gouv.fr
            </a>
            <span className="text-[#D9D9D9]">•</span>
            <a 
              href="https://www.insee.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#666666] hover:text-[#0055A4] hover:underline transition-colors"
            >
              INSEE
            </a>
            <span className="text-[#D9D9D9]">•</span>
            <Link 
              href="/api-docs"
              className="text-[#666666] hover:text-[#0055A4] hover:underline transition-colors"
            >
              API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
