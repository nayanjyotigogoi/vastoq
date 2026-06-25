'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, Eye, EyeOff, Loader2, Check } from 'lucide-react'

type Tab = 'login' | 'register'

const ROLES = [
  { id: 'tenant', label: 'Tenant',         desc: 'Looking for a rental or services',  emoji: '🏠' },
  { id: 'owner',  label: 'Property Owner', desc: 'I want to list my property',         emoji: '🏗' },
  { id: 'worker', label: 'Local Worker',   desc: 'I offer skilled services',           emoji: '🔧' },
]

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [tab,      setTab]      = useState<Tab>('login')
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPw,   setShowPw]   = useState(false)

  // Login fields
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPw,    setLoginPw]    = useState('')

  // Register fields
  const [regName,  setRegName]  = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPw,    setRegPw]    = useState('')
  const [regRole,  setRegRole]  = useState('')

  const resolveRedirect = (apiPath: string) => {
    const next = searchParams.get('next')
    return next && next.startsWith('/') ? next : apiPath
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setLoading(true)

    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: loginPhone, password: loginPw }),
      })
      const json = await res.json()

      if (!res.ok) {
        setApiError(json.error?.message ?? 'Login failed')
        return
      }

      router.push(resolveRedirect(json.data.redirect_to ?? '/dashboard'))
    } catch {
      setApiError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regRole) { setApiError('Please select your role.'); return }
    setApiError(null)
    setLoading(true)

    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name:     regName,
          phone:    regPhone,
          password: regPw,
          role:     regRole,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setApiError(json.error?.message ?? 'Registration failed')
        return
      }

      router.push(resolveRedirect(json.data.redirect_to ?? '/dashboard'))
    } catch {
      setApiError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
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
          {/* Tabs */}
          <div className="flex border-b border-[#E5E0D5]">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setApiError(null) }}
                className={`flex-1 py-3.5 text-[13px] font-bold capitalize transition-colors ${
                  tab === t
                    ? 'text-[#1B2B6B] border-b-2 border-[#1B2B6B]'
                    : 'text-[#8A8480] hover:text-[#1A1814]'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <div className="p-7">
            {/* ── LOGIN ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1A1814] mb-1.5">
                    Mobile number
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-3 border border-[#E5E0D5] rounded-[10px] focus-within:ring-2 focus-within:ring-[#1B2B6B]/30 focus-within:border-[#1B2B6B] transition-all">
                    <span className="text-[14px] font-semibold text-[#4A4640] flex-shrink-0">+91</span>
                    <div className="w-px h-4 bg-[#E5E0D5] flex-shrink-0" />
                    <Phone size={15} className="text-[#8A8480] flex-shrink-0" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1A1814] mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-3 border border-[#E5E0D5] rounded-[10px] focus-within:ring-2 focus-within:ring-[#1B2B6B]/30 focus-within:border-[#1B2B6B] transition-all">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Your password"
                      value={loginPw}
                      onChange={(e) => setLoginPw(e.target.value)}
                      className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="text-[#8A8480] hover:text-[#1A1814] transition-colors flex-shrink-0"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {apiError && (
                  <p className="text-[12px] text-red-600">{apiError}</p>
                )}

                <button
                  type="submit"
                  disabled={loginPhone.length < 10 || loginPw.length < 6 || loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60 min-h-[52px]"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign in'}
                </button>

                <p className="text-center text-[12px] text-[#8A8480]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setApiError(null) }}
                    className="text-[#1B2B6B] font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1A1814] mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#E5E0D5] rounded-[10px] text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-[#1B2B6B] transition-all"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1A1814] mb-1.5">
                    Mobile number
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-3 border border-[#E5E0D5] rounded-[10px] focus-within:ring-2 focus-within:ring-[#1B2B6B]/30 focus-within:border-[#1B2B6B] transition-all">
                    <span className="text-[14px] font-semibold text-[#4A4640] flex-shrink-0">+91</span>
                    <div className="w-px h-4 bg-[#E5E0D5] flex-shrink-0" />
                    <Phone size={15} className="text-[#8A8480] flex-shrink-0" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1A1814] mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-3 border border-[#E5E0D5] rounded-[10px] focus-within:ring-2 focus-within:ring-[#1B2B6B]/30 focus-within:border-[#1B2B6B] transition-all">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={regPw}
                      onChange={(e) => setRegPw(e.target.value)}
                      className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="text-[#8A8480] hover:text-[#1A1814] transition-colors flex-shrink-0"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role selector */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#1A1814] mb-2">
                    I am a…
                  </label>
                  <div className="space-y-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRegRole(r.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border-2 transition-all text-left ${
                          regRole === r.id
                            ? 'border-[#1B2B6B] bg-[#E8ECF8]'
                            : 'border-[#E5E0D5] hover:border-[#D0C9BC]'
                        }`}
                      >
                        <span className="text-[20px] leading-none" aria-hidden="true">{r.emoji}</span>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-[#1A1814]">{r.label}</p>
                          <p className="text-[11px] text-[#8A8480]">{r.desc}</p>
                        </div>
                        {regRole === r.id && (
                          <div className="w-5 h-5 rounded-full bg-[#1B2B6B] flex items-center justify-center flex-shrink-0">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {apiError && (
                  <p className="text-[12px] text-red-600">{apiError}</p>
                )}

                <button
                  type="submit"
                  disabled={!regName || regPhone.length < 10 || regPw.length < 6 || !regRole || loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60 min-h-[52px]"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create account'}
                </button>

                <p className="text-center text-[12px] text-[#8A8480]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setApiError(null) }}
                    className="text-[#1B2B6B] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            <p className="text-[11px] text-[#8A8480] text-center mt-5">
              By continuing you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[#1B2B6B]">Terms</Link>
              {' & '}
              <Link href="/privacy" className="underline hover:text-[#1B2B6B]">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
