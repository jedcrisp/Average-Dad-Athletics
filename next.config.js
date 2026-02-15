/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply COOP header to all routes except auth-related pages
        // This allows OAuth popups to work properly
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
