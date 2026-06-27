import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Calendar",
  description: "Track your family's availability and conflicts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
