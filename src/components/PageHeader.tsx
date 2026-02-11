import React from 'react'

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header>
      <h1 className="text-2xl font-semibold text-[#313628]">{title}</h1>
      {subtitle && <p className="text-sm text-[#595358] mt-1">{subtitle}</p>}
    </header>
  )
}
