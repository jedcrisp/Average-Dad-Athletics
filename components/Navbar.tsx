'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-bold text-primary-600">Average Dad Athletics</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/videos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Videos
            </Link>
            <Link href="/workouts" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Workouts
            </Link>
            <Link href="/forum" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Forum
            </Link>
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 text-sm flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/videos"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Videos
            </Link>
            <Link
              href="/workouts"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Workouts
            </Link>
            <Link
              href="/forum"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Forum
            </Link>
            {session ? (
              <>
                <div className="px-3 py-2 text-gray-700 text-sm border-t mt-2 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    {session.user?.name || session.user?.email}
                  </div>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 bg-primary-600 text-white rounded-md text-center font-medium hover:bg-primary-700 transition-colors mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
