import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./components/I18nProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import GoogleTranslateWrapper from "./components/GoogleTranslateWrapper";
import { getRequestLocale } from "@/app/lib/i18n/server";
import type { LocaleCode } from "@/app/lib/i18n/languages";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roots - Explore World Cultures",
  description:
    "Discover authentic food, music, and history from cultures around the world",
  icons: {
    icon: "/roots.logo.png",
    shortcut: "/roots.logo.png",
    apple: "/roots.logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale: LocaleCode = await getRequestLocale();

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <GoogleTranslateWrapper />
        <ThemeProvider>
          <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
