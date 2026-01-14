import type { Metadata } from "next";
import Script from "next/script";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "imgPrompter11 - AI Image Style Extractor",
  description: "Extract AI-ready style prompts from any image. Bring your own Replicate API key.",
  openGraph: {
    title: "imgPrompter11 - AI Image Style Extractor",
    description: "Turn any image into an AI style prompt using Claude 4.5 Sonnet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
