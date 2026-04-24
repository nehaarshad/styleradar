/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

export default function AdminScrapePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const startScrape = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await fetch('/api/scrape', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test'}`,
        },
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Scrape failed')
      }
      
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Product Scraper Admin</h1>
        
        <button
          onClick={startScrape}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 mb-8"
        >
          {loading ? 'Scraping...' : 'Start Scraping Now'}
        </button>
        
        {loading && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p>Scraping products from retailers... This may take a few minutes.</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
            Error: {error}
          </div>
        )}
        
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Scrape Results</h2>
            <div className="space-y-2">
              <p>✅ Status: {result.success ? 'Success' : 'Failed'}</p>
              <p>📦 Total Products Scraped: {result.totalScraped}</p>
              <p>💾 Stored in Database: {result.stored}</p>
              <p>❌ Failed: {result.failed}</p>
            </div>
            
            {result.products && result.products.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Sample Products:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {result.products.map((product: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-green-600 font-bold">Rs. {product.price}</p>
                      <p className="text-xs text-gray-500">{product.retailer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}