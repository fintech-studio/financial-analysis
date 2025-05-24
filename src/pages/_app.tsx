import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import PageTransition from "../components/Layout/PageTransition";
import Navigation from "../components/Layout/Navigation";
import "../styles/globals.css";
import Head from "next/head";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  hideNavigation?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  // 檢查頁面是否需要隱藏導航列
  const hideNavigation = Component.hideNavigation || false;

  // 使用頁面級別的 getLayout，如果沒有則使用默認佈局
  const getLayout =
    Component.getLayout ??
    ((page) => (
      <>
        <Head>
          <title>FinTech 智慧投資</title>
        </Head>
        {!hideNavigation && <Navigation />}
        <main className={hideNavigation ? "" : "main-content"}>{page}</main>
      </>
    ));

  // 將整個應用包裹在 PageTransition 中
  return (
    <PageTransition>{getLayout(<Component {...pageProps} />)}</PageTransition>
  );
}
