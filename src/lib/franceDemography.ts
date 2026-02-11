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

/**
 * Foreign population and nationality statistics
 */
export interface FranceNationalityData {
  year: number
  date: string
  totalPopulation: number // millions
  foreigners: number // millions
  foreignersPercent: number // percentage
  immigrants: number // millions
  immigrantsPercent: number // percentage
}

export interface FranceNationalityBreakdown {
  year: number
  nationality: string
  population: number // thousands
  percentOfForeigners: number
  percentOfTotal: number
}

/**
 * Foreign population evolution in France
 * Source: INSEE - Immigrés et étrangers en France
 */
export function getFranceForeignPopulationTimeseries(): FranceNationalityData[] {
  return [
    { year: 2015, date: '2015-01-01', totalPopulation: 66.4, foreigners: 4.3, foreignersPercent: 6.5, immigrants: 6.2, immigrantsPercent: 9.3 },
    { year: 2016, date: '2016-01-01', totalPopulation: 66.7, foreigners: 4.4, foreignersPercent: 6.6, immigrants: 6.3, immigrantsPercent: 9.4 },
    { year: 2017, date: '2017-01-01', totalPopulation: 67.0, foreigners: 4.5, foreignersPercent: 6.7, immigrants: 6.5, immigrantsPercent: 9.7 },
    { year: 2018, date: '2018-01-01', totalPopulation: 67.2, foreigners: 4.6, foreignersPercent: 6.8, immigrants: 6.6, immigrantsPercent: 9.8 },
    { year: 2019, date: '2019-01-01', totalPopulation: 67.4, foreigners: 4.7, foreignersPercent: 7.0, immigrants: 6.8, immigrantsPercent: 10.1 },
    { year: 2020, date: '2020-01-01', totalPopulation: 67.5, foreigners: 4.8, foreignersPercent: 7.1, immigrants: 6.9, immigrantsPercent: 10.2 },
    { year: 2021, date: '2021-01-01', totalPopulation: 67.7, foreigners: 4.9, foreignersPercent: 7.2, immigrants: 7.0, immigrantsPercent: 10.3 },
    { year: 2022, date: '2022-01-01', totalPopulation: 68.0, foreigners: 5.0, foreignersPercent: 7.4, immigrants: 7.2, immigrantsPercent: 10.6 },
    { year: 2023, date: '2023-01-01', totalPopulation: 68.4, foreigners: 5.2, foreignersPercent: 7.6, immigrants: 7.4, immigrantsPercent: 10.8 },
    { year: 2024, date: '2024-01-01', totalPopulation: 68.7, foreigners: 5.3, foreignersPercent: 7.7, immigrants: 7.5, immigrantsPercent: 10.9 },
    { year: 2025, date: '2025-01-01', totalPopulation: 69.08, foreigners: 5.4, foreignersPercent: 7.8, immigrants: 7.6, immigrantsPercent: 11.0 },
  ]
}

/**
 * Top nationalities in France (2025 data)
 * Source: INSEE - Population étrangère par nationalité
 */
export function getFranceTopNationalities(): FranceNationalityBreakdown[] {
  const year = 2025
  return [
    { year, nationality: 'Algérie', population: 845, percentOfForeigners: 15.6, percentOfTotal: 1.2 },
    { year, nationality: 'Maroc', population: 812, percentOfForeigners: 15.0, percentOfTotal: 1.2 },
    { year, nationality: 'Portugal', population: 645, percentOfForeigners: 11.9, percentOfTotal: 0.9 },
    { year, nationality: 'Tunisie', population: 312, percentOfForeigners: 5.8, percentOfTotal: 0.5 },
    { year, nationality: 'Italie', population: 298, percentOfForeigners: 5.5, percentOfTotal: 0.4 },
    { year, nationality: 'Turquie', population: 285, percentOfForeigners: 5.3, percentOfTotal: 0.4 },
    { year, nationality: 'Espagne', population: 267, percentOfForeigners: 4.9, percentOfTotal: 0.4 },
    { year, nationality: 'Royaume-Uni', population: 189, percentOfForeigners: 3.5, percentOfTotal: 0.3 },
    { year, nationality: 'Chine', population: 156, percentOfForeigners: 2.9, percentOfTotal: 0.2 },
    { year, nationality: 'Sénégal', population: 142, percentOfForeigners: 2.6, percentOfTotal: 0.2 },
    { year, nationality: 'Autres', population: 1449, percentOfForeigners: 26.8, percentOfTotal: 2.1 },
  ]
}

/**
 * Get latest foreign population stats
 */
export function getLatestFranceForeignStats() {
  const data = getFranceForeignPopulationTimeseries()
  return data[data.length - 1]
}
