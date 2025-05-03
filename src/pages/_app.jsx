import '../styles/globals.css';
import Navigation from '../components/Layout/Navigation';
import PageTransition from '../components/Layout/PageTransition';

function MyApp({ Component, pageProps }) {
  return (
    <>
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