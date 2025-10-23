import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Tarot Oracle",
  description: "การเริ่มต้นใหม่, การผจญภัย, และความไร้เดียงสา ซึ่งอาจจะมีความเสี่ยงแต่ก็เต็มไปด้วยโอกาสใหม่ๆ ไพ่ใบนี้ยังสื่อถึงการมองโลกในแง่ดี, ความกล้าที่จะลองผิดลองถูก, และการเปิดใจรับสิ่งใหม่ๆ",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Tarot Oracle",
    description: "การเริ่มต้นใหม่, การผจญภัย, และความไร้เดียงสา ซึ่งอาจจะมีความเสี่ยงแต่ก็เต็มไปด้วยโอกาสใหม่ๆ ไพ่ใบนี้ยังสื่อถึงการมองโลกในแง่ดี, ความกล้าที่จะลองผิดลองถูก, และการเปิดใจรับสิ่งใหม่ๆ",
    url: "https://devtarotoracle.vercel.app",
    siteName: "Tarot Oracle",
    images: [
      {
        url: "https://devtarotoracle.vercel.app/og.jpg",
        width: 1200,
        height: 630,
        alt: "Tarot Oracle - รัวรับสับเปิด",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarot Oracle",
    description: "การเริ่มต้นใหม่, การผจญภัย, และความไร้เดียงสา ซึ่งอาจจะมีความเสี่ยงแต่ก็เต็มไปด้วยโอกาสใหม่ๆ ไพ่ใบนี้ยังสื่อถึงการมองโลกในแง่ดี, ความกล้าที่จะลองผิดลองถูก, และการเปิดใจรับสิ่งใหม่ๆ",
    images: ["https://devtarotoracle.vercel.app/og.jpg"],
    creator: "@tarotoracle",
  },
  alternates: {
    canonical: "https://devtarotoracle.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  keywords: [
    "Tarot Oracle",
    "ไพ่",
    "ดูดวง",
    "ไพ่ดูดวง",
  ],
  authors: [{ name: "Tarot Oracle" }],
  creator: "Tarot Oracle",
  publisher: "Tarot Oracle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${notoSansThai.className} bg-[url('/bg/bg.jpg')] bg-cover bg-no-repeat pt-6`}
      >
        {children}
      </body>
    </html>
  );
}
