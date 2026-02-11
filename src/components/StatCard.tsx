import React from 'react'

export default function StatCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-[#cadf9e]">
      <h3 className="text-lg font-medium text-[#313628]">{title}</h3>
      {description && <p className="text-sm text-[#595358] mt-2">{description}</p>}
    </div>
  )
}
