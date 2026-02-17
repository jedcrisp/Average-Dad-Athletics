'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { UserIcon, ClockIcon, ArrowLeftIcon, ChatBubbleLeftRightIcon, StarIcon, ShareIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { forumHelpers, blockedUserHelpers, ForumPost, ForumReply } from '@/lib/firebase-helpers'

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
  const [isFavorited, setIsFavorited] = useState(false)
  const [togglingFavorite, setTogglingFavorite] = useState(false)

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

    // Check if user is blocked
    try {
      const userEmail = user.email?.toLowerCase().trim()
      if (userEmail) {
        const isBlocked = await blockedUserHelpers.isBlocked(userEmail)
        if (isBlocked) {
          alert('Your account has been blocked. Please contact support if you believe this is an error.')
          return
        }
      }
    } catch (blockCheckError) {
      console.error('Error checking if user is blocked:', blockCheckError)
      // Continue with reply if check fails (don't block legitimate users)
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

  // Check if post is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (user && postId) {
        try {
          const favorited = await forumHelpers.isFavorited(user.uid, postId)
          setIsFavorited(favorited)
        } catch (error) {
          console.error('Error checking favorite status:', error)
        }
      }
    }
    checkFavorite()
  }, [user, postId])

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login?redirect=/forum/' + postId)
      return
    }

    try {
      setTogglingFavorite(true)
      if (isFavorited) {
        await forumHelpers.removeFavorite(user.uid, postId)
        setIsFavorited(false)
      } else {
        await forumHelpers.addFavorite(user.uid, postId)
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to update favorite. Please try again.')
    } finally {
      setTogglingFavorite(false)
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

  // Get the current page URL for sharing
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  }

  // Share to Facebook
  const shareToFacebook = () => {
    const url = getShareUrl()
    const shareText = post?.title || 'Check out this conversation on Average Dad Athletics'
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  // Share to Twitter
  const shareToTwitter = () => {
    const url = getShareUrl()
    const shareText = post?.title || 'Check out this conversation on Average Dad Athletics'
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
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
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">{post.title}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Share Buttons */}
              <div className="flex items-center gap-2 border-r border-gray-200 pr-2">
                <span className="text-xs text-gray-500 mr-1">Share:</span>
                <button
                  onClick={shareToFacebook}
                  className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50"
                  title="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={shareToTwitter}
                  className="p-2 rounded-lg transition-colors text-blue-400 hover:bg-blue-50"
                  title="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
              </div>
              {/* Favorite Button */}
              {user && (
                <button
                  onClick={handleToggleFavorite}
                  disabled={togglingFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorited
                      ? 'text-yellow-500 hover:bg-yellow-50'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-500'
                  } disabled:opacity-50`}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {togglingFavorite ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                  ) : isFavorited ? (
                    <StarIconSolid className="w-6 h-6" />
                  ) : (
                    <StarIcon className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>
          </div>
          
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
