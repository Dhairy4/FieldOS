import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fieldos/shared/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FieldOS - Supervisor Dashboard",
  description: "Supervisor command center for field operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}