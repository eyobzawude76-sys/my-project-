import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " University System",
  description: " University System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}
        <p   className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-sm">
          system developer by Eyob</p>
        <p   className="bg-red-400 text-yellow-900 px-3 py-1 rounded-lg text-sm"> 
          contact me 0945202203 and 0943612097</p>
      </body>

      </html>
  );
}
