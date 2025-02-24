/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['mermaid'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
}

module.exports = nextConfig 