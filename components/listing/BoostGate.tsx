'use client'

import { useState } from 'react'
import { Zap, X, Loader2, AlertCircle, Check } from 'lucide-react'
import { loadRazorpay } from '@/lib/razorpay'
import { usePrices } from '@/hooks/usePrices'

interface BoostGateProps {
  listingId: string | number
  listingTitle: string
  onClose?: () => void
  onSuccess?: (data?: { featured_until?: string }) => void
}

type PaymentState = 'idle' | 'creating_order' | 'processing' | 'completed'

export default function BoostGate({ listingId, listingTitle, onClose, onSuccess }: BoostGateProps) {
  const prices = usePrices()
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handlePayment = async () => {
    setPaymentState('creating_order')
    setPaymentError(null)

    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKey) {
        setPaymentError('Payment gateway not configured. Please contact support.')
        setPaymentState('idle')
        return
      }

      const orderRes = await fetch(`/api/listings/${listingId}/create-boost-order`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const orderJson = await orderRes.json()

      if (!orderRes.ok) {
        setPaymentError(orderJson.error?.message ?? orderJson.message ?? 'Failed to create boost order')
        setPaymentState('idle')
        return
      }

      const razorpayLoaded = await loadRazorpay()
      if (!razorpayLoaded || !(window as any).Razorpay) {
        setPaymentError('Failed to load payment gateway. Please try again.')
        setPaymentState('idle')
        return
      }

      setPaymentState('processing')

      const options = {
        key: razorpayKey,
        order_id: orderJson.order_id,
        amount: orderJson.amount,
        currency: orderJson.currency,
        name: 'Vastoq',
        description: `Boost listing — ${listingTitle}`,
        prefill: { email: orderJson.contact },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`/api/listings/${listingId}/verify-boost-payment`, {
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
              setPaymentError(verifyJson.error?.message ?? verifyJson.message ?? 'Payment verification failed')
              setPaymentState('idle')
              return
            }

            setPaymentState('completed')
            onSuccess?.(verifyJson.data)
            setTimeout(() => onClose?.(), 1200)
          } catch {
            setPaymentError('Network error during verification')
            setPaymentState('idle')
          }
        },
        modal: { ondismiss: () => setPaymentState('idle') },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch {
      setPaymentError('Failed to initialize payment. Please try again.')
      setPaymentState('idle')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Boost listing"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="bg-white w-full sm:max-w-sm rounded-t-[20px] sm:rounded-[18px] overflow-hidden shadow-vastoq-lg">

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F0E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEF3DC] flex items-center justify-center flex-shrink-0">
              <Zap size={17} className="text-[#E8A020]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1A1814]">Boost this listing</h2>
              <p className="text-[12px] text-[#8A8480] truncate max-w-[220px]">{listingTitle}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5F0E8] transition-colors" aria-label="Close">
              <X size={18} className="text-[#4A4640]" />
            </button>
          )}
        </div>

        <div className="px-5 py-4">
          <div className="bg-[#FEF3DC] rounded-[12px] p-4 mb-4">
            <p className="text-[13px] font-semibold text-[#1A1814] mb-1">
              Featured for {prices.listing_boost_duration_days} days
            </p>
            <p className="text-[12px] text-[#4A4640] leading-relaxed">
              Boosted listings appear at the top of search results and in the homepage's
              Featured Rentals section — 3x more visibility on average.
            </p>
          </div>

          {paymentState === 'completed' ? (
            <div className="flex items-center gap-2 text-[#1D9E75] text-[14px] font-semibold py-3 justify-center">
              <Check size={18} /> Listing boosted!
            </div>
          ) : (
            <>
              {paymentError && (
                <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-[8px]">
                  <AlertCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-red-600">{paymentError}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={paymentState !== 'idle'}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-[15px] font-bold bg-[#E8A020] text-white hover:bg-[#d48f10] transition-colors disabled:opacity-60 min-h-[52px]"
              >
                {paymentState === 'creating_order' || paymentState === 'processing' ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing…</>
                ) : (
                  <>Boost for ₹{prices.listing_boost}</>
                )}
              </button>
            </>
          )}

          <p className="text-[11px] text-[#8A8480] text-center mt-3">
            Secure payment via Razorpay
          </p>
        </div>
      </div>
    </div>
  )
}
