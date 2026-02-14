'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatBubbleLeftRightIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'
import { forumHelpers, ForumPost } from '@/lib/firebase-helpers'

const categories = ['All', 'Getting Started', 'Equipment', 'Motivation', 'Nutrition', 'Progress', 'Sports']

export default function ForumPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError('')
        const fetchedPosts = await forumHelpers.getAll(selectedCategory === 'All' ? undefined : selectedCategory)
        setPosts(fetchedPosts)
      } catch (err: any) {
        console.error('Error fetching posts:', err)
        setError('Failed to load forum posts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [selectedCategory])

  const handleCreatePost = () => {
    if (user) {
      router.push('/forum/create')
    } else {
      router.push('/login?redirect=/forum')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Community Forum
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with other average dads. Share your journey, ask questions, and support each other.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Create Post Button */}
        <div className="mb-8 text-center">
          {user ? (
            <button
              onClick={handleCreatePost}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Create a New Conversation
            </button>
          ) : (
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
              <p className="text-accent-700 mb-3">
                Want to join the conversation?{' '}
                <Link href="/login?redirect=/forum" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in
                </Link>{' '}
                to create posts and reply to discussions.
              </p>
              <Link
                href="/login?redirect=/forum"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Sign In to Post
              </Link>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8 text-center">
            {error}
          </div>
        )}

        {/* Posts List */}
        {!loading && !error && (
          <>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/forum/${post.id}`}
                    className="block bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full">
                            {post.category}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                        </div>
                        {post.labels && post.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {post.labels.map((label, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-gray-600 mb-4">{post.excerpt || post.content?.substring(0, 150) + '...'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {post.date ? new Date(post.date).toLocaleDateString() : 'Recently'}
                      </div>
                      <div className="flex items-center gap-1">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        {post.replies || 0} replies
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg mb-4">No posts found in this category.</p>
                {user && (
                  <button
                    onClick={handleCreatePost}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Create the first post
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Forum Info */}
        <div className="mt-12 bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join the Conversation
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            The forum is a place for average dads to share experiences, ask questions, and support each other on their fitness journeys. Be respectful, be encouraging, and remember - we're all in this together.
          </p>
        </div>
      </div>
    </div>
  )
}
