import type { Metadata } from 'next'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

async function getForumPost(id: string) {
  if (!db) return null
  
  try {
    const postRef = doc(db, 'forumPosts', id)
    const postSnap = await getDoc(postRef)
    if (postSnap.exists()) {
      return { id: postSnap.id, ...postSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching post for metadata:', error)
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const post = await getForumPost(id)
  
  if (!post) {
    return {
      title: 'Post Not Found - Average Dad Athletics',
      description: 'The forum post you are looking for could not be found.',
    }
  }

  const title = `${post.title} - Average Dad Athletics Forum`
  const description = post.excerpt || post.content?.substring(0, 200) || 'Join the conversation on Average Dad Athletics'
  // Use environment variable for base URL, fallback to production URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://averagedadathletics.com')
  const url = `${baseUrl}/forum/${id}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Average Dad Athletics',
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default function ForumPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
