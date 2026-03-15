import { NextRequest, NextResponse } from 'next/server'

const MELODI_BASE = 'https://api.insee.fr/melodi/data'

interface MelodiObservation {
  dimensions: Record<string, string>
  measures: Record<string, { value: number | null } | null>
}

interface MelodiResponse {
  observations: MelodiObservation[]
}

function extractMeasureValue(obs: MelodiObservation): number | null {
  for (const key of Object.keys(obs.measures)) {
    const measure = obs.measures[key]
    if (measure && measure.value !== null && measure.value !== undefined) {
      return measure.value
    }
  }
  return null
}

/**
 * @swagger
 * /api/v1/inflation:
 *   get:
 *     tags:
 *       - Inflation
 *     summary: Get French inflation data
 *     description: Fetches inflation data from INSEE Melodi API (DS_IPC_PRINC)
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Successful response with inflation data
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
 *                       date:
 *                         type: string
 *                         format: date
 *                       value:
 *                         type: number
 *                       indicator:
 *                         type: string
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     source:
 *                       type: string
 *                     count:
 *                       type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    const params = 'IND_TYPE=YOY&COICOP_2018=00&PRODUCT_GROUP=_Z&FREQ=M&GEO=2025-FRANCE-FM&startPeriod=2022-01&maxResult=100'
    const url = `${MELODI_BASE}/DS_IPC_PRINC?${params}`

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`INSEE Melodi API error: ${response.status} ${response.statusText}`)
    }

    const json: MelodiResponse = await response.json()

    let data: Array<{ date: string; value: number; indicator: string }> = []

    for (const obs of json.observations) {
      const timePeriod = obs.dimensions['TIME_PERIOD']
      const value = extractMeasureValue(obs)
      if (timePeriod && value !== null) {
        data.push({ date: timePeriod, value, indicator: 'IPC' })
      }
    }

    // Sort chronologically
    data.sort((a, b) => a.date.localeCompare(b.date))

    // Apply date filters
    if (startDate || endDate) {
      data = data.filter((item) => {
        const itemDate = item.date + '-01'
        if (startDate && itemDate < startDate) return false
        if (endDate && itemDate > endDate) return false
        return true
      })
    }

    // Apply limit
    if (limit && data.length > limit) {
      data = data.slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        source: 'INSEE Melodi API (DS_IPC_PRINC)',
        count: data.length,
        filters: {
          startDate,
          endDate,
          limit,
        },
      },
    })
  } catch (error) {
    console.error('Error in inflation API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
