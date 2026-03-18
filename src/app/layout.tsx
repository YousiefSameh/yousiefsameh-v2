import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: {
    default: "Yousief Sameh | Full-Stack Developer",
    template: "%s | Yousief Sameh",
  },
  description:
    "Building high-quality web experiences with modern technologies. A young, ambitious engineer turning complex problems into elegant solutions.",
  keywords: ["Full-Stack Developer", "React", "Next.js", "TypeScript", "Web Development", "SaaS", "Frontend Engineer"],
  authors: [{ name: "Yousief Sameh" }],
  creator: "Yousief Sameh",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Yousief Sameh",
    title: "Yousief Sameh | Full-Stack Developer",
    description: "Building high-quality web experiences with modern technologies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yousief Sameh | Full-Stack Developer",
    description: "Building high-quality web experiences with modern technologies.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
