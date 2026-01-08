import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Brush Atelier - Your AI Art Coach",
  description: "Get personalized art coaching, real-time feedback, and a custom learning path powered by AI. Master your craft with adaptive skill assessment and progress tracking.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: '/brushatelier_icon.ico', sizes: 'any' },
      { url: '/brushatelier_icon.ico', sizes: '32x32' },
      { url: '/brushatelier_icon.ico', sizes: '16x16' },
    ],
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Brush Atelier',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FBF7F2" />
        <link
          rel="preconnect"
          href="https://fonts.cdnfonts.com"
        />
        <link
          href="https://fonts.cdnfonts.com/css/mona-sans"
          rel="stylesheet"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased touch-manipulation">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
