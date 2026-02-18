import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BTS Army Global Community",
  description: "Innovating Daily Life with AI Intelligence.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BTS Army",
  },
};

export const viewport: Viewport = {
  themeColor: "#7A00B7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { LanguageProvider } from "@/contexts/LanguageContext";

import HydrationGuard from "@/components/HydrationGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HydrationGuard>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Footer />
          </LanguageProvider>
        </HydrationGuard>
      </body>
    </html>
  );
}
