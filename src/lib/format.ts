import { format, parse } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Format number with French locale (space as thousands separator)
 * @param value Number to format
 * @param decimals Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1 234 567")
 */
export function formatNumberFR(value: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

/**
 * Format percentage with French locale
 * @param value Decimal value (0.5 = 50%)
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage (e.g., "50,5 %")
 */
export function formatPercentFR(value: number, decimals = 1): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

/**
 * Format date to French month-year format
 * @param dateStr Date string (ISO format or parseable date)
 * @returns Formatted date (e.g., "janv. 2025")
 */
export function formatDateMonthYearFR(dateStr: string): string {
  try {
    // Try parsing as ISO date first
    let date = new Date(dateStr)
    
    // If invalid, try parsing as year only
    if (isNaN(date.getTime())) {
      date = new Date(`${dateStr}-01-01`)
    }
    
    if (isNaN(date.getTime())) {
      return dateStr // Return original if can't parse
    }
    
    return format(date, 'MMM yyyy', { locale: fr })
  } catch {
    return dateStr
  }
}

/**
 * Format large numbers with K/M suffix (French style)
 * @param value Number to format
 * @returns Compact number (e.g., "1,2 M")
 */
export function formatCompactFR(value: number): string {
  if (value >= 1_000_000) {
    return `${formatNumberFR(value / 1_000_000, 1)} M`
  }
  if (value >= 1_000) {
    return `${formatNumberFR(value / 1_000, 1)} k`
  }
  return formatNumberFR(value)
}
