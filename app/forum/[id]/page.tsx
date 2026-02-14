'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { UserIcon, ClockIcon, ArrowLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { forumHelpers, ForumPost, ForumReply } from '@/lib/firebase-helpers'

export default function ForumPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const postId = params.id as string
  
  const [post, setPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError('')
        const fetchedPost = await forumHelpers.getById(postId)
        if (fetchedPost) {
          setPost(fetchedPost)
        } else {
          setError('Post not found')
        }
      } catch (err: any) {
        console.error('Error fetching post:', err)
        setError('Failed to load post. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/login?redirect=/forum/' + postId)
      return
    }

    if (!replyContent.trim()) {
      return
    }

    try {
      setSubmittingReply(true)
      await forumHelpers.addReply(postId, {
        author: user.displayName || user.email || 'Anonymous',
        authorId: user.uid,
        content: replyContent.trim()
      })
      
      // Refresh the post to show the new reply
      const updatedPost = await forumHelpers.getById(postId)
      if (updatedPost) {
        setPost(updatedPost)
      }
      
      setReplyContent('')
    } catch (err: any) {
      console.error('Error submitting reply:', err)
      alert('Failed to submit reply. Please try again.')
    } finally {
      setSubmittingReply(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently'
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Recently'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This post does not exist or has been deleted.'}</p>
          <Link
            href="/forum"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Forum
          </Link>
        </div>
      </div>
    )
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

        {/* Post */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full">
              {post.category}
            </span>
            {post.labels && post.labels.length > 0 && (
              <>
                {post.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {formatDate(post.createdAt || post.date)}
            </div>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              {post.replies || 0} replies
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content || post.excerpt}</p>
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Replies ({post.replies || 0})
          </h2>

          {post.repliesList && post.repliesList.length > 0 ? (
            <div className="space-y-6">
              {post.repliesList.map((reply) => (
                <div key={reply.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{reply.author}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No replies yet. Be the first to reply!</p>
          )}
        </div>

        {/* Reply Form */}
        {user ? (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add a Reply</h2>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submittingReply || !replyContent.trim()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReply ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyContent('')}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
            <p className="text-primary-700 mb-4">
              You need to be signed in to reply to posts.
            </p>
            <Link
              href={`/login?redirect=/forum/${postId}`}
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In to Reply
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
