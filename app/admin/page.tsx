'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin-helpers'
import Link from 'next/link'
import { 
  PlusIcon, 
  ArrowPathIcon, 
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

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
        router.push('/login?redirect=/admin')
        setCheckingAdmin(false)
      }
    }
    checkAdmin()
  }, [user, authLoading, router, devBypass])

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your website content and store</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Build a Workout */}
            <Link
              href="/admin/workouts"
              className="group relative bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-lg p-6 hover:border-primary-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary-600 p-3 rounded-lg group-hover:bg-primary-700 transition-colors">
                  <PlusIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Build a Workout</h2>
                  <p className="text-gray-600 text-sm">
                    Create new workouts with exercises, competition settings, and leaderboards
                  </p>
                </div>
              </div>
            </Link>

            {/* Sync Store */}
            <Link
              href="/admin/store/sync"
              className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6 hover:border-green-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="bg-green-600 p-3 rounded-lg group-hover:bg-green-700 transition-colors">
                  <ArrowPathIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Sync Store</h2>
                  <p className="text-gray-600 text-sm">
                    Sync products from Printful to your website store
                  </p>
                </div>
              </div>
            </Link>

            {/* Forum Management */}
            <Link
              href="/admin/forum"
              className="group relative bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6 hover:border-red-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="bg-red-600 p-3 rounded-lg group-hover:bg-red-700 transition-colors">
                  <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Forum Management</h2>
                  <p className="text-gray-600 text-sm">
                    Delete forum posts and block users who violate rules
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats (Optional - can be expanded later) */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/workouts"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Workouts →
              </Link>
              <Link
                href="/store"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Store →
              </Link>
              <Link
                href="/forum"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Forum →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
