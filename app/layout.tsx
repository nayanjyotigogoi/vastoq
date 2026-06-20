import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'Vastoq — Your home. Your city. Your people.',
  description:
    'Verified rentals, trusted local workers, and everything you need to settle into Guwahati — all in one place. No broker fees.',
  keywords: 'rental, Guwahati, flat, PG, workers, electrician, plumber, Assam, furniture rental',
  openGraph: {
    title: 'Vastoq — Your home. Your city. Your people.',
    description: 'Find verified rentals and trusted local workers in Guwahati.',
    url: 'https://vastoq.in',
    siteName: 'Vastoq',
    locale: 'en_IN',
    type: 'website',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://vastoq.in'),
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
      </body>
    </html>
  )
}
