// /frontend/src/pages/_app.js

import "../styles/globals.css";
import Head from "next/head"; // Impor Head untuk mengatur judul halaman
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {
  return (
    // Bungkus semua dengan div untuk layout flex
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>MBG Calc Apps</title>
        <meta
          name="description"
          content="Kalkulator Gizi MBG untuk analisis nutrisi menu."
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
