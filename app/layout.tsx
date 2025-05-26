import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/constants";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
