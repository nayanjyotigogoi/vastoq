'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Lock, X, Check, Loader2, Tag, Phone, MapPin, CreditCard, AlertCircle, LogIn, UserPlus, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadRazorpay } from '@/lib/razorpay'
import { usePrices } from '@/hooks/usePrices'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import PointsInfoModal from '@/components/ui/PointsInfoModal'

interface UnlockGateProps {
  type: 'listing' | 'worker'
  targetId: string | number
  subjectName: string
  subjectLocality?: string
  onClose?: () => void
  onSuccess?: (data?: any) => void
}

type CouponState = 'idle' | 'checking' | 'valid' | 'invalid'
type PaymentState = 'idle' | 'creating_order' | 'processing' | 'completed'

// Points cost per unlock type
const POINTS_COST = { listing: 20, worker: 10 } as const

export default function UnlockGate({
  type,
  targetId,
  subjectName,
  subjectLocality,
  onClose,
  onSuccess,
}: UnlockGateProps) {
  const prices = usePrices()
  const unlockPrice = type === 'listing' ? prices.listing_unlock : prices.worker_unlock
  const { user, loading: authLoading, reload: reloadUser } = useCurrentUser()
  const pathname = usePathname()
  const pointsCost = POINTS_COST[type]

  const [coupon,       setCoupon]       = useState('')
  const [couponState,  setCouponState]  = useState<CouponState>('idle')
  const [couponMsg,    setCouponMsg]    = useState('')
  const [couponIsFree, setCouponIsFree] = useState(false)
  const [unlocking,    setUnlocking]    = useState(false)
  const [unlockError,  setUnlockError]  = useState<string | null>(null)
  
  // Payment states
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [showPaymentOption, setShowPaymentOption] = useState(false)

  // Package payment states
  const [pkgState, setPkgState] = useState<PaymentState>('idle')
  const [pkgError, setPkgError] = useState<string | null>(null)

  // ── Validate coupon against backend ──────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = coupon.trim()
    if (!code) return

    setCouponState('checking')
    setCouponMsg('')
    setUnlockError(null)

    try {
      const res  = await fetch('/api/coupons/validate', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ code }),
      })
      const json = await res.json()

      if (!res.ok) {
        setCouponState('invalid')
        setCouponMsg(json.error?.message ?? 'Invalid or expired coupon code.')
        setCouponIsFree(false)
      } else {
        setCouponState('valid')
        setCouponIsFree(json.data.is_free)
        setCouponMsg(
          json.data.is_free
            ? 'Free unlock applied!'
            : `Coupon applied — ${json.data.type === 'percent' ? `${json.data.value}% off` : `₹${json.data.value} off`}`
        )
      }
    } catch {
      setCouponState('invalid')
      setCouponMsg('Could not validate coupon. Please try again.')
    }
  }

  // ── Handle Razorpay Payment ──────────────────────────────────────────────────
  const handlePayment = async () => {
    setPaymentState('creating_order')
    setPaymentError(null)

    try {
      // Validate key is available
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKey) {
        setPaymentError('Payment gateway not configured. Please contact support.')
        setPaymentState('idle')
        return
      }

      // Step 1: Create order on backend
      const endpoint = 
        type === 'listing' 
          ? `/api/listings/${targetId}/create-unlock-order`
          : `/api/workers/${targetId}/create-unlock-order`

      const orderRes = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      const orderJson = await orderRes.json()

      if (!orderRes.ok) {
        setPaymentError(orderJson.message || 'Failed to create payment order')
        setPaymentState('idle')
        return
      }

      // Step 2: Load Razorpay
      const razorpayLoaded = await loadRazorpay()
      if (!razorpayLoaded) {
        setPaymentError('Failed to load payment gateway. Please try again.')
        setPaymentState('idle')
        return
      }

      // Verify Razorpay is available
      if (!(window as any).Razorpay) {
        setPaymentError('Payment gateway not available. Please refresh and try again.')
        setPaymentState('idle')
        return
      }

      setPaymentState('processing')

      // Step 3: Open Razorpay checkout
      const options = {
        key: razorpayKey,
        order_id: orderJson.order_id,
        amount: orderJson.amount,
        currency: orderJson.currency,
        name: 'Vastoq',
        description: `Unlock ${type === 'listing' ? 'listing' : 'worker'} details`,
        prefill: {
          email: orderJson.contact,
        },
        handler: async (response: any) => {
          // Step 4: Verify payment on backend
          const verifyEndpoint = 
            type === 'listing'
              ? `/api/listings/${targetId}/verify-unlock-payment`
              : `/api/workers/${targetId}/verify-unlock-payment`

          try {
            const verifyRes = await fetch(verifyEndpoint, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyJson = await verifyRes.json()

            if (!verifyRes.ok) {
              setPaymentError(verifyJson.message || 'Payment verification failed')
              setPaymentState('idle')
              return
            }

            setPaymentState('completed')
            reloadUser?.()
            onSuccess?.(verifyJson.data)
            setTimeout(() => onClose?.(), 1000)
          } catch (err) {
            setPaymentError('Network error during verification')
            setPaymentState('idle')
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentState('idle')
          },
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Payment initialization error:', err)
      setPaymentError('Failed to initialize payment. Please try again.')
      setPaymentState('idle')
    }
  }

  const handleBuyPackage = async () => {
    setPkgState('creating_order')
    setPkgError(null)

    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKey) {
        setPkgError('Payment gateway not configured. Please contact support.')
        setPkgState('idle')
        return
      }

      const orderRes = await fetch('/api/payments/unlock-package/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      const orderJson = await orderRes.json()

      if (!orderRes.ok) {
        setPkgError(orderJson.message || 'Failed to create package order')
        setPkgState('idle')
        return
      }

      const razorpayLoaded = await loadRazorpay()
      if (!razorpayLoaded) {
        setPkgError('Failed to load payment gateway. Please try again.')
        setPkgState('idle')
        return
      }

      setPkgState('processing')

      const options = {
        key: razorpayKey,
        order_id: orderJson.order_id,
        amount: orderJson.amount,
        currency: orderJson.currency,
        name: 'Vastoq',
        description: 'Vastoq Points Pack — 60 Points + Rental Agreement Guarantee',
        prefill: {
          email: orderJson.contact,
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/unlock-package/verify', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user?.userId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyJson = await verifyRes.json()

            if (!verifyRes.ok) {
              setPkgError(verifyJson.message || 'Verification failed')
              setPkgState('idle')
              return
            }

            setPkgState('completed')
            reloadUser?.()
            setTimeout(() => {
              setPkgState('idle')
            }, 1500)
          } catch (err) {
            setPkgError('Network error during verification')
            setPkgState('idle')
          }
        },
        modal: {
          ondismiss: () => {
            setPkgState('idle')
          },
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Package payment initialization error:', err)
      setPkgError('Failed to purchase package. Please try again.')
      setPkgState('idle')
    }
  }

  // ── Do the actual unlock ──────────────────────────────────────────────────────
  const handleUnlock = async () => {
    setUnlocking(true)
    setUnlockError(null)

    const endpoint =
      type === 'listing'
        ? `/api/listings/${targetId}/unlock`
        : `/api/workers/${targetId}/unlock`

    try {
      const res  = await fetch(endpoint, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          coupon_code: couponState === 'valid' ? coupon.trim() : undefined,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setUnlockError(json.error?.message ?? json.message ?? 'Unlock failed. Please try again.')
        return
      }

      reloadUser?.()
      onSuccess?.(json.data)
      onClose?.()
    } catch {
      setUnlockError('Network error. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  const freeUnlocks = user?.role === 'tenant' ? (user.free_unlocks_remaining ?? 0) : 0
  const hasCredits = user && (freeUnlocks > 0 || (user.vastoq_points ?? 0) >= pointsCost)
  const canUnlock = couponState === 'valid' || !!hasCredits

  // ── Auth-gated screen ───────────────────────────────────────────────────────
  const loginUrl = `/login?next=${encodeURIComponent(pathname)}`
  const registerUrl = `/login?tab=register&next=${encodeURIComponent(pathname)}`

  const AuthScreen = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in required"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-[20px] sm:rounded-[18px] overflow-y-auto overscroll-contain shadow-vastoq-lg max-h-[90dvh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F0E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8ECF8] flex items-center justify-center flex-shrink-0">
              <Lock size={17} className="text-[#1B2B6B]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1A1814]">Sign in to unlock</h2>
              <p className="text-[12px] text-[#8A8480] truncate max-w-[220px]">
                {subjectName}{subjectLocality ? ` · ${subjectLocality}` : ''}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#F5F0E8] transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-[#4A4640]" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-6">
          {/* What they'll get */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#F5F0E8] rounded-[10px]">
              <Phone size={14} className="text-[#1B2B6B] flex-shrink-0" />
              <span className="text-[12px] font-semibold text-[#1A1814]">
                {type === 'worker' ? "Worker's phone" : "Owner's phone"}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#F5F0E8] rounded-[10px]">
              <MapPin size={14} className="text-[#1B2B6B] flex-shrink-0" />
              <span className="text-[12px] font-semibold text-[#1A1814]">
                {type === 'worker' ? 'Service area' : 'Exact address'}
              </span>
            </div>
          </div>

          {/* Auth prompt */}
          <p className="text-[13px] text-[#4A4640] text-center mb-5 leading-relaxed">
            You need an account to view contact details and make payments.
            <br />
            <span className="text-[#8A8480]">It only takes a few seconds.</span>
          </p>

          <div className="flex flex-col gap-2.5">
            <a
              href={loginUrl}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[10px] bg-[#1B2B6B] text-white text-[15px] font-bold hover:bg-[#2D3E8C] transition-colors min-h-[52px]"
              id="unlock-signin-btn"
            >
              <LogIn size={16} />
              Sign in
            </a>
            <a
              href={registerUrl}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[10px] border border-[#1B2B6B] text-[#1B2B6B] text-[15px] font-bold hover:bg-[#E8ECF8] transition-colors min-h-[52px]"
              id="unlock-register-btn"
            >
              <UserPlus size={16} />
              Create account
            </a>
          </div>

          <p className="text-[11px] text-[#8A8480] text-center mt-3.5 leading-relaxed">
            Contact + location revealed instantly · No broker · Valid 30 days
          </p>
        </div>
      </div>
    </div>
  )

  // Show loading skeleton while session resolves
  if (authLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm overflow-hidden"
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      >
        <div className="bg-white w-full sm:max-w-md rounded-t-[20px] sm:rounded-[18px] p-8 flex items-center justify-center shadow-vastoq-lg">
          <Loader2 size={24} className="animate-spin text-[#1B2B6B]" />
        </div>
      </div>
    )
  }

  // Not logged in → show auth screen
  if (!user) return AuthScreen

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Unlock contact"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-[20px] sm:rounded-[18px] overflow-y-auto overscroll-contain shadow-vastoq-lg max-h-[90dvh] sm:max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F0E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8ECF8] flex items-center justify-center flex-shrink-0">
              <Lock size={17} className="text-[#1B2B6B]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1A1814]">Unlock contact & location</h2>
              <p className="text-[12px] text-[#8A8480] truncate max-w-[220px]">
                {subjectName}{subjectLocality ? ` · ${subjectLocality}` : ''}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#F5F0E8] transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-[#4A4640]" />
            </button>
          )}
        </div>

        {/* What you get */}
        <div className="px-5 pt-4 pb-3">
          <p className="text-[12px] text-[#8A8480] font-medium mb-2 uppercase tracking-wide">What you get</p>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#F5F0E8] rounded-[10px]">
              <Phone size={14} className="text-[#1B2B6B] flex-shrink-0" />
              <span className="text-[12px] font-semibold text-[#1A1814]">
                {type === 'worker' ? "Worker's phone" : "Owner's phone"}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#F5F0E8] rounded-[10px]">
              <MapPin size={14} className="text-[#1B2B6B] flex-shrink-0" />
              <span className="text-[12px] font-semibold text-[#1A1814]">
                {type === 'worker' ? 'Service area' : 'Exact address'}
              </span>
            </div>
          </div>
        </div>

        {/* Points / Credits Status */}
        {hasCredits && (
          <div className="mx-5 px-3.5 py-3 bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-[10px] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="text-[#179068]" />
                <span className="text-[13px] font-bold text-[#179068]">Your Vastoq Points</span>
                <PointsInfoModal />
              </div>
              <span className="text-[11px] font-bold text-[#1D9E75] uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full">
                Ready
              </span>
            </div>
            <div className="text-[12.5px] text-[#4A4640] font-medium flex flex-col gap-0.5">
              {user?.role === 'tenant' && (user?.free_unlocks_remaining ?? 0) > 0 && (
                <div>• Free unlocks: <span className="font-bold text-[#179068]">{user?.free_unlocks_remaining} left</span></div>
              )}
              {(user?.vastoq_points ?? 0) > 0 && (
                <div>• Vastoq Points: <span className="font-bold text-[#179068]">{user?.vastoq_points} pts</span> <span className="text-[#8A8480] font-normal">(costs {pointsCost} pts)</span></div>
              )}
            </div>
          </div>
        )}

        {/* Non-tenant notice — owners & workers cannot unlock listings */}
        {user && user.role !== 'tenant' && (
          <div className="mx-5 my-3 px-4 py-3.5 bg-[#FEF3DC] border border-[#E8A020]/30 rounded-[12px] flex gap-3">
            <AlertCircle size={16} className="text-[#E8A020] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-[#1A1814]">Unlocking is for tenants only</p>
              <p className="text-[12px] text-[#4A4640] mt-0.5 leading-snug">
                Only tenant accounts can unlock contact details. You're signed in as a <span className="font-semibold capitalize">{user.role}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Coupon section — tenants only */}
        {(!user || user.role === 'tenant') && (
        <div className="px-5 py-3">
          <p className="text-[12px] text-[#8A8480] font-medium mb-2 uppercase tracking-wide">Have a coupon?</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8480] pointer-events-none" />
              <input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value.toUpperCase())
                  setCouponState('idle')
                  setCouponMsg('')
                  setUnlockError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                maxLength={24}
                className={cn(
                  'w-full pl-9 pr-3 py-2.5 rounded-[8px] border text-[13px] font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 transition-colors',
                  couponState === 'valid'   && 'border-[#1D9E75] bg-[#E1F5EE]',
                  couponState === 'invalid' && 'border-[#D84040] bg-red-50',
                  (couponState === 'idle' || couponState === 'checking') && 'border-[#E5E0D5]'
                )}
                disabled={unlocking}
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={!coupon.trim() || couponState === 'checking' || unlocking}
              className="px-4 py-2.5 rounded-[8px] border border-[#1B2B6B] text-[13px] font-bold text-[#1B2B6B] hover:bg-[#E8ECF8] transition-colors disabled:opacity-50 min-w-[72px] flex items-center justify-center"
            >
              {couponState === 'checking'
                ? <Loader2 size={14} className="animate-spin" />
                : 'Apply'}
            </button>
          </div>

          {couponMsg && (
            <p className={cn(
              'text-[12px] flex items-center gap-1.5 mt-1.5',
              couponState === 'valid'   ? 'text-[#1D9E75]' : 'text-[#D84040]'
            )}>
              {couponState === 'valid' && <Check size={12} />}
              {couponMsg}
            </p>
          )}
        </div>
        )}

        {/* Payment Options — tenants only */}
        {user?.role === 'tenant' && (
        <div className="px-5 py-3 space-y-2.5">
          <p className="text-[11px] font-bold text-[#8A8480] uppercase tracking-wider">Payment options</p>

          {/* Option 1: Direct Cash */}
          <div className="rounded-[12px] border border-[#E5E0D5] p-3.5 flex items-center justify-between gap-3 bg-white">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CreditCard size={13} className="text-[#4A4640]" />
                <span className="text-[12.5px] font-bold text-[#1A1814]">Pay directly (one-time)</span>
              </div>
              <p className="text-[11px] text-[#8A8480] leading-tight">
                {type === 'listing' ? 'Unlock this property now' : 'Unlock this worker now'} · no wallet needed
              </p>
            </div>
            <button
              onClick={handlePayment}
              disabled={paymentState !== 'idle' || !!hasCredits}
              className="flex-shrink-0 px-3.5 py-2 rounded-[8px] bg-[#1A1814] hover:bg-[#333] disabled:opacity-50 text-white text-[13px] font-extrabold transition-colors flex items-center gap-1.5 min-h-[36px]"
            >
              {(paymentState === 'creating_order' || paymentState === 'processing') && <Loader2 size={12} className="animate-spin" />}
              {paymentState === 'completed' ? 'Done!' : type === 'listing' ? '₹25' : '₹15'}
            </button>
          </div>

          {/* Option 2: Vastoq Points Pack */}
          <div className="relative overflow-hidden rounded-[12px] border border-[#1B2B6B]/30 bg-gradient-to-br from-[#F0F4FF] via-[#FAFAF8] to-[#FFF9F2] p-3.5">
            <div className="absolute top-0 right-0 bg-[#1B2B6B] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl-[8px] tracking-wider">
              Better value
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Zap size={13} className="text-[#1B2B6B]" />
                  <span className="text-[12.5px] font-bold text-[#1B2B6B]">60 Vastoq Points</span>
                  <PointsInfoModal />
                </div>
                <p className="text-[11px] text-[#4A4640] leading-tight">
                  {type === 'listing'
                    ? '3 property unlocks (20 pts each) · ~₹19.6/unlock'
                    : '6 worker unlocks (10 pts each) · ~₹9.8/unlock'}
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                <span className="text-[15px] font-black text-[#1A1814]">₹59</span>
                <button
                  onClick={handleBuyPackage}
                  disabled={pkgState !== 'idle'}
                  className="px-3 py-1.5 bg-[#1B2B6B] hover:bg-[#2D3E8C] text-white text-[11px] font-extrabold rounded-[7px] transition-colors flex items-center gap-1 min-h-[30px]"
                >
                  {(pkgState === 'creating_order' || pkgState === 'processing') && <Loader2 size={10} className="animate-spin" />}
                  {pkgState === 'completed' ? '✓ Bought!' : 'Buy Pack'}
                </button>
              </div>
            </div>
            {pkgError && (
              <p className="text-[11px] text-red-600 mt-2 font-medium">{pkgError}</p>
            )}
          </div>
        </div>
        )}

        {/* Error */}
        {(unlockError || paymentError) && (
          <div className="mx-5 px-3 py-2.5 bg-red-50 border border-red-200 rounded-[8px] flex gap-2">
            <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-600">{unlockError || paymentError}</p>
          </div>
        )}

        {/* CTA — tenants only */}
        {(!user || user.role === 'tenant') && (
        <div className="px-5 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <button
            onClick={handleUnlock}
            disabled={!canUnlock || unlocking || paymentState !== 'idle'}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-[15px] font-bold transition-colors min-h-[52px]',
              canUnlock && paymentState === 'idle'
                ? 'bg-[#1D9E75] hover:bg-[#179068] text-white'
                : 'bg-[#1B2B6B]/20 text-[#8A8480] cursor-not-allowed'
            )}
          >
            {unlocking || paymentState === 'processing' ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : paymentState === 'completed' ? (
              <><Check size={16} /> Unlocked!</>
            ) : user?.role === 'tenant' && (user?.free_unlocks_remaining ?? 0) > 0 ? (
              <><Check size={16} /> Use Free Unlock</>
            ) : (user?.vastoq_points ?? 0) >= pointsCost ? (
              <><Zap size={16} /> Use {pointsCost} Points to Unlock</>
            ) : canUnlock ? (
              <><Check size={16} /> Unlock for free</>
            ) : (
              <><Lock size={16} /> Pay directly or buy points above</>
            )}
          </button>

          <p className="text-[11px] text-[#8A8480] text-center mt-2 leading-relaxed">
            Contact revealed instantly · No broker · Valid 30 days
          </p>
        </div>
        )}
      </div>
    </div>
  )
}
