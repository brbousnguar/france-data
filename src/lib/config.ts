/**
 * Application Configuration
 * 
 * Central configuration for data sources and API endpoints.
 * Update resource URLs here when you've identified real datasets.
 */

export const CONFIG = {
  // ==================== INSEE Codes ====================
  
  /** INSEE code for Nantes commune */
  NANTES_CODE_INSEE: '44109',
  
  /** INSEE code for Nantes Métropole */
  NANTES_METROPOLE_CODE: '244400404',
  
  // ==================== Time Ranges ====================
  
  /** Number of years to fetch historical data */
  YEARS_BACK: 12,
  
  /** Default cache TTL for static data (24 hours) */
  CACHE_TTL_HOURS: 24,
  
  // ==================== Data Source URLs ====================
  
  /**
   * INSEE API for population data
   * Using INSEE Sirene API and official datasets
   */
  POPULATION_RESOURCE_URL: process.env.NANTES_POPULATION_URL || 
    'https://www.data.gouv.fr/fr/datasets/r/d2f400de-94d1-4db8-a2c1-9c88b34c878f',
  
  /**
   * Age groups distribution - INSEE recensement
   */
  AGE_GROUPS_RESOURCE_URL: process.env.NANTES_AGE_GROUPS_URL || 
    'https://www.data.gouv.fr/fr/datasets/r/f70a9162-2c3b-4d96-801e-d6c0d3e0b5dd',
  
  /**
   * France inflation (CPI) from INSEE
   * IPC - Indice des prix à la consommation
   */
  INFLATION_RESOURCE_URL: process.env.FRANCE_INFLATION_URL || 
    'https://www.data.gouv.fr/fr/datasets/r/eb387048-21d7-4e35-b79e-37f3a58cb93a',
  
  // ==================== Feature Flags ====================
  
  /**
   * Use mock data when real data sources are not configured
   * Set to false to force real data only (will throw errors if not available)
   */
  USE_MOCK_FALLBACK: false,
  
  /**
   * Enable debug logging for data fetching
   */
  DEBUG_DATA_SOURCES: process.env.NODE_ENV === 'development',
  
  // ==================== API Endpoints ====================
  
  /** Data.gouv.fr API base URL */
  DATAGOUV_API: 'https://www.data.gouv.fr/api/1',
  
  /** INSEE API base URL (if using direct INSEE API) */
  INSEE_API: 'https://api.insee.fr',
  
  // ==================== Helper Functions ====================
  
  /**
   * Check if a resource URL is configured
   */
  hasResourceUrl(key: 'population' | 'ageGroups' | 'inflation'): boolean {
    switch (key) {
      case 'population':
        return !!this.POPULATION_RESOURCE_URL
      case 'ageGroups':
        return !!this.AGE_GROUPS_RESOURCE_URL
      case 'inflation':
        return !!this.INFLATION_RESOURCE_URL
      default:
        return false
    }
  },
  
  /**
   * Get resource URL by key
   */
  getResourceUrl(key: 'population' | 'ageGroups' | 'inflation'): string | null {
    switch (key) {
      case 'population':
        return this.POPULATION_RESOURCE_URL || null
      case 'ageGroups':
        return this.AGE_GROUPS_RESOURCE_URL || null
      case 'inflation':
        return this.INFLATION_RESOURCE_URL || null
      default:
        return null
    }
  }
}

/**
 * Validate configuration on startup (development only)
 */
if (CONFIG.DEBUG_DATA_SOURCES) {
  console.log('📋 Data Source Configuration:')
  console.log('  Population URL:', CONFIG.POPULATION_RESOURCE_URL || '❌ Not configured (using mock)')
  console.log('  Age Groups URL:', CONFIG.AGE_GROUPS_RESOURCE_URL || '❌ Not configured (using mock)')
  console.log('  Inflation URL:', CONFIG.INFLATION_RESOURCE_URL || '❌ Not configured (using mock)')
  console.log('  Mock fallback:', CONFIG.USE_MOCK_FALLBACK ? '✅ Enabled' : '❌ Disabled')
}
