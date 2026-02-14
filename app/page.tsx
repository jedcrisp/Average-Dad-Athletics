import Link from 'next/link'
import { ArrowRightIcon, PlayIcon, FireIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 text-white py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Average Dad Athletics
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-accent-200 max-w-3xl mx-auto">
            For the dads who refuse to settle. For the dads who want to be better.
            Join a community of average dads pushing themselves to greatness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/videos"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <PlayIcon className="w-5 h-5" />
              Watch Videos
            </Link>
            <Link
              href="/workouts"
              className="bg-white text-accent-900 px-8 py-4 rounded-lg font-semibold hover:bg-accent-50 transition-colors flex items-center justify-center gap-2 border-2 border-primary-500"
            >
              <FireIcon className="w-5 h-5" />
              View Workouts
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Average Dad Athletics?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-50">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Real Progress</h3>
              <p className="text-gray-600">
                No fake transformations. Just real dads making real progress, one workout at a time.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gray-50">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Community</h3>
              <p className="text-gray-600">
                Connect with other dads who understand the struggle and celebrate the wins together.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gray-50">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Accountability</h3>
              <p className="text-gray-600">
                Stay motivated with workouts, videos, and a community that holds you accountable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-accent-900">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-accent-700 mb-8">
            Join the community of average dads who are choosing to be better. 
            Every great journey starts with a single step.
          </p>
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
