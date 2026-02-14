'use client'

import { useState } from 'react'

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
}

// Example videos - replace with your actual YouTube video IDs
const videos: Video[] = [
  {
    id: 'dQw4w9WgXcQ', // Replace with your actual video ID
    title: 'Welcome to Average Dad Athletics',
    description: 'Introduction to the community and what we\'re all about.',
    thumbnail: '',
  },
  // Add more videos here as you create them
]

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

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

        {selectedVideo ? (
          <div className="mb-8">
            <button
              onClick={() => setSelectedVideo(null)}
              className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to all videos
            </button>
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
            </div>
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
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
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
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{video.title}</h3>
                    <p className="text-gray-600 text-sm">{video.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No videos yet. Check back soon!</p>
                <p className="text-gray-500">
                  Videos will appear here once you start posting to YouTube.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <a
            href="https://youtube.com"
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
