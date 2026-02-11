"use client"
import React from 'react'

interface DownloadButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export default function DownloadButton({ 
  onClick, 
  disabled = false,
  label = 'Download data'
}: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center px-4 py-2 border border-[#857f74] rounded-lg shadow-sm text-sm font-medium text-[#313628] bg-white hover:bg-[#e5f2d3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cadf9e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg 
        className="h-4 w-4 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
        />
      </svg>
      {label}
    </button>
  )
}
