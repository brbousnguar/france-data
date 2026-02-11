import React from 'react'

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-semibold text-[#0055A4] mb-2">{title}</h1>
      {subtitle && <p className="text-base text-[#666666]">{subtitle}</p>}
    </header>
  )
}

