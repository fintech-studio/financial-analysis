/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 只在生產環境中使用 basePath 和 assetPrefix
  ...(process.env.NODE_ENV === 'production' ? {
    basePath: '/finance-analysis',
    assetPrefix: '/finance-analysis',
  } : {})
};

module.exports = nextConfig;
