// Common timeseries types
export type TimeseriesPoint = {
  date: string // ISO date or year string
  value: number
}

export type TimeseriesData = TimeseriesPoint[]

// Nantes specific types
export type NantesPoint = {
  year: string
  value: number
}

export type Nantes10YearsData = {
  population: NantesPoint[]
  jobs: NantesPoint[]
}

// Cost of life types
export type CostOfLifeCategory = {
  category: string
  value: number
}

export type CostOfLifeData = CostOfLifeCategory[]

// Chart-ready types (for Recharts)
export type LineChartData = Array<{
  x?: string
  year?: string
  date?: string
  value: number
  [key: string]: any
}>

export type RadarChartData = Array<{
  category: string
  value: number
  [key: string]: any
}>

// API error type
export type ApiError = {
  message: string
  status?: number
  url?: string
}
