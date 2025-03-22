/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable any experimental features
    suppressHydrationWarning: true
  }
}

module.exports = nextConfig 