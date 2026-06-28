'use client'

import { useState, useEffect } from 'react'
import { Lock, X, Check, Loader2, Tag, Phone, MapPin, CreditCard, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadRazorpay } from '@/lib/razorpay'
import { usePrices } from '@/hooks/usePrices'

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

      onSuccess?.(json.data)
      onClose?.()
    } catch {
      setUnlockError('Network error. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  const canUnlock = couponState === 'valid'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Unlock contact"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-[20px] sm:rounded-[18px] overflow-hidden shadow-vastoq-lg">

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

        {/* Coupon section — primary path */}
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

        {/* Divider */}
        <div className="px-5 flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-[#F5F0E8]" />
          <span className="text-[11px] text-[#8A8480]">or</span>
          <div className="flex-1 h-px bg-[#F5F0E8]" />
        </div>

        {/* Pay option */}
        <div className="px-5 py-3">
          <button
            onClick={handlePayment}
            disabled={paymentState !== 'idle'}
            className="w-full flex items-center justify-between px-4 py-3 rounded-[10px] border border-[#E5E0D5] bg-gradient-to-r from-[#E8ECF8] to-[#FAFAF8] hover:border-[#1B2B6B]/30 hover:shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              {paymentState === 'idle' && <CreditCard size={15} className="text-[#1B2B6B]" />}
              {paymentState !== 'idle' && <Loader2 size={15} className="text-[#1B2B6B] animate-spin" />}
              <span className="text-[13px] font-semibold text-[#1A1814]">Pay ₹{unlockPrice} to unlock</span>
            </div>
            <span className="text-[12px] font-bold text-[#1D9E75]">
              {paymentState === 'completed' && '✓ Success'}
              {paymentState !== 'completed' && '→'}
            </span>
          </button>
        </div>

        {/* Error */}
        {(unlockError || paymentError) && (
          <div className="mx-5 px-3 py-2.5 bg-red-50 border border-red-200 rounded-[8px] flex gap-2">
            <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-600">{unlockError || paymentError}</p>
          </div>
        )}

        {/* CTA */}
        <div className="px-5 pb-6 pt-3">
          <button
            onClick={handleUnlock}
            disabled={!canUnlock || unlocking || paymentState !== 'idle'}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-[15px] font-bold transition-colors min-h-[52px]',
              canUnlock && paymentState === 'idle'
                ? 'bg-[#1D9E75] hover:bg-[#179068] text-white'
                : 'bg-[#1B2B6B] text-white opacity-40 cursor-not-allowed'
            )}
          >
            {unlocking || paymentState === 'processing' ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : paymentState === 'completed' ? (
              <><Check size={16} /> Unlocked!</>
            ) : canUnlock ? (
              <><Check size={16} /> Unlock for free</>
            ) : (
              <><Lock size={16} /> Apply a coupon or pay to unlock</>
            )}
          </button>

          <p className="text-[11px] text-[#8A8480] text-center mt-2.5 leading-relaxed">
            Contact + location revealed instantly · No broker · Valid 30 days
          </p>
        </div>
      </div>
    </div>
  )
}
