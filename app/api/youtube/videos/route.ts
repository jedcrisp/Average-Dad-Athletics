import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_HANDLE = '@AverageDadAthletics'

export async function GET() {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: 'YouTube API key not configured' },
      { status: 500 }
    )
  }

  try {
    let channelId: string | null = null
    let uploadsPlaylistId: string | null = null

    // Method 1: Try searching by handle (works for @handle format)
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(YOUTUBE_CHANNEL_HANDLE)}&type=channel&key=${YOUTUBE_API_KEY}&maxResults=1`
    )
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].snippet.channelId
        
        // Get uploads playlist
        const channelDetailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
        )
        if (channelDetailsResponse.ok) {
          const channelDetails = await channelDetailsResponse.json()
          uploadsPlaylistId = channelDetails.items[0]?.contentDetails?.relatedPlaylists?.uploads
        }
      }
    }

    // Method 2: If search didn't work, try forUsername (older format)
    if (!channelId) {
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=${YOUTUBE_CHANNEL_HANDLE.slice(1)}&key=${YOUTUBE_API_KEY}`
      )

      if (channelResponse.ok) {
        const channelData = await channelResponse.json()
        if (channelData.items && channelData.items.length > 0) {
          channelId = channelData.items[0].id
          uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads
        }
      }
    }

    if (!uploadsPlaylistId) {
      return NextResponse.json(
        { error: 'Could not find channel uploads playlist' },
        { status: 404 }
      )
    }

    // Fetch videos from the uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}&maxResults=50&order=date`
    )

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json()
      return NextResponse.json(
        { error: 'Failed to fetch videos', details: errorData },
        { status: videosResponse.status }
      )
    }

    const videosData = await videosResponse.json()

    // Transform the data to match our Video interface
    const videos = videosData.items
      .filter((item: any) => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video')
      .map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      }))

    return NextResponse.json({ videos })
  } catch (error: any) {
    console.error('Error fetching YouTube videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error.message },
      { status: 500 }
    )
  }
}
