'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, ChevronLeft, Loader2, ShieldCheck, Check } from 'lucide-react'

type Step = 'phone' | 'otp' | 'role' | 'success'

const ROLES = [
  { id: 'tenant', label: 'Tenant', desc: 'Looking for a rental or services', emoji: '🏠' },
  { id: 'owner', label: 'Property Owner', desc: 'I want to list my property', emoji: '🏗' },
  { id: 'worker', label: 'Local Worker', desc: 'I offer skilled services', emoji: '🔧' },
]

export default function LoginPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown for resend OTP
  useEffect(() => {
    if (step === 'otp' && resendCountdown === 0) setResendCountdown(30)
  }, [step])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [redirectPath, setRedirectPath] = useState('/dashboard')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (phone.length < 10) return

    setLoading(true)
    setApiError(null)

    try {
      const res = await fetch(
        '/api/auth/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        setApiError(
          json.error?.message ??
          'Failed to send OTP'
        )
        return
      }

      if (json.data?.devOtp) {
        setDevOtp(json.data.devOtp)
      }

      setStep('otp')

    } catch {
      setApiError(
        'Network error. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (
    e: React.FormEvent
    ) => {

    e.preventDefault()

    const code = otp.join('')

    if (code.length < 6) return

    setLoading(true)
    setApiError(null)

    try {

      const res = await fetch(
        '/api/auth/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone,
            otp: code,
          }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        setApiError(
          json.error?.message ??
          'Invalid OTP'
        )
        return
      }

      setUserId(
        json.data?.user?.id ?? null
      )

      if (json.data?.isNew) {

        setStep('role')

      } else {

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: String(json.data.user.id),
          phone: json.data.user.phone,
          role: json.data.user.role,
        }),
      })

      setRole(
        json.data.user.role
      )

      setRedirectPath(
        json.data.redirect_to ??
        '/dashboard'
      )

      setStep('success')
    }

    } catch {

      setApiError(
        'Network error. Please try again.'
      )

    } finally {

      setLoading(false)

    }
  }

  const handleRoleSelect = async () => {

    if (!role || !userId) return

    setLoading(true)
    setApiError(null)

    try {

      const res = await fetch(
        '/api/auth/select-role',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            role,
          }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        setApiError(
          json.error?.message ??
          'Failed to save role'
        )
        return
      }

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: String(json.data.user.id),
          phone: json.data.user.phone,
          role: json.data.user.role,
        }),
      })

      setRedirectPath(
        json.data.redirect_to ??
        '/dashboard'
      )

      setStep('success')

    } catch {

      setApiError(
        'Network error. Please try again.'
      )

    } finally {

      setLoading(false)

    }
  }

  const handleDone = () => {
    router.push(redirectPath)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <span className="text-2xl font-extrabold tracking-tight text-[#1B2B6B]">
            Vastoq<span className="text-[#1D9E75]">.</span>
          </span>
        </Link>

        <div className="bg-white rounded-[20px] border border-[#E5E0D5] shadow-vastoq-md overflow-hidden">
          {/* Phone step */}
          {step === 'phone' && (
            <div className="p-7">
              <h1 className="text-[22px] font-bold text-[#1A1814] mb-1">Sign in or create account</h1>
              <p className="text-[13px] text-[#8A8480] mb-6 leading-relaxed">
                Enter your mobile number to continue. We will send you a 6-digit OTP.
              </p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-[12px] font-semibold text-[#1A1814] mb-1.5">
                    Mobile number
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-3 border border-[#E5E0D5] rounded-[10px] focus-within:ring-2 focus-within:ring-[#1B2B6B]/30 focus-within:border-[#1B2B6B] transition-all">
                    <span className="text-[14px] font-semibold text-[#4A4640] flex-shrink-0">+91</span>
                    <div className="w-px h-4 bg-[#E5E0D5] flex-shrink-0" />
                    <Phone size={15} className="text-[#8A8480] flex-shrink-0" />
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                {apiError && (
                  <p className="text-[12px] text-red-600">{apiError}</p>
                )}
                <button
                  type="submit"
                  disabled={phone.length < 10 || loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60 min-h-[52px]"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</> : 'Send OTP'}
                </button>
              </form>
              <p className="text-[11px] text-[#8A8480] text-center mt-4">
                By continuing you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#1B2B6B]">Terms</Link>
                {' & '}
                <Link href="/privacy" className="underline hover:text-[#1B2B6B]">Privacy Policy</Link>
              </p>
            </div>
          )}

          {/* OTP step */}
          {step === 'otp' && (
            <div className="p-7">
              <button
                onClick={() => setStep('phone')}
                className="flex items-center gap-1 text-[13px] text-[#4A4640] hover:text-[#1B2B6B] mb-5 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <h1 className="text-[22px] font-bold text-[#1A1814] mb-1">Enter OTP</h1>
              <p className="text-[13px] text-[#8A8480] mb-6">
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-[#1A1814]">+91 {phone}</span>
              </p>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-12 text-center text-[20px] font-bold border border-[#E5E0D5] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-[#1B2B6B] text-[#1A1814] transition-all"
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={otp.join('').length < 6 || loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60 min-h-[52px]"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify OTP'}
                </button>
                <div className="text-center text-[12px] text-[#8A8480]">
                  {resendCountdown > 0 ? (
                    <span>Resend OTP in {resendCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setResendCountdown(30) }}
                      className="text-[#1B2B6B] font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
              {/* Dev OTP hint */}
              {devOtp && (
                <p className="text-[11px] text-center mt-4 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                  Dev mode — your OTP is <span className="font-bold tracking-widest">{devOtp}</span>
                </p>
              )}
              {apiError && (
                <p className="text-[12px] text-center mt-2 text-red-600">{apiError}</p>
              )}
            </div>
          )}

          {/* Role selection step */}
          {step === 'role' && (
            <div className="p-7">
              <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
                <ShieldCheck size={22} className="text-[#1D9E75]" />
              </div>
              <h1 className="text-[22px] font-bold text-[#1A1814] mb-1">You are verified!</h1>
              <p className="text-[13px] text-[#8A8480] mb-6">
                One last step — tell us how you plan to use Vastoq.
              </p>
              <div className="space-y-2.5 mb-6">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[12px] border-2 transition-all text-left ${
                      role === r.id
                        ? 'border-[#1B2B6B] bg-[#E8ECF8]'
                        : 'border-[#E5E0D5] hover:border-[#D0C9BC]'
                    }`}
                  >
                    <span className="text-[22px] leading-none" aria-hidden="true">{r.emoji}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A1814]">{r.label}</p>
                      <p className="text-[12px] text-[#8A8480]">{r.desc}</p>
                    </div>
                    {role === r.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-[#1B2B6B] flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRoleSelect}
                disabled={!role || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60 min-h-[52px]"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Continue'}
              </button>
            </div>
          )}

          {/* Success step */}
          {step === 'success' && (
            <div className="p-7 text-center">
              <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-5">
                <Check size={36} className="text-[#1D9E75]" />
              </div>
              <h1 className="text-[22px] font-bold text-[#1A1814] mb-2">Welcome to Vastoq!</h1>
              <p className="text-[13px] text-[#4A4640] leading-relaxed mb-6">
                Your account is ready. Start exploring verified rentals and trusted workers in Guwahati.
              </p>
              <button
                onClick={handleDone}
                className="w-full py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors min-h-[52px]"
              >
                Go to my dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
