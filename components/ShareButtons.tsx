'use client'

import React from 'react'

interface ShareButtonsProps {
  url: string
  title?: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
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
