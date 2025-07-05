/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Add polyfill for Promise.withResolvers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    
    // Add polyfill at the entry point
    if (!isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        if (entries['main.js'] && !entries['main.js'].includes('./polyfills.js')) {
          entries['main.js'].unshift('./polyfills.js');
        }
        return entries;
      };
    }
    
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['react-pdf']
  }
}

module.exports = nextConfig 