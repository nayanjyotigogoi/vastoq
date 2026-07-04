'use client'

import { useState } from 'react'
import TopNav from '@/components/nav/TopNav'
import Footer from '@/components/nav/Footer'
import MobileNav from '@/components/nav/MobileNav'
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const SUBJECT_TYPES = [
  { value: 'general',   label: 'General Enquiry' },
  { value: 'listing',   label: 'Listing / Property Issue' },
  { value: 'worker',    label: 'Worker Profile Issue' },
  { value: 'payment',   label: 'Payment / Refund' },
  { value: 'grievance', label: 'Grievance / Complaint' },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', type: 'general', message: '',
  })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error,   setError]     = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Something went wrong')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        <div className="mb-10">
          <h1 className="text-[32px] font-extrabold text-[#1A1814] mb-2">Contact & Support</h1>
          <p className="text-[15px] text-[#4A4640]">
            We typically respond within 24 hours. For urgent matters, email us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info column */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E0D5] rounded-[16px] p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-[#1A1814] mb-4">Vastoq Support</h2>
              <div className="space-y-3 text-[14px] text-[#4A4640]">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[#1B2B6B] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#1A1814]">Email</p>
                    <a href="mailto:support@tohfaah.online" className="text-[#1B2B6B] hover:underline">
                      support@tohfaah.online
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#1B2B6B] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#1A1814]">Address</p>
                    <p>Anvaya Solution<br />Dhemaji, Assam, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E0D5] rounded-[16px] p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-[#1A1814] mb-3">Grievance Officer</h2>
              <p className="text-[13px] text-[#4A4640] mb-2">
                Under IT Rules 2021, our designated Grievance Officer is:
              </p>
              <p className="text-[14px] font-semibold text-[#1A1814]">Nayanjyoti Gogoi</p>
              <a href="mailto:support@tohfaah.online" className="text-[13px] text-[#1B2B6B] hover:underline">
                support@tohfaah.online
              </a>
              <p className="text-[12px] text-[#8A8480] mt-2">
                Acknowledged within 24 hours · Resolved within 15 days
              </p>
            </div>

            <div className="bg-white border border-[#E5E0D5] rounded-[16px] p-6 shadow-sm">
              <h2 className="text-[14px] font-bold text-[#1A1814] mb-3">Other pages</h2>
              <div className="space-y-2 text-[13px]">
                {[
                  { href: '/terms',         label: 'Terms & Conditions' },
                  { href: '/privacy',       label: 'Privacy Policy' },
                  { href: '/refund-policy', label: 'Refund & Cancellation' },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="block text-[#1B2B6B] hover:underline">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E5E0D5] rounded-[16px] p-8 shadow-sm">

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle size={52} className="text-[#1D9E75] mb-4" />
                  <h2 className="text-[22px] font-bold text-[#1A1814] mb-2">Message sent!</h2>
                  <p className="text-[15px] text-[#4A4640] max-w-sm">
                    We've received your message and sent a confirmation to your email.
                    Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSuccess(false); setForm({ name:'', email:'', phone:'', subject:'', type:'general', message:'' }) }}
                    className="mt-6 px-5 py-2.5 bg-[#1B2B6B] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-[18px] font-bold text-[#1A1814] mb-1">Send us a message</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1A1814] mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text" required value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Ranjit Bora"
                        className="w-full px-3 py-2.5 border border-[#E5E0D5] rounded-[8px] text-[14px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1A1814] mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email" required value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 border border-[#E5E0D5] rounded-[8px] text-[14px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1A1814] mb-1.5">
                        Phone <span className="text-[#8A8480] font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel" value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-3 py-2.5 border border-[#E5E0D5] rounded-[8px] text-[14px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1A1814] mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required value={form.type}
                        onChange={e => set('type', e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#E5E0D5] rounded-[8px] text-[14px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 bg-white"
                      >
                        {SUBJECT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1A1814] mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" required value={form.subject}
                      onChange={e => set('subject', e.target.value)}
                      placeholder="Brief description of your issue"
                      className="w-full px-3 py-2.5 border border-[#E5E0D5] rounded-[8px] text-[14px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1A1814] mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required rows={5} value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="Please describe your issue in detail. Include any listing IDs, payment IDs, or relevant information."
                      className="w-full px-3 py-2.5 border border-[#E5E0D5] rounded-[8px] text-[14px] text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1B2B6B] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Sending…</>
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>

                  <p className="text-[12px] text-[#8A8480]">
                    By submitting this form you agree to our{' '}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>.
                    Your data is handled per DPDP Act 2023.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
