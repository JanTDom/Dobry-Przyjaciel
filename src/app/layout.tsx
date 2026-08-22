import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dobry Przyjaciel | Twoja bezpieczna przystań, głos i obecność",
  description: "Ciepły głos, kojący ambient kominka, żywa pamięć relacji i uziemienie w trudnych chwilach. Twój osobisty przyjaciel, który pomaga stanąć na nogi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-sanctuary-950 text-sanctuary-100 min-h-screen antialiased selection:bg-hearth-500/30 selection:text-hearth-100 font-sans">
        {children}
      </body>
    </html>
  );
}
