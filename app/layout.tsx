import { Inter, Bebas_Neue, Oswald, Russo_One } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/constants";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";

const inter = Inter({ subsets: ["latin"] });
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});
const oswald = Oswald({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
});
const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo-one",
});

export const metadata = {
  title: `${SITE_CONFIG.name} | Underground Band Merchandise`,
  description: SITE_CONFIG.description,
  keywords:
    "band merchandise, metal shirts, rock clothing, underground music, concert tees, band hoodies, music apparel",
  authors: [{ name: "Riot Threads" }],
  creator: "Riot Threads",
  publisher: "Riot Threads",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} | Underground Band Merchandise`,
    description: SITE_CONFIG.description,
    type: "website",
    locale: "en_US",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | Underground Band Merchandise`,
    description: SITE_CONFIG.description,
    creator: "@riotthreads",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${inter.className} ${bebasNeue.variable} ${oswald.variable} ${russoOne.variable} bg-grunge-dark text-grunge-light antialiased`}
      >
        <NextAuthProvider>
          <LoadingProvider>
            <div className="bg-grunge-dark bg-noise min-h-screen">{children}</div>
          </LoadingProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
