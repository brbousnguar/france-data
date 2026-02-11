import { NextResponse } from 'next/server'
import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'France Public Data API',
    version: '1.0.0',
    description: 'API for accessing French public data from data.gouv.fr and INSEE',
    contact: {
      name: 'France Public Data Lab',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Inflation',
      description: 'French inflation data from INSEE',
    },
    {
      name: 'Population',
      description: 'Population data for French cities',
    },
    {
      name: 'Health',
      description: 'API health checks',
    },
  ],
}

const options = {
  swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Path to API route files
}

const swaggerSpec = swaggerJSDoc(options)

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
