'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatBubbleLeftRightIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Post {
  id: string
  title: string
  author: string
  date: string
  replies: number
  category: string
  excerpt: string
}

// Example forum posts - replace with actual forum functionality
const posts: Post[] = [
  {
    id: '1',
    title: 'Starting my fitness journey - need advice!',
    author: 'DadOnTheRise',
    date: '2024-01-15',
    replies: 12,
    category: 'Getting Started',
    excerpt: 'Hey everyone, I\'m a 35-year-old dad of two and finally ready to make a change. Any tips for someone just starting out?',
  },
  {
    id: '2',
    title: 'Best home workout equipment for dads?',
    author: 'FitDad2024',
    date: '2024-01-14',
    replies: 8,
    category: 'Equipment',
    excerpt: 'Looking to set up a home gym but space is limited. What equipment would you recommend?',
  },
  {
    id: '3',
    title: 'How do you find time to workout with kids?',
    author: 'BusyDad',
    date: '2024-01-13',
    replies: 15,
    category: 'Motivation',
    excerpt: 'Between work and kids, I struggle to find time. How do you all manage it?',
  },
]

const categories = ['All', 'Getting Started', 'Equipment', 'Motivation', 'Nutrition', 'Progress']

export default function ForumPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const handleCreatePost = () => {
    if (session) {
      // In a real app, this would open a modal or navigate to a create post page
      alert('Create post functionality coming soon!')
    } else {
      router.push('/login?redirect=/forum')
    }
  }

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((post) => post.category === selectedCategory)

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
          {session ? (
            <button
              onClick={handleCreatePost}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Create New Post
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

        {/* Posts List */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    {post.replies} replies
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg mb-4">No posts found in this category.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all posts
            </button>
          </div>
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
