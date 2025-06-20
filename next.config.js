/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // 只在生產環境中使用 basePath 和 assetPrefix
  ...(process.env.NODE_ENV === "production"
    ? {
        basePath: "/financial-analysis",
        assetPrefix: "/financial-analysis",
      }
    : {}),
};

module.exports = nextConfig;
