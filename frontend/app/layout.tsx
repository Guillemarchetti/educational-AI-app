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
  title: 'EduAI Hub - Centro de Recursos Educativos con IA',
  description: 'El centro de recursos educativos más avanzado, potenciado por inteligencia artificial para transformar la experiencia de aprendizaje',
  keywords: ['educación', 'inteligencia artificial', 'aprendizaje', 'recursos educativos', 'IA educativa', 'plataforma educativa'],
  authors: [{ name: 'EduAI Hub' }],
  creator: 'EduAI Hub',
  publisher: 'EduAI Hub',
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
    locale: 'es_ES',
    url: 'https://eduaihub.com',
    title: 'EduAI Hub - Centro de Recursos Educativos con IA',
    description: 'El centro de recursos educativos más avanzado, potenciado por inteligencia artificial para transformar la experiencia de aprendizaje',
    siteName: 'EduAI Hub',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EduAI Hub Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduAI Hub - Centro de Recursos Educativos con IA',
    description: 'El centro de recursos educativos más avanzado, potenciado por inteligencia artificial',
    creator: '@EduAIHub',
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
    <html lang="es" className={inter.variable}>
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