import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider'
import PageContent from '@/components/layout/PageContent'
import Navbar from '@/components/layout/Navbar'
import CanvasGate from '@/components/canvas/CanvasGate'
import IntroSequence from '@/components/canvas/intro/IntroSequence'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    template: "%s | HK's Galaxy",
    default: "HK's Galaxy — Cinematic Developer Portfolio",
  },
  description:
    'A cinematic, WebGL-powered developer portfolio. Enter the system — explore projects, technical depth, and contact through a persistent solar-system universe.',
  keywords: ['developer portfolio', 'WebGL', 'Three.js', 'React', 'Next.js', 'GLSL', 'creative dev'],
  authors: [{ name: 'HK' }],
  creator: 'HK',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: "HK's Galaxy",
  },
  twitter: { card: 'summary_large_image' },
  robots:  { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#030712',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
//
// Layer stack (back → front):
//   z-0   Persistent WebGL canvas (CanvasGate)
//   z-10  Page content (sections) — gated by PageContent
//   z-40  Cinematic intro overlay (IntroSequence) — only during intro
//   z-50  Navigation (Navbar) — gated by intro completion
//
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh overflow-hidden bg-space-950 text-slate-100 antialiased">
        {/* Persistent universe — never remounted */}
        <CanvasGate />

        {/* Cinematic intro overlay — auto-hides when intro completes */}
        <IntroSequence />

        <SmoothScrollProvider>
          <Navbar />

          {/* Single-screen spatial UI — no scrolling sections */}
          <PageContent />

          {/* The page slot still exists for future overlays / portals */}
          <main role="main" className="hidden">
            {children}
          </main>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
