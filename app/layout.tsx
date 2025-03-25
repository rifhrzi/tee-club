import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "../constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
