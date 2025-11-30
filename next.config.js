/* eslint-env node */
/* global process, module */
/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const PY_API_HOST = process.env.PY_API_HOST;

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
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: `${PY_API_HOST}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
