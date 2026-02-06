import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iftar Timer - Know When to Break Your Fast",
  description: "Beautiful, minimal iftar time countdown for any location worldwide. Find accurate prayer times and iftar countdowns for Ramadan.",
  keywords: ["iftar", "ramadan", "prayer times", "fasting", "maghrib", "muslim"],
  authors: [{ name: "Iftar Timer" }],
  openGraph: {
    title: "Iftar Timer - Know When to Break Your Fast",
    description: "Beautiful iftar time countdown for any location worldwide",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D7377",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
