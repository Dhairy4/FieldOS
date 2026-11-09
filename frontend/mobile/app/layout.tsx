import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Sans_Gujarati } from "next/font/google";
import { AuthProvider, ThemeProvider } from "@fieldos/shared";
import "@fieldos/shared/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
// Indic fallbacks: Gujarati/Hindi glyphs are not in Inter
const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-indic", display: "swap" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-indic-dv", display: "swap" });

export const metadata: Metadata = {
  title: "FieldOS — Technician",
  description: "Voice-first AI co-worker for field operations. Report issues in Gujarati, Hindi or English.",
  applicationName: "FieldOS",
  appleWebApp: { capable: true, title: "FieldOS", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1117" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${mono.variable} ${gujarati.variable} ${devanagari.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
