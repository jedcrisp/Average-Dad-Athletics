import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Average Dad Athletics - Inspiring Average Dads to Get Better',
  description: 'A community for average dads pushing themselves to improve. Workouts, videos, and motivation for dads who want to be better.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
