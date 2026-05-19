import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retro Tetris Game",
  description: "Neon retro-futurist Tetris game for mobile and desktop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full"
    >
      <body className="min-h-full flex flex-col crt-overlay">{children}</body>
    </html>
  );
}
