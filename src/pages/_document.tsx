import React, { JSX } from "react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document(): JSX.Element {
  return (
    <Html lang="zh-Hant-TW">
      <Head>
        {/* 網站簡介 */}
        <meta
          name="description"
          content="現代化的金融市場分析平台，提供股票、加密貨幣、期貨、房地產等多元市場的數據分析、技術指標、情緒追蹤與投資組合管理功能。"
        />
        {/* 網站主題顏色 */}
        <meta name="theme-color" content="#000000" />
        {/* 網站語言 */}
        <meta name="language" content="zh-Hant-TW" />
        {/* 網站編碼 */}
        <meta charSet="UTF-8" />
        {/* 網站作者 */}
        <meta name="author" content="HaoXun" />
        {/* 網站版權 */}
        <meta name="copyright" content="HaoXun" />
        {/* 網站關鍵字 */}
        <meta
          name="keywords"
          content="金融, 股票, 加密貨幣, 期貨, 房地產, 數據分析, 技術指標, 市場情緒, 投資組合, 智慧分析, 金融市場, 投資管理, 財務分析, 資產配置, 風險管理, 財經新聞, 市場趨勢, 技術分析, 基本面分析, 投資策略, 資產管理, 財務報表, 交易策略, 市場預測, 投資組合管理, 資本市場, 金融科技, 數據視覺化, 財經數據, 投資風險, 資本配置, 投資回報, 資產評估, 財務規劃, 投資建議, 市場分析, 財經指標, 投資組合優化, 資產配置策略, 風險評估, 投資決策, 財務健康, 資本運作, 投資回測, 財務模型, 投資組合分析, 資產配置模型, 風險控制, 投資組合回報, 財務指標, 投資組合風險, 資本市場分析, 投資組合建構, 財務預測, 投資組合績效, 資本運作策略, 投資組合管理工具"
        />
        {/* 網站社交媒體預覽 */}
        <meta property="og:title" content="金融走勢智慧分析平台" />
        <meta
          property="og:description"
          content="現代化的金融市場分析平台，提供股票、加密貨幣、期貨、房地產等多元市場的數據分析、技術指標、情緒追蹤與投資組合管理功能。"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://haoxun97.github.io/financial-analysis"
        />
        <meta property="og:image" content="/images/preview.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
