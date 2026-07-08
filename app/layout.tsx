import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://myadkaro.online'

export const metadata: Metadata = {
  title: {
    default: 'Vastoq — Your home. Your city. Your people.',
    template: '%s | Vastoq',
  },
  description:
    'Verified rentals, trusted local workers, and everything you need to settle into Guwahati — all in one place. No broker fees.',
  keywords: 'rental, Guwahati, flat, PG, workers, electrician, plumber, Assam, furniture rental',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'Vastoq — Your home. Your city. Your people.',
    description: 'Find verified rentals and trusted local workers in Guwahati. No broker fees.',
    url: APP_URL,
    siteName: 'Vastoq',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Vastoq — Rentals & Local Workers in Guwahati',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vastoq — Your home. Your city. Your people.',
    description: 'Find verified rentals and trusted local workers in Guwahati.',
    images: ['/og-default.png'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#1B2B6B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
