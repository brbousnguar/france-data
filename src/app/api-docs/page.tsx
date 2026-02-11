"use client"
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch('/api/swagger')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error('Failed to load API spec:', err))
  }, [])

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cadf9e] mx-auto mb-4"></div>
          <p className="text-[#595358]">Loading API documentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-[#313628] to-[#595358] text-white py-8 px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">France Public Data API</h1>
          <p className="text-[#cadf9e]">
            REST API for accessing French public data - Test with Swagger UI
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <a
              href="/api/v1/health"
              target="_blank"
              className="text-[#cadf9e] hover:underline"
            >
              🟢 Health Check
            </a>
            <span className="text-[#a4ac96]">•</span>
            <a
              href="https://www.data.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#cadf9e] hover:underline"
            >
              📊 data.gouv.fr
            </a>
            <span className="text-[#a4ac96]">•</span>
            <a
              href="https://www.insee.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#cadf9e] hover:underline"
            >
              📈 INSEE
            </a>
          </div>
        </div>
      </div>
      <SwaggerUI spec={spec} />
    </div>
  )
}
