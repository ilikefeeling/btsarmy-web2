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

import HydrationGuard from "@/components/HydrationGuard";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import ConsoleFilter from "@/components/ConsoleFilter";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof Node === 'undefined') return;
                var originalRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function(child) {
                  try {
                    return originalRemoveChild.apply(this, arguments);
                  } catch (e) {
                    // Suppress "The node to be removed is not a child of this node" usually caused by external scripts (frame_start.js)
                    if (e.message && (e.message.indexOf('not a child') > -1 || e.name === 'NotFoundError')) {
                      console.debug('[SafeDOM] Suppressed external DOM interference.');
                      if (child.parentNode) {
                          // Fallback: if the child actually has a parent, try removing it from there? 
                          // Or just ignore if it's already detached.
                          try { child.parentNode.removeChild(child); } catch(ex) {}
                      }
                      return child;
                    }
                    throw e;
                  }
                };
                
                // Also patch insertBefore? Sometimes related.
                var originalInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function(newNode, referenceNode) {
                    try {
                        return originalInsertBefore.apply(this, arguments);
                    } catch(e) {
                        if (e.message && (e.message.indexOf('not a child') > -1 || e.name === 'NotFoundError')) {
                             console.debug('[SafeDOM] Suppressed external insertBefore interference.');
                             // Try appending if reference node is gone? warning: might break layout order.
                             // For now, just suppress crash.
                             return newNode;
                        }
                        throw e;
                    }
                }
              })();
            `,
          }}
        />
        <ConsoleFilter />
        <GlobalErrorBoundary>
          <HydrationGuard>
            <LanguageProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
              <Footer />
            </LanguageProvider>
          </HydrationGuard>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
