import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dobry Przyjaciel | Twój osobisty, oddany przyjaciel ze sztuczną inteligencją",
  description: "Ciepły, ludzki głos, żywa pamięć relacji, uziemienie emocjonalne i bezpieczna przystań. Twój osobisty przyjaciel, który zawsze ma dla ciebie czas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dobry Przyjaciel",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-cream-100 text-cream-900 min-h-screen antialiased selection:bg-sun-500/20 selection:text-cream-950 font-sans">
        {children}
      </body>
    </html>
  );
}
