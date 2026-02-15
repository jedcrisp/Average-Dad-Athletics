'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin-helpers'
import { forumHelpers, blockedUserHelpers, BlockedUser, ForumPost } from '@/lib/firebase-helpers'
import { TrashIcon, BanIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function AdminForumPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'blocked'>('posts')
  
  // Block user form
  const [blockEmail, setBlockEmail] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)
  
  // Delete confirmation
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [unblockingEmail, setUnblockingEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading && user) {
        try {
          const adminStatus = await isAdmin(user)
          setUserIsAdmin(adminStatus)
        } catch (error) {
          console.error('Error checking admin status:', error)
        } finally {
          setCheckingAdmin(false)
        }
      } else if (!authLoading && !user) {
        router.push('/login?redirect=/admin/forum')
        setCheckingAdmin(false)
      }
    }
    checkAdmin()
  }, [user, authLoading, router])

  useEffect(() => {
    if (userIsAdmin) {
      loadData()
    }
  }, [userIsAdmin, activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'posts') {
        const allPosts = await forumHelpers.getAll()
        setPosts(allPosts)
      } else {
        const allBlocked = await blockedUserHelpers.getAll()
        setBlockedUsers(allBlocked)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingPostId(postId)
      await forumHelpers.delete(postId)
      setPosts(posts.filter(p => p.id !== postId))
      setDeletingPostId(null)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
      setDeletingPostId(null)
    }
  }

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockEmail.trim() || !user) return

    try {
      setBlocking(true)
      await blockedUserHelpers.block(blockEmail.trim(), user.uid, blockReason.trim() || undefined)
      setBlockEmail('')
      setBlockReason('')
      await loadData()
      alert('User blocked successfully')
    } catch (error) {
      console.error('Error blocking user:', error)
      alert('Failed to block user. Please try again.')
    } finally {
      setBlocking(false)
    }
  }

  const handleUnblockUser = async (email: string) => {
    if (!confirm(`Are you sure you want to unblock ${email}?`)) {
      return
    }

    try {
      setUnblockingEmail(email)
      await blockedUserHelpers.unblock(email)
      setBlockedUsers(blockedUsers.filter(b => b.email !== email))
      setUnblockingEmail(null)
    } catch (error) {
      console.error('Error unblocking user:', error)
      alert('Failed to unblock user. Please try again.')
      setUnblockingEmail(null)
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

  if (!userIsAdmin) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forum Management</h1>
          <p className="text-gray-600">Manage forum posts and block users who violate rules</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Forum Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blocked'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Blocked Users ({blockedUsers.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : activeTab === 'posts' ? (
          /* Forum Posts Tab */
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Forum Posts</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {posts.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No forum posts found.
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          <a href={`/forum/${post.id}`} className="hover:text-primary-600">
                            {post.title}
                          </a>
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>By: {post.author}</span>
                          <span>Category: {post.category}</span>
                          <span>Replies: {post.replies}</span>
                          <span>Created: {post.createdAt?.toDate().toLocaleDateString()}</span>
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id!)}
                        disabled={deletingPostId === post.id}
                        className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete post"
                      >
                        {deletingPostId === post.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Blocked Users Tab */
          <div className="space-y-6">
            {/* Block User Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Block a User</h2>
              <form onSubmit={handleBlockUser} className="space-y-4">
                <div>
                  <label htmlFor="blockEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="blockEmail"
                    value={blockEmail}
                    onChange={(e) => setBlockEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="blockReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (Optional)
                  </label>
                  <textarea
                    id="blockReason"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Reason for blocking this user..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={blocking || !blockEmail.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <BanIcon className="w-5 h-5" />
                  {blocking ? 'Blocking...' : 'Block User'}
                </button>
              </form>
            </div>

            {/* Blocked Users List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Blocked Users</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {blockedUsers.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No users are currently blocked.
                  </div>
                ) : (
                  blockedUsers.map((blocked) => (
                    <div key={blocked.email} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BanIcon className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-gray-900">{blocked.email}</span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Blocked: {blocked.blockedAt.toDate().toLocaleString()}</p>
                            {blocked.reason && <p>Reason: {blocked.reason}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblockUser(blocked.email)}
                          disabled={unblockingEmail === blocked.email}
                          className="ml-4 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Unblock user"
                        >
                          {unblockingEmail === blocked.email ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                          ) : (
                            <>
                              <XMarkIcon className="w-5 h-5" />
                              <span className="text-sm">Unblock</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
