'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function CheckShippedOrdersPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckShipped = async () => {
    if (!user) {
      setError('You must be logged in')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/printful/check-shipped')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check shipped orders')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error('Error checking shipped orders:', err)
      setError(err.message || 'Failed to check shipped orders')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Shipped Orders</h1>
            <p className="text-gray-600">You must be logged in to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Shipped Orders</h1>
          <p className="text-gray-600 mb-6">
            This tool checks Printful for orders that have been shipped and sends shipping notification emails to customers.
            You can run this manually or set up a cron job to run it automatically.
          </p>

          <button
            onClick={handleCheckShipped}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Check for Shipped Orders'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold mb-2">Check Complete</p>
              <div className="space-y-2 text-green-700">
                <p><strong>Orders Checked:</strong> {result.checked}</p>
                <p><strong>Orders Shipped:</strong> {result.shipped}</p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold text-red-700">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {result.errors.map((err: string, index: number) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-semibold mb-2">Automated Checking</p>
            <p className="text-blue-700 text-sm mb-2">
              To automate this process, you can set up a cron job:
            </p>
            <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
              <li>Use Vercel Cron Jobs (if deployed on Vercel)</li>
              <li>Use an external service like cron-job.org</li>
              <li>Call this endpoint: <code className="bg-blue-100 px-1 rounded">GET /api/printful/check-shipped</code></li>
              <li>Recommended frequency: Every 1-2 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
