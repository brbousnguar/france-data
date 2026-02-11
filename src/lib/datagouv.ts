/**
 * Data.gouv.fr API Client
 * 
 * Provides functions to search for datasets and resources on data.gouv.fr
 * Official API documentation: https://www.data.gouv.fr/api/1/
 */

import { z } from 'zod'
import { fetchJson } from './api'

const DATAGOUV_API_BASE = 'https://www.data.gouv.fr/api/1'

// ==================== Types ====================

export type DatasetSearchResult = {
  id: string
  title: string
  description?: string
  url: string
  resourcesCount: number
  organization?: string
  lastUpdate?: string
}

export type ResourceSearchResult = {
  datasetId: string
  datasetTitle: string
  resourceId: string
  resourceTitle: string
  format: string
  url: string
  filesize?: number
  lastModified?: string
}

// ==================== Validation Schemas ====================

const DatasetSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  page: z.string(),
  resources: z.array(z.any()).optional(),
  organization: z.object({
    name: z.string()
  }).optional(),
  last_update: z.string().optional()
})

const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  format: z.string(),
  url: z.string(),
  filesize: z.number().optional(),
  last_modified: z.string().optional()
})

// ==================== Public API Functions ====================

/**
 * Search datasets on data.gouv.fr
 * @param query Search query (keywords, organization, etc.)
 * @param page Page number (default: 1)
 * @param pageSize Number of results per page (default: 20)
 * @returns Array of simplified dataset objects
 */
export async function searchDatasets(
  query: string,
  page = 1,
  pageSize = 20
): Promise<DatasetSearchResult[]> {
  try {
    const url = `${DATAGOUV_API_BASE}/datasets/?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
    
    console.log('Searching datasets:', query)
    
    const response = await fetchJson<any>(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    // Validate and transform response
    const datasets = response.data || []
    
    return datasets.map((dataset: any) => {
      const validated = DatasetSchema.parse(dataset)
      
      return {
        id: validated.id,
        title: validated.title,
        description: validated.description?.slice(0, 200), // Truncate long descriptions
        url: validated.page,
        resourcesCount: validated.resources?.length || 0,
        organization: validated.organization?.name,
        lastUpdate: validated.last_update
      }
    })
  } catch (error) {
    console.error('Error searching datasets:', error)
    throw new Error(`Failed to search datasets: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get detailed dataset information by ID
 * @param datasetId Dataset ID (e.g., "5e7e104ace2080104c0f21fb")
 * @returns Dataset with full resource list
 */
export async function getDataset(datasetId: string): Promise<{
  dataset: DatasetSearchResult
  resources: ResourceSearchResult[]
}> {
  try {
    const url = `${DATAGOUV_API_BASE}/datasets/${datasetId}/`
    
    console.log('Fetching dataset:', datasetId)
    
    const response = await fetchJson<any>(url, {
      next: { revalidate: 3600 }
    })
    
    const validated = DatasetSchema.parse(response)
    
    const dataset: DatasetSearchResult = {
      id: validated.id,
      title: validated.title,
      description: validated.description,
      url: validated.page,
      resourcesCount: validated.resources?.length || 0,
      organization: validated.organization?.name,
      lastUpdate: validated.last_update
    }
    
    const resources: ResourceSearchResult[] = (validated.resources || []).map((res: any) => {
      const validatedResource = ResourceSchema.parse(res)
      
      return {
        datasetId: validated.id,
        datasetTitle: validated.title,
        resourceId: validatedResource.id,
        resourceTitle: validatedResource.title,
        format: validatedResource.format.toUpperCase(),
        url: validatedResource.url,
        filesize: validatedResource.filesize,
        lastModified: validatedResource.last_modified
      }
    })
    
    return { dataset, resources }
  } catch (error) {
    console.error('Error fetching dataset:', error)
    throw new Error(`Failed to fetch dataset: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for resources across all datasets
 * @param query Search query
 * @param format Filter by format (e.g., "CSV", "JSON") - optional
 * @returns Array of resources matching the query
 */
export async function searchResources(
  query: string,
  format?: string
): Promise<ResourceSearchResult[]> {
  try {
    // First, search for datasets matching the query
    const datasets = await searchDatasets(query, 1, 10)
    
    const allResources: ResourceSearchResult[] = []
    
    // Fetch resources from each dataset
    for (const dataset of datasets) {
      try {
        const { resources } = await getDataset(dataset.id)
        
        // Filter by format if specified
        const filteredResources = format
          ? resources.filter(r => r.format === format.toUpperCase())
          : resources
        
        allResources.push(...filteredResources)
      } catch (error) {
        console.warn(`Failed to fetch resources for dataset ${dataset.id}:`, error)
        // Continue with other datasets
      }
    }
    
    console.log(`Found ${allResources.length} resources for query: ${query}`)
    
    return allResources
  } catch (error) {
    console.error('Error searching resources:', error)
    throw new Error(`Failed to search resources: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for INSEE datasets specifically
 * @param query Additional keywords (e.g., "population", "inflation")
 * @returns Datasets from INSEE organization
 */
export async function searchINSEEDatasets(query?: string): Promise<DatasetSearchResult[]> {
  const searchQuery = query ? `INSEE ${query}` : 'INSEE'
  return searchDatasets(searchQuery)
}

/**
 * Search for Nantes-specific datasets
 * @param query Additional keywords (e.g., "population", "démographie")
 * @returns Datasets related to Nantes
 */
export async function searchNantesDatasets(query?: string): Promise<DatasetSearchResult[]> {
  const searchQuery = query ? `Nantes ${query}` : 'Nantes'
  return searchDatasets(searchQuery)
}

/**
 * Helper: Format file size for display
 */
export function formatFilesize(bytes?: number): string {
  if (!bytes) return 'N/A'
  
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
