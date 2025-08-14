'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function RentalSearchTest() {
  const searchParams = useSearchParams()
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    const paramObj: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      paramObj[key] = value
    })
    setParams(paramObj)
  }, [searchParams])

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Search Parameters Test</h3>
      {Object.keys(params).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium text-gray-600">{key}:</span>
              <span className="text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No search parameters found</p>
      )}
    </div>
  )
}