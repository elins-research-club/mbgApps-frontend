// /frontend/src/pages/_app.js

import "../styles/globals.css";
import Head from "next/head";
import { AuthProvider } from "../contexts/AuthContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Head>
          <title>MBG Calc Apps AI</title>
          <meta
            name="description"
            content="Kalkulator Gizi MBG untuk analisis nutrisi menu berbasis AI"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Navbar & Footer dihapus dari sini, sekarang ada di GuestView/ChefDashboard */}
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;