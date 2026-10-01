import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS: Linux Quest | PenTrix",
  description:
    "A story-driven in-browser terminal adventure that teaches Linux, built by PenTrix.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0b0e14] text-[#e6e9f0] antialiased">
        {children}
      </body>
    </html>
  );
}
