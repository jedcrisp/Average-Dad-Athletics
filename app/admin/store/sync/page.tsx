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
    skipped?: number
    total?: number
    products: any[]
    failedProducts?: any[]
    message?: string
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
    console.log('🔄 Starting sync from frontend...')
    setSyncing(true)
    setError('')
    setSuccess(false)
    setSyncResult(null)

    try {
      // Get the user's ID token for authentication
      let idToken: string | null = null
      if (user) {
        try {
          idToken = await user.getIdToken()
          console.log('✅ Got auth token')
        } catch (tokenError) {
          console.error('❌ Error getting auth token:', tokenError)
          throw new Error('Failed to get authentication token. Please sign in again.')
        }
      }

      console.log('📡 Calling /api/admin/store/sync...')
      const response = await fetch('/api/admin/store/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
        },
      })

      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || errorData.message || 'Failed to sync products')
      }

      const data = await response.json()
      console.log('✅ Sync response:', data)
      setSyncResult(data)
      setSuccess(true)
      
      if (data.debug) {
        console.log('🔍 Debug info:', data.debug)
      }
    } catch (err: any) {
      console.error('❌ Sync error caught:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      })
      setError(err.message || 'Failed to sync products from Printful')
    } finally {
      setSyncing(false)
      console.log('🏁 Sync process completed')
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">Before syncing, make sure:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Your Printful API key is configured in environment variables</li>
                <li>You have added products to your Printful store (Dashboard → Products)</li>
                <li>Products are not marked as discontinued</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              <strong>Troubleshooting:</strong> If 0 products are synced, check your server logs for detailed error messages.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && syncResult && (
            <div className={`mb-6 p-4 border rounded-lg ${
              syncResult.synced > 0 
                ? 'bg-green-50 border-green-200' 
                : syncResult.failed > 0
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`font-semibold mb-2 ${
                syncResult.synced > 0 ? 'text-green-800' : syncResult.failed > 0 ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {syncResult.synced > 0 ? 'Sync completed!' : syncResult.failed > 0 ? 'Sync failed' : 'No products synced'}
              </p>
              <ul className="text-sm space-y-1">
                {syncResult.total !== undefined && (
                  <li className={syncResult.synced > 0 ? 'text-green-700' : 'text-red-700'}>
                    Total found: {syncResult.total} products
                  </li>
                )}
                <li className={syncResult.synced > 0 ? 'text-green-700' : 'text-red-700'}>
                  ✓ Synced: {syncResult.synced} products
                </li>
                {syncResult.skipped !== undefined && syncResult.skipped > 0 && (
                  <li className="text-yellow-700">⊘ Skipped (discontinued): {syncResult.skipped} products</li>
                )}
                {syncResult.failed > 0 && (
                  <li className="text-red-600">✗ Failed: {syncResult.failed} products</li>
                )}
              </ul>
              {syncResult.failedProducts && syncResult.failedProducts.length > 0 && (
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                  <p className="text-sm font-semibold text-red-800 mb-2">Failed Products:</p>
                  {syncResult.failedProducts.map((p: any, idx: number) => (
                    <div key={idx} className="text-sm text-red-700 mb-1">
                      <strong>{p.name}</strong> (ID: {p.id}): {p.error}
                      {p.code && <span className="text-xs"> (Code: {p.code})</span>}
                    </div>
                  ))}
                </div>
              )}
              {syncResult.message && (
                <p className={`mt-2 text-sm ${
                  syncResult.synced > 0 ? 'text-green-700' : syncResult.failed > 0 ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {syncResult.message}
                </p>
              )}
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
