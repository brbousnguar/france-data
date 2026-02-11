import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: API health check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 version:
 *                   type: string
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      inflation: '/api/v1/inflation',
      population: '/api/v1/population/{codeCommune}',
      swagger: '/api/swagger',
      docs: '/api-docs',
    },
  })
}
