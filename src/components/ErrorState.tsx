"use client"
import React from 'react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  title?: string
}

export default function ErrorState({ 
  message = 'Something went wrong',
  onRetry,
  title = 'Error'
}: ErrorStateProps) {
  return (
    <div className="card border-l-4 border-[#857f74] bg-[#f5f3f0]">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-6 w-6 text-[#857f74]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-[#313628]">{title}</h3>
          <p className="text-sm text-[#595358] mt-2">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center px-4 py-2 border border-[#857f74] rounded-md shadow-sm text-sm font-medium text-[#313628] bg-white hover:bg-[#e5f2d3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cadf9e] transition-colors"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
