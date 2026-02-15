/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups', // Allows OAuth popups to work
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
