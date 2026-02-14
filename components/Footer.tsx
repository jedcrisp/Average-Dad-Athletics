import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-accent-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Average Dad Athletics</h3>
            <p className="text-gray-400">
              Inspiring average dads to push themselves and get better, one workout at a time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-white transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/workouts" className="hover:text-white transition-colors">
                  Workouts
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/forum" className="hover:text-white transition-colors">
                  Forum
                </Link>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <p className="text-gray-400 mb-2">
              Join the community of average dads pushing themselves to be better.
            </p>
          </div>
        </div>
        <div className="border-t border-accent-800 pt-8 text-center text-accent-400">
          <p>&copy; {new Date().getFullYear()} Average Dad Athletics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
