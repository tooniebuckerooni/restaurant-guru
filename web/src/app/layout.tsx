import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free & Fast — schedule maker",
  description:
    "One-tap staff schedule generation for shift-based businesses. Set up once; every schedule after is a quick click.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
