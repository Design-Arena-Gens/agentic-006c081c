import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katha Management - Daily Financial Tracker",
  description: "Track your daily income and expenses with ease",
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
      </body>
    </html>
  );
}
