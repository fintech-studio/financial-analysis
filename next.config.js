/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig = {
  // 只有靜態輸出時才設定 basePath 和 assetPrefix
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath: "/financial-analysis",
        assetPrefix: "/financial-analysis",
      }
    : {}),
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/py/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
