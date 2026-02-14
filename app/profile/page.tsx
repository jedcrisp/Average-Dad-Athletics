'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'
import { UserIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        if (db && user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            if (userDoc.exists()) {
              setUserData(userDoc.data())
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
          } finally {
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      }
      
      fetchUserData()
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.displayName || userData?.name || 'User'
  const email = user.email || userData?.email || 'No email'
  const createdAt = userData?.createdAt || user.metadata.creationTime
  const provider = userData?.provider || (user.providerData[0]?.providerId === 'google.com' ? 'Google' : user.providerData[0]?.providerId === 'apple.com' ? 'Apple' : 'Email')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-4">
                <UserIcon className="w-12 h-12 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                <p className="text-primary-100 mt-1">Account Profile</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Account Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium">{email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Display Name</p>
                      <p className="text-gray-900 font-medium">{displayName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <span className="text-gray-400 text-sm">🔐</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sign-in Method</p>
                      <p className="text-gray-900 font-medium capitalize">{provider}</p>
                    </div>
                  </div>

                  {createdAt && (
                    <div className="flex items-start gap-4">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="/forum"
                    className="bg-primary-50 border border-primary-200 rounded-lg p-4 hover:bg-primary-100 transition-colors"
                  >
                    <h3 className="font-semibold text-primary-900">Go to Forum</h3>
                    <p className="text-sm text-primary-700 mt-1">Join the community discussion</p>
                  </a>
                  <a
                    href="/workouts"
                    className="bg-primary-50 border border-primary-200 rounded-lg p-4 hover:bg-primary-100 transition-colors"
                  >
                    <h3 className="font-semibold text-primary-900">Browse Workouts</h3>
                    <p className="text-sm text-primary-700 mt-1">Check out the workout library</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
