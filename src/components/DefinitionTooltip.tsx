import React, { useState } from 'react'

interface DefinitionTooltipProps {
  term: string
  definition: string
  children: React.ReactNode
}

export default function DefinitionTooltip({ term, definition, children }: DefinitionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span className="relative inline-block">
      <span
        className="border-b-2 border-dotted border-[#0055A4] cursor-help text-[#0055A4] font-medium"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      {isVisible && (
        <div className="absolute z-50 w-72 p-3 mt-2 text-sm bg-white border-2 border-[#0055A4] rounded-lg shadow-xl -left-1/2 transform -translate-x-1/4">
          <div className="font-bold text-[#0055A4] mb-1">{term}</div>
          <div className="text-[#333333]">{definition}</div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#0055A4]"></div>
        </div>
      )}
    </span>
  )
}
