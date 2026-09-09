import type { Metadata, Viewport } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hangout Switch — Party & Couples Conversation Game",
  description:
    "A conversation-first party game for friends and couples. Pick a mode, set the intensity, and let the games begin.",
  applicationName: "Hangout Switch",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hangout Switch",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf2f8" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${jakarta.variable} font-body antialiased`}
      >
        {children}
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
