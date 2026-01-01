import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Build performance optimizations
  experimental: {
    // Parallel compilation for faster builds
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,

    // Optimize imports for heavy libraries (tree-shaking)
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
  },

  // Optimize image handling
  images: {
    deviceSizes: [640, 750, 1080, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

export default withBundleAnalyzer(nextConfig);
