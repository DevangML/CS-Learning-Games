/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure serverless functions run on Node (needed for sqlite)
  experimental: {
    // Keep this empty unless needed; using route-level runtime flags
  },
  async rewrites() {
    return [
      // Map legacy auth endpoints to App Router API routes
      {
        source: '/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Legacy execute-query endpoint
      {
        source: '/execute-query',
        destination: '/api/execute-query',
      },
      // Legacy test-connection path (non-API)
      {
        source: '/test-connection',
        destination: '/api/test-connection',
      },
      // SPA fallback: send non-API/non-static routes to index.html
      {
        source: '/((?!api|_next|assets|src|favicon\\.ico|.*\\..*).*)',
        destination: '/index.html',
      },
    ];
  },
};

module.exports = nextConfig;
