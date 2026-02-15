'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { forumHelpers, blockedUserHelpers } from '@/lib/firebase-helpers'

const categories = ['Getting Started', 'Equipment', 'Motivation', 'Nutrition', 'Progress', 'Sports']

// Available labels/tags that users can select
const availableLabels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Weight Loss',
  'Muscle Gain',
  'Cardio',
  'Strength Training',
  'Flexibility',
  'Nutrition',
  'Recovery',
  'Motivation',
  'Questions',
  'Success Stories',
  'Challenges',
  'Equipment',
  'Home Workout',
  'Gym Workout',
  'Running',
  'Cycling',
  'Swimming',
  'Basketball',
  'Football',
  'Baseball',
  'Soccer',
  'Other Sports'
]

export default function CreateForumPostPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/login?redirect=/forum/create')
    }
  }, [mounted, authLoading, user, router])

  const toggleLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label))
    } else {
      setSelectedLabels([...selectedLabels, label])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      router.push('/login?redirect=/forum/create')
      return
    }

    if (!title.trim() || !content.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    // Check if user is blocked
    try {
      const userEmail = user.email?.toLowerCase().trim()
      if (userEmail) {
        const isBlocked = await forumHelpers.isUserBlocked(userEmail)
        if (isBlocked) {
          setError('Your account has been blocked. Please contact support if you believe this is an error.')
          return
        }
      }
    } catch (blockCheckError) {
      console.error('Error checking if user is blocked:', blockCheckError)
      // Continue with post creation if check fails (don't block legitimate users)
    }

    try {
      setSubmitting(true)
      
      const excerpt = content.length > 150 ? content.substring(0, 150) + '...' : content
      
      const postId = await forumHelpers.create({
        title: title.trim(),
        author: user.displayName || user.email || 'Anonymous',
        authorId: user.uid,
        date: new Date().toISOString(),
        replies: 0,
        category: category,
        labels: selectedLabels.length > 0 ? selectedLabels : undefined,
        excerpt: excerpt,
        content: content.trim()
      })

      // Redirect to the new post
      router.push(`/forum/${postId}`)
    } catch (err: any) {
      console.error('Error creating post:', err)
      setError(err.message || 'Failed to create conversation. Please try again.')
      setSubmitting(false)
    }
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Forum
        </Link>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Conversation</h1>
          <p className="text-gray-600 mb-6">Start a discussion and connect with the community</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="What would you like to discuss?"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">This helps route your conversation to the right group</p>
            </div>

            {/* Labels/Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labels (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add labels to help others find your conversation. Select multiple labels that apply.
              </p>
              
              {/* Selected Labels */}
              {selectedLabels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedLabels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => toggleLabel(label)}
                        className="hover:text-primary-900"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Available Labels */}
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {availableLabels.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedLabels.includes(label)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {selectedLabels.length} label{selectedLabels.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Share your thoughts, ask questions, or start a discussion..."
              />
              <p className="mt-2 text-sm text-gray-500">
                {content.length} characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating Conversation...' : 'Create Conversation'}
              </button>
              <Link
                href="/forum"
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
