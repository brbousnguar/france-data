import React from 'react'

interface EmptyStateProps {
  message?: string
  title?: string
  icon?: 'chart' | 'data' | 'search'
}

export default function EmptyState({ 
  message = 'No data available',
  title = 'No Data',
  icon = 'data'
}: EmptyStateProps) {
  const icons = {
    chart: (
      <svg className="h-12 w-12 text-[#a4ac96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    data: (
      <svg className="h-12 w-12 text-[#a4ac96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    search: (
      <svg className="h-12 w-12 text-[#a4ac96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  }

  return (
    <div className="card text-center py-12">
      <div className="flex justify-center mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-medium text-[#313628] mb-2">{title}</h3>
      <p className="text-sm text-[#595358]">{message}</p>
    </div>
  )
}
