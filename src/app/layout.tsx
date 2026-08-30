import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dobry Przyjaciel | Ktoś, kto pamięta. Ktoś, kto ma czas.",
  description: "Ciepły, naturalny głos, żywa pamięć relacji i bezpieczna przystań. Ktoś, kto pamięta i ma dla Ciebie czas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dobry Przyjaciel",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F1EA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://dobryprzyjaciel.pl/#org",
        "name": "Dobry Przyjaciel",
        "legalName": "Multinewsroom Jan Domaniewski",
        "vatID": "PL5252189241",
        "url": "https://dobryprzyjaciel.pl/",
        "email": "kontakt@multinewsroom.pl",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "ul. Barcicka 44",
          "postalCode": "01-839",
          "addressLocality": "Warszawa",
          "addressCountry": "PL",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://dobryprzyjaciel.pl/#website",
        "url": "https://dobryprzyjaciel.pl/",
        "name": "Dobry Przyjaciel",
        "inLanguage": "pl-PL",
        "publisher": {
          "@id": "https://dobryprzyjaciel.pl/#org",
        },
      },
    ],
  };

  return (
    <html lang="pl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Plus+Jakarta+Sans:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-paper text-ink min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
