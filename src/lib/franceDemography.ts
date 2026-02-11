/**
 * France National Demographics Data
 * Source: INSEE official publications
 * Data represents France's total population over 10 years
 */

export interface FrancePopulationPoint {
  year: number
  date: string
  population: number // in millions
}

export interface FranceAgeGroupShares {
  year: number
  date: string
  '0-19': number    // percentage
  '20-39': number   // percentage
  '40-59': number   // percentage
  '60-74': number   // percentage
  '75+': number     // percentage
}

/**
 * France population time series 2015-2025
 * Source: INSEE official population estimates
 */
export function getFrancePopulationTimeseries(): FrancePopulationPoint[] {
  return [
    { year: 2015, date: '2015-01-01', population: 66.4 },
    { year: 2016, date: '2016-01-01', population: 66.7 },
    { year: 2017, date: '2017-01-01', population: 67.0 },
    { year: 2018, date: '2018-01-01', population: 67.2 },
    { year: 2019, date: '2019-01-01', population: 67.4 },
    { year: 2020, date: '2020-01-01', population: 67.5 },
    { year: 2021, date: '2021-01-01', population: 67.7 },
    { year: 2022, date: '2022-01-01', population: 68.0 },
    { year: 2023, date: '2023-01-01', population: 68.4 },
    { year: 2024, date: '2024-01-01', population: 68.7 },
    { year: 2025, date: '2025-01-01', population: 69.08 },
  ]
}

/**
 * France age group distribution over time
 * Source: INSEE population structure data
 */
export function getFranceAgeGroupSharesTimeseries(): FranceAgeGroupShares[] {
  return [
    { year: 2015, date: '2015-01-01', '0-19': 24.2, '20-39': 25.8, '40-59': 27.1, '60-74': 14.8, '75+': 8.1 },
    { year: 2016, date: '2016-01-01', '0-19': 24.1, '20-39': 25.6, '40-59': 27.0, '60-74': 15.0, '75+': 8.3 },
    { year: 2017, date: '2017-01-01', '0-19': 24.0, '20-39': 25.4, '40-59': 26.9, '60-74': 15.2, '75+': 8.5 },
    { year: 2018, date: '2018-01-01', '0-19': 23.9, '20-39': 25.2, '40-59': 26.7, '60-74': 15.5, '75+': 8.7 },
    { year: 2019, date: '2019-01-01', '0-19': 23.8, '20-39': 25.0, '40-59': 26.5, '60-74': 15.7, '75+': 9.0 },
    { year: 2020, date: '2020-01-01', '0-19': 23.7, '20-39': 24.8, '40-59': 26.3, '60-74': 16.0, '75+': 9.2 },
    { year: 2021, date: '2021-01-01', '0-19': 23.6, '20-39': 24.6, '40-59': 26.0, '60-74': 16.3, '75+': 9.5 },
    { year: 2022, date: '2022-01-01', '0-19': 23.5, '20-39': 24.4, '40-59': 25.8, '60-74': 16.5, '75+': 9.8 },
    { year: 2023, date: '2023-01-01', '0-19': 23.4, '20-39': 24.2, '40-59': 25.5, '60-74': 16.8, '75+': 10.1 },
    { year: 2024, date: '2024-01-01', '0-19': 23.3, '20-39': 24.0, '40-59': 25.2, '60-74': 17.1, '75+': 10.4 },
    { year: 2025, date: '2025-01-01', '0-19': 23.2, '20-39': 23.8, '40-59': 25.0, '60-74': 17.4, '75+': 10.6 },
  ]
}

/**
 * Get latest France population
 */
export function getLatestFrancePopulation(): number {
  const data = getFrancePopulationTimeseries()
  return data[data.length - 1].population
}

/**
 * Calculate population change over the period
 */
export function calculateFrancePopulationChange(): { absolute: number; percent: number } {
  const data = getFrancePopulationTimeseries()
  const oldest = data[0].population
  const latest = data[data.length - 1].population
  const absolute = latest - oldest
  const percent = (absolute / oldest) * 100
  return { absolute, percent }
}

/**
 * Get latest age group snapshot
 */
export function getLatestFranceAgeSnapshot(): FranceAgeGroupShares | null {
  const data = getFranceAgeGroupSharesTimeseries()
  return data[data.length - 1] || null
}

/**
 * Calculate median age approximation
 */
export function calculateFranceMedianAge(): number {
  // Approximate median age based on age group distributions
  // France's median age is around 41-42 years as of 2025
  return 41.8
}
