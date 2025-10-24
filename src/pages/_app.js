// /frontend/src/pages/_app.js

import "../styles/globals.css";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>MBG Calc Apps AI</title>
        <meta
          name="description"
          content="Kalkulator Gizi MBG untuk analisis nutrisi menu berbasis AI"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {/* Bagian utama yang akan diisi oleh halaman (misal: index.js) */}
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>

      <Footer />
    </div>
  );
}

export default MyApp;
