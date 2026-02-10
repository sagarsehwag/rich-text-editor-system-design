import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rich Text Editor System Design - Interactive Demos",
  description: "Interactive demonstrations for frontend system design session covering rendering approaches, contentEditable, selection, state models, update loops, and node structures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
