import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './katex-custom.css'

// Polyfill for Promise.withResolvers (Node.js 18 compatibility)
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function<T>() {
    let resolve: (value: T) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  } as typeof Promise.withResolvers;
}

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Claude - AI Assistant',
  description: 'AI Assistant for thoughtful conversations and professional tasks',
  keywords: ['AI trading', 'financial analytics', 'enterprise fintech', 'portfolio management', 'institutional trading'],
  authors: [{ name: 'Genie AI Enterprise' }],
  creator: 'Genie AI',
  publisher: 'Genie AI Enterprise',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://genie-ai.com',
    title: 'Genie AI - Enterprise Financial Intelligence',
    description: 'Advanced AI-powered financial analytics and trading platform for institutions',
    siteName: 'Genie AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Genie AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Genie AI - Enterprise Financial Intelligence',
    description: 'Advanced AI-powered financial analytics platform',
    creator: '@GenieAI',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 