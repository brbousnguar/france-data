import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/v1/population/{codeCommune}:
 *   get:
 *     tags:
 *       - Population
 *     summary: Get population data for a French commune
 *     description: Fetches current population data from geo.api.gouv.fr
 *     parameters:
 *       - in: path
 *         name: codeCommune
 *         required: true
 *         schema:
 *           type: string
 *         description: INSEE commune code (e.g., 44109 for Nantes)
 *       - in: query
 *         name: yearStart
 *         schema:
 *           type: integer
 *         description: Start year (no effect, only current year data available)
 *       - in: query
 *         name: yearEnd
 *         schema:
 *           type: integer
 *         description: End year (no effect, only current year data available)
 *     responses:
 *       200:
 *         description: Successful response with population data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                       population:
 *                         type: integer
 *                       commune:
 *                         type: string
 *                 metadata:
 *                   type: object
 *       404:
 *         description: Commune not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { codeCommune: string } }
) {
  try {
    const codeCommune = params.codeCommune

    const apiUrl = `https://geo.api.gouv.fr/communes/${codeCommune}?fields=population`

    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
    })

    if (response.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: `Commune ${codeCommune} not found`,
        },
        { status: 404 }
      )
    }

    if (!response.ok) {
      throw new Error(`geo.api.gouv.fr error: ${response.status} ${response.statusText}`)
    }

    const communeInfo: { nom?: string; code?: string; population?: number } = await response.json()

    if (!communeInfo.population) {
      return NextResponse.json(
        {
          success: false,
          error: `No population data available for commune ${codeCommune}`,
        },
        { status: 404 }
      )
    }

    const currentYear = new Date().getFullYear()
    const data = [
      {
        year: currentYear,
        population: communeInfo.population,
        commune: communeInfo.nom || codeCommune,
      },
    ]

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        source: 'geo.api.gouv.fr',
        commune: communeInfo.nom,
        codeCommune: communeInfo.code || codeCommune,
        count: data.length,
        note: 'geo.api.gouv.fr provides current population only (no time series)',
      },
    })
  } catch (error) {
    console.error('Error in population API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
