import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1B2B6B] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="text-2xl font-extrabold mb-2">
              Vastoq<span className="text-[#1D9E75]">.</span>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed mb-4">
              Your home. Your city. Your people. Guwahati&apos;s trusted living platform.
            </p>
            <div className="flex items-center gap-1 text-[12px] text-white/40">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75] inline-block" />
              Now live in Guwahati, Assam
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/rentals', label: 'Rentals' },
                { href: '/workers', label: 'Local Workers' },
                { href: '/furniture', label: 'Furniture Rental' },
                { href: '/owner/listings/new', label: 'List Property' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/about', label: 'About' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4">Contact</h4>
            <ul className="space-y-2.5 text-[13px] text-white/70">
              <li>hello@vastoq.in</li>
              <li>Guwahati, Assam 781001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/40">
            &copy; {new Date().getFullYear()} Vastoq. All rights reserved. vastoq.in — Guwahati&apos;s trusted living platform.
          </p>
          <div className="flex gap-4 text-[12px] text-white/40">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
