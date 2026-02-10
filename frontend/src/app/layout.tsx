import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FutVote | Best Football Player",
  description: "Vote for the best football player in a clean and elegant experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="gradient-bg">{children}</body>
    </html>
  );
}
