import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Promtuz",
  description: "Project",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-mode="dark">
      <body
        className={`${geistSans.variable} antialiased overflow-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
