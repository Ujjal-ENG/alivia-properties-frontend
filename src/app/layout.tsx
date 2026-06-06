import { auth } from "@/auth";
import { defaultMetadata } from "@/config/seo.config";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Cinzel, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
