import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- UPDATE METADATA HERE ---
export const metadata: Metadata = {
  title: "Shafayatur Rahman | CS student| Portfolio",
  description: "Portfolio of Shafayatur Rahman, a Computer Science student at BRAC University specializing in Full Stack Development and Security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}