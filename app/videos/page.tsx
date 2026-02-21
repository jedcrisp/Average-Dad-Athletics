'use client'

import { useState, useEffect } from 'react'

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt?: string
  channelTitle?: string
  viewCount?: string
  likeCount?: string
}

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/youtube/videos')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch videos')
        }
        
        const data = await response.json()
        setVideos(data.videos || [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching videos:', err)
        setError(err.message || 'Failed to load videos. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest Videos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch the latest content from Average Dad Athletics. Workouts, tips, motivation, and real talk for average dads.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : selectedVideo ? (
          <div className="mb-8">
            <button
              onClick={() => setSelectedVideo(null)}
              className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to all videos
            </button>
            {(() => {
              const video = videos.find(v => v.id === selectedVideo)
              return (
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  {video && (
                    <div className="mt-4">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{video.title}</h2>
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        {video.publishedAt && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {new Date(video.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {video.viewCount && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{parseInt(video.viewCount).toLocaleString()} views</span>
                          </div>
                        )}
                        {video.likeCount && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l3.546-3.547a1 1 0 00.293-.707V8.93a1 1 0 00-.293-.707L7.707 4.677A1 1 0 006 5.384v4.949zM15.818 2.502a1.5 1.5 0 011.57.287l3.13 2.8a1.5 1.5 0 010 2.226l-3.13 2.8a1.5 1.5 0 01-1.57.288 1.5 1.5 0 01-.818-1.4V3.902a1.5 1.5 0 01.818-1.4z" />
                            </svg>
                            <span>{parseInt(video.likeCount).toLocaleString()} likes</span>
                          </div>
                        )}
                      </div>
                      {video.description && (
                        <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedVideo(video.id)}
                >
                  <div className="relative aspect-video bg-gray-200">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
                      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">{video.title}</h3>
                    {video.publishedAt && (
                      <p className="text-gray-500 text-xs mb-2">
                        {new Date(video.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      {video.viewCount && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{parseInt(video.viewCount).toLocaleString()} views</span>
                        </div>
                      )}
                      {video.likeCount && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l3.546-3.547a1 1 0 00.293-.707V8.93a1 1 0 00-.293-.707L7.707 4.677A1 1 0 006 5.384v4.949zM15.818 2.502a1.5 1.5 0 011.57.287l3.13 2.8a1.5 1.5 0 010 2.226l-3.13 2.8a1.5 1.5 0 01-1.57.288 1.5 1.5 0 01-.818-1.4V3.902a1.5 1.5 0 01.818-1.4z" />
                          </svg>
                          <span>{parseInt(video.likeCount).toLocaleString()} likes</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {video.description || 'No description available'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No videos yet. Check back soon!</p>
                <p className="text-gray-500">
                  Videos will appear here automatically once you start posting to YouTube.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <a
            href="https://www.youtube.com/@AverageDadAthletics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Subscribe on YouTube
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
