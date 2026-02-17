'use client'

import React from 'react'

interface ShareButtonsProps {
  url: string
  title?: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title || '')

  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  const x = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        alert('Link copied!')
      } catch {
        prompt('Copy this link:', url)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50"
        title="Share on Facebook"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a
        href={x}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg transition-colors text-blue-400 hover:bg-blue-50"
        title="Share on X (Twitter)"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <button
        onClick={copy}
        className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
        title="Copy link to clipboard"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  )
}
