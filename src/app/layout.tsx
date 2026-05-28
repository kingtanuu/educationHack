import type { Metadata } from "next";
import { BIZ_UDPGothic, Cinzel } from "next/font/google";
import "./globals.css";

const bizUdp = BIZ_UDPGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-biz-udp",
  display: "swap",
});

const cinzel = Cinzel({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChemiSpire — 化学塔登り",
  description:
    "化学式を、暗記から戦略カードへ。Slay the Spire オマージュの化学学習ローグライク・デッキビルダー。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${bizUdp.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
