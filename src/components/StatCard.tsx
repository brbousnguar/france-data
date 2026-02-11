import React from 'react'

export default function StatCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-[#0055A4]">
      <h3 className="text-sm font-medium text-[#666666] uppercase tracking-wide mb-2">{title}</h3>
      {description && <p className="text-2xl font-bold text-[#333333]">{description}</p>}
    </div>
  )
}

