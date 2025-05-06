import "../styles/globals.css";
import Navigation from "../components/Layout/Navigation";
import PageTransition from "../components/Layout/PageTransition";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* 網站標題 */}
        <title>金融走勢智慧分析平台</title>
        {/* 網站圖示 */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <PageTransition>
        <main className="pt-16 min-h-screen">
          <Component {...pageProps} />
        </main>
      </PageTransition>
    </>
  );
}

export default MyApp;
