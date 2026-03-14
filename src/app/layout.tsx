import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncTrip",
  description: "Collaborative travel workspace powered by Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
