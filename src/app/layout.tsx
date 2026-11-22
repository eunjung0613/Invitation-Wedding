import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Gowun_Batang, Noto_Sans_KR } from "next/font/google";
import { WEDDING_CONFIG } from "@/config/wedding";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const gowun = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun",
  display: "swap",
});

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: WEDDING_CONFIG.meta.title,
  description: WEDDING_CONFIG.meta.description,
  openGraph: {
    title: WEDDING_CONFIG.meta.title,
    description: WEDDING_CONFIG.meta.description,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: WEDDING_CONFIG.meta.ogImage,
        width: 1280,
        height: 1600,
        alt: WEDDING_CONFIG.meta.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: WEDDING_CONFIG.meta.title,
    description: WEDDING_CONFIG.meta.description,
    images: [WEDDING_CONFIG.meta.ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${cormorant.variable} ${gowun.variable} ${notoSans.variable}`}
    >
      <body className="min-h-dvh bg-ivory text-ink antialiased selection:bg-sage/20 selection:text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
