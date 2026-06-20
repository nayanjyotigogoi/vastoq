
'use client'

import { useState } from 'react'
import { Lock, X, Check, Loader2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnlockPlan {
  id: string
  label: string
  price: number
  description: string
  popular?: boolean
}

const RENTAL_PLANS: UnlockPlan[] = [
  { id: 'single', label: 'Single unlock', price: 20, description: '1 listing · valid 30 days' },
  { id: 'pack_5', label: 'Pack of 5', price: 80, description: '5 unlocks · valid 60 days', popular: true },
  { id: 'pack_15', label: 'Pack of 15', price: 199, description: '15 unlocks · valid 90 days' },
  { id: 'monthly', label: 'Monthly pass', price: 299, description: 'Unlimited unlocks · 30 days' },
]

const WORKER_PLANS: UnlockPlan[] = [
  { id: 'worker_single', label: 'Single worker', price: 20, description: '1 worker number · valid 30 days' },
  { id: 'worker_pack_7', label: 'Pack of 7', price: 100, description: '7 worker numbers · valid 60 days', popular: true },
  { id: 'worker_pack_10', label: 'Pack of 10', price: 150, description: '10 worker numbers · valid 90 days' },
]

interface UnlockGateProps {
  type: 'listing' | 'worker'
  targetId?: string | number
  subjectName: string
  subjectLocality?: string
  userId: number | string
  onClose?: () => void
  onSuccess?: (data?: any) => void
}

export default function UnlockGate({
  type,
  targetId,
  subjectName,
  subjectLocality,
  userId,
  onClose,
  onSuccess,
}: UnlockGateProps) {
  const [selectedPlan, setSelectedPlan] = useState(
    type === 'listing' ? 'single' : 'worker_single'
  )
  const [coupon, setCoupon] = useState('')
  const [couponStatus, setCouponStatus] = useState<
    'idle' | 'valid' | 'invalid'
  >('idle')
  const [loading, setLoading] = useState(false)

  const plans = type === 'listing' ? RENTAL_PLANS : WORKER_PLANS
  const selected = plans.find((p) => p.id === selectedPlan)!

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            code: coupon,
          }),
        }
      )

      await res.json()

      if (res.ok) {
        setCouponStatus('valid')
      } else {
        setCouponStatus('invalid')
      }
    } catch {
      setCouponStatus('invalid')
    }
  }

  const doUnlock = async () => {
    if (!targetId) return

    const endpoint =
      type === 'listing'
        ? `${process.env.NEXT_PUBLIC_API_URL}/listings/${targetId}/unlock`
        : `${process.env.NEXT_PUBLIC_API_URL}/workers/${targetId}/unlock`

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        coupon_code:
          couponStatus === 'valid'
            ? coupon
            : undefined,
      }),
    })

    const json = await res.json()

    if (res.ok) {
      onSuccess?.(json.data)
      onClose?.()
    } else {
      alert(json.message || 'Unlock failed')
    }
  }

  const handlePay = async () => {
    if (couponStatus === 'valid') {
      setLoading(true)

      try {
        await doUnlock()
      } finally {
        setLoading(false)
      }

      return
    }

    alert(
      'Online payments are coming soon. Please use a valid coupon code for now.'
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Unlock contact"
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-[20px] sm:rounded-[18px] overflow-hidden shadow-vastoq-lg">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F0E8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8ECF8] flex items-center justify-center">
              <Lock size={15} className="text-[#1B2B6B]" />
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#1A1814]">
                Unlock this contact
              </h2>

              <p className="text-[12px] text-[#8A8480]">
                {subjectName}
                {subjectLocality ? ` · ${subjectLocality}` : ''}
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

        <div className="px-5 py-4 space-y-4">
          <div className="space-y-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-[10px] border-2 transition-all text-left',
                  selectedPlan === plan.id
                    ? 'border-[#1B2B6B] bg-[#E8ECF8]'
                    : 'border-[#E5E0D5] hover:border-[#D0C9BC]'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      selectedPlan === plan.id
                        ? 'border-[#1B2B6B] bg-[#1B2B6B]'
                        : 'border-[#D0C9BC]'
                    )}
                  >
                    {selectedPlan === plan.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  <div>
                    <span className="text-[13px] font-semibold text-[#1A1814]">
                      {plan.label}
                    </span>

                    <span className="text-[11px] text-[#8A8480] ml-2">
                      {plan.description}
                    </span>
                  </div>

                  {plan.popular && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#E8A020] bg-[#FEF3DC] px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <span className="text-[15px] font-bold text-[#1B2B6B]">
                  ₹{plan.price}
                </span>
              </button>
            ))}
          </div>

          <div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8480]"
                />

                <input
                  type="text"
                  placeholder="Coupon code (optional)"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value.toUpperCase())
                    setCouponStatus('idle')
                  }}
                  maxLength={20}
                  className={cn(
                    'w-full pl-9 pr-3 py-2.5 rounded-[8px] border text-[13px] font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30',
                    couponStatus === 'valid' &&
                      'border-[#1D9E75] bg-[#E1F5EE]',
                    couponStatus === 'invalid' &&
                      'border-[#D84040] bg-red-50',
                    couponStatus === 'idle' && 'border-[#E5E0D5]'
                  )}
                />
              </div>

              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 rounded-[8px] border border-[#E5E0D5] text-[13px] font-semibold text-[#1B2B6B] hover:bg-[#E8ECF8] transition-colors min-w-[72px]"
              >
                Apply
              </button>
            </div>

            {couponStatus === 'valid' && (
              <p className="text-[12px] text-[#1D9E75] flex items-center gap-1 mt-1.5">
                <Check size={12} />
                Coupon applied — free unlock!
              </p>
            )}

            {couponStatus === 'invalid' && (
              <p className="text-[12px] text-[#D84040] mt-1.5">
                Invalid or expired coupon code.
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pb-6">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] bg-[#1B2B6B] text-white text-[15px] font-bold hover:bg-[#2D3E8C] transition-colors disabled:opacity-70 min-h-[52px]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : couponStatus === 'valid' ? (
              <>
                <Check size={16} />
                Unlock for free
              </>
            ) : (
              <>Pay ₹{selected.price} (Coming Soon)</>
            )}
          </button>

          <p className="text-[11px] text-[#8A8480] text-center mt-2.5">
            Coupon unlocks available · No broker involved · Direct contact
          </p>
        </div>
      </div>
    </div>
  )
}

