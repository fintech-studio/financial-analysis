/** @type {import('next').NextConfig} */
const nextConfig = {
  // 根據環境變數控制靜態輸出
  ...(process.env.STATIC_EXPORT === "true"
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {}),
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
