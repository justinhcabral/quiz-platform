import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouQuizz — pick a cartridge. press start.",
  description:
    "YouQuizz is a game-first quiz platform. Load a quiz pak, answer one question at a time, walk out smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
