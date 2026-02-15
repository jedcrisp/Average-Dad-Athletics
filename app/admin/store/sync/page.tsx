'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin-helpers'

export default function AdminStoreSyncPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [syncResult, setSyncResult] = useState<{
    synced: number
    failed: number
    products: any[]
  } | null>(null)

  // Development bypass - only in local dev
  const [devBypass, setDevBypass] = useState(false)
  const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading && user) {
        try {
          const adminStatus = await isAdmin(user)
          setUserIsAdmin(adminStatus || devBypass)
        } catch (error) {
          console.error('Error checking admin status:', error)
        } finally {
          setCheckingAdmin(false)
        }
      } else if (!authLoading && !user) {
        router.push('/login?redirect=/admin/store/sync')
        setCheckingAdmin(false)
      }
    }
    checkAdmin()
  }, [user, authLoading, router, devBypass])

  const handleSync = async () => {
    setSyncing(true)
    setError('')
    setSuccess(false)
    setSyncResult(null)

    try {
      const response = await fetch('/api/admin/store/sync', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync products')
      }

      const data = await response.json()
      setSyncResult(data)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to sync products from Printful')
      console.error('Sync error:', err)
    } finally {
      setSyncing(false)
    }
  }

  if (checkingAdmin || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userIsAdmin && !devBypass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access Denied</p>
          <p className="text-gray-600 mb-4">You must be an admin to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isDevelopment && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={devBypass}
                onChange={(e) => setDevBypass(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-yellow-800">Enable Admin Bypass (Dev Only)</span>
            </label>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sync Products from Printful</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This will fetch all products from your Printful store and save them to Firestore. 
              Products will then be displayed from Firestore instead of fetching from Printful each time.
            </p>
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> Make sure your Printful API key is configured in environment variables.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && syncResult && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold mb-2">Sync completed successfully!</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Synced: {syncResult.synced} products</li>
                {syncResult.failed > 0 && (
                  <li className="text-red-600">✗ Failed: {syncResult.failed} products</li>
                )}
              </ul>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? 'Syncing Products...' : 'Sync Products from Printful'}
          </button>

          {syncResult && syncResult.products.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Synced Products</h2>
              <div className="space-y-2">
                {syncResult.products.map((product: any) => (
                  <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">ID: {product.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => router.push('/admin/workouts')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
