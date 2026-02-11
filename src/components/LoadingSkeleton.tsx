"use client"
import React from 'react'

interface LoadingSkeletonProps {
  lines?: number
  height?: 'sm' | 'md' | 'lg' | 'xl'
  showChart?: boolean
}

export default function LoadingSkeleton({ 
  lines = 3, 
  height = 'md',
  showChart = false 
}: LoadingSkeletonProps) {
  const heightClasses = {
    sm: 'h-24',
    md: 'h-40',
    lg: 'h-64',
    xl: 'h-96'
  }

  return (
    <div className="card animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-6 bg-[#a4ac96] rounded w-3/4 mb-3" />
        <div className="h-4 bg-[#a4ac96] rounded w-1/2" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-[#a4ac96] rounded w-full" />
        ))}
      </div>

      {/* Chart skeleton */}
      {showChart && (
        <div className={`mt-6 bg-[#e5f2d3] rounded-lg ${heightClasses[height]}`} />
      )}
    </div>
  )
}

// Specific skeleton for stat cards
export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-[#a4ac96] rounded w-1/2 mb-3" />
      <div className="h-8 bg-[#a4ac96] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#a4ac96] rounded w-2/3" />
    </div>
  )
}

// Skeleton for chart sections
export function ChartSkeleton({ height = 'lg' }: { height?: 'md' | 'lg' | 'xl' }) {
  const heightClasses = {
    md: 'h-64',
    lg: 'h-80',
    xl: 'h-96'
  }

  return (
    <div className="card animate-pulse">
      <div className="h-5 bg-[#a4ac96] rounded w-1/3 mb-6" />
      <div className={`bg-[#e5f2d3] rounded-lg ${heightClasses[height]}`} />
    </div>
  )
}
