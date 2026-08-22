import type { Metadata } from "next";
import "./globals.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "DobryPrzyjaciel.pl | Twój Osobisty Przyjaciel, Głos i Uziemienie",
  description: "Ciepły głos, kojący ambient, żywy graf pamięci i uziemienie w trudnych chwilach. Twój osobisty przyjaciel na DobryPrzyjaciel.pl, który pomaga stanąć na nogi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-[#07090E] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
