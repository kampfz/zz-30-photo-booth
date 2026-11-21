import type { Metadata, Viewport } from "next";
import { Bungee, Nunito, Titan_One } from "next/font/google";
import "./globals.css";

const titanOne = Titan_One({ subsets: ["latin"], variable: "--font-display", weight: "400" });
const bungee = Bungee({ subsets: ["latin"], variable: "--font-bungee", weight: "400" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-body", weight: ["400", "700", "800", "900"] });

export const metadata: Metadata = {
  description: "Snap a photo at Zach and Zoe's 30th and let Gemini give it the Y2K treatment.",
  title: "Zach & Zoe turn 30! Photo Booth",
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#d6006e",
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${titanOne.variable} ${bungee.variable} ${nunito.variable}`}>{children}</body>
    </html>
  );
}
