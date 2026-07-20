'use client'

import { useState } from 'react'
import { X, AlertTriangle, CheckCircle2, Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const REASONS = [
  {
    value: 'already_rented',
    label: 'Property is already rented out / Worker is unavailable',
  },
  {
    value: 'invalid_details',
    label: 'Number is switched off / Invalid contact details',
  },
  {
    value: 'extra_brokerage',
    label: 'Owner / Worker demanded extra brokerage or unreasonable charges',
  },
  {
    value: 'other',
    label: 'Other (please describe below)',
  },
] as const

type Reason = (typeof REASONS)[number]['value']

interface ReportIssueModalProps {
  /** 'listing' or 'worker' */
  type: 'listing' | 'worker'
  /** ID of the listing or worker */
  targetId: number
  /** Display name for the subject */
  subjectName: string
  onClose: () => void
}

export default function ReportIssueModal({
  type,
  targetId,
  subjectName,
  onClose,
}: ReportIssueModalProps) {
  const { user } = useCurrentUser()

  const [reason, setReason]                   = useState<Reason | ''>('')
  const [elaboratedReason, setElaboratedReason] = useState('')
  const [phone, setPhone]                     = useState(user?.phone ?? '')
  const [submitting, setSubmitting]           = useState(false)
  const [submitted, setSubmitted]             = useState(false)

  const isPhoneMissing = !user?.phone

  const handleSubmit = async () => {
    if (!reason) { toast.error('Please select a reason.'); return }
    if (reason === 'other' && !elaboratedReason.trim()) {
      toast.error('Please describe the issue in the text box below.')
      return
    }
    if (isPhoneMissing && (!phone.trim() || !/^\d{10}$/.test(phone.trim()))) {
      toast.error('Please enter a valid 10-digit mobile number so we can contact you.')
      return
    }
    if (!user?.userId) { toast.error('Please log in first.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact-reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:           user.userId,
          phone:             phone.trim() || undefined,
          reportable_type:   type,
          reportable_id:     targetId,
          reason,
          elaborated_reason: elaboratedReason.trim() || null,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setSubmitted(true)
      } else {
        const errMsg = json.message ?? json.error?.message ?? 'Could not submit report. Please try again.'
        toast.error(errMsg)
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-[440px] bg-white rounded-[20px] shadow-2xl overflow-hidden"
        style={{ animation: 'slide-up 0.22s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-[#D84040]" />
            <h2 className="text-[15px] font-bold text-[#1A1814]">Report an Issue with this Contact</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F0E8] transition-colors"
            aria-label="Close"
          >
            <X size={15} className="text-[#8A8480]" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E8F9F2] flex items-center justify-center">
              <CheckCircle2 size={30} className="text-[#1D9E75]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1A1814] mb-1">Report Submitted!</p>
              <p className="text-[13px] text-[#4A4640] leading-relaxed max-w-[300px] mx-auto">
                Our team will review it within 24–48 hours. You'll receive an email update on the outcome.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-[#1B2B6B] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <div className="px-6 py-5 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Subject */}
            <p className="text-[12px] text-[#8A8480]">
              Reporting issue for: <span className="font-semibold text-[#1A1814]">{subjectName}</span>
            </p>

            {/* Callback Phone number field if user profile doesn't have phone */}
            {isPhoneMissing && (
              <div>
                <label className="block text-[11px] font-bold text-[#4A4640] uppercase tracking-wide mb-1.5">
                  Your Callback Phone Number <span className="text-[#D84040]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-[#F5F0E8] border border-[#E5E0D5] rounded-[10px] text-[13px] font-bold text-[#4A4640] flex items-center gap-1">
                    <Phone size={13} className="text-[#1B2B6B]" /> +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-3 py-2 border border-[#E5E0D5] rounded-[10px] text-[13px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/20"
                  />
                </div>
                <p className="text-[10px] text-[#8A8480] mt-1">
                  Required so our support team can reach out to you if needed.
                </p>
              </div>
            )}

            {/* Reason radio options */}
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-[#4A4640] uppercase tracking-wide">Select a reason</p>
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3.5 rounded-[12px] border cursor-pointer transition-all ${
                    reason === r.value
                      ? 'border-[#D84040] bg-[#FFF4F4]'
                      : 'border-[#E5E0D5] hover:border-[#1B2B6B]/30 hover:bg-[#F5F0E8]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5 accent-[#D84040] w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-[13px] text-[#1A1814] leading-snug">{r.label}</span>
                </label>
              ))}
            </div>

            {/* "Other" required text input — shown only when 'other' is selected */}
            {reason === 'other' && (
              <div>
                <label className="block text-[11px] font-bold text-[#D84040] uppercase tracking-wide mb-1.5">
                  Describe the issue <span className="normal-case font-normal text-[#8A8480]">(required)</span>
                </label>
                <textarea
                  value={elaboratedReason}
                  onChange={(e) => setElaboratedReason(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2.5 border border-[#D84040]/50 rounded-[10px] text-[13px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#D84040]/30 resize-none"
                />
                <p className="text-[10px] text-[#8A8480] mt-1 text-right">{elaboratedReason.length}/1000</p>
              </div>
            )}

            {/* Additional details — always visible, optional */}
            <div>
              <label className="block text-[11px] font-bold text-[#4A4640] uppercase tracking-wide mb-1.5">
                Additional details <span className="normal-case font-normal text-[#8A8480]">(optional)</span>
              </label>
              <textarea
                value={reason === 'other' ? '' : elaboratedReason}
                onChange={(e) => {
                  if (reason !== 'other') setElaboratedReason(e.target.value)
                }}
                disabled={reason === 'other'}
                placeholder={
                  reason === 'other'
                    ? 'Use the box above to describe your issue'
                    : 'Any additional context that may help us investigate...'
                }
                rows={3}
                maxLength={1000}
                className={`w-full px-3 py-2.5 border border-[#E5E0D5] rounded-[10px] text-[13px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/20 resize-none ${
                  reason === 'other' ? 'opacity-40 cursor-not-allowed bg-[#F5F0E8]' : ''
                }`}
              />
              {reason !== 'other' && (
                <p className="text-[10px] text-[#8A8480] mt-1 text-right">{elaboratedReason.length}/1000</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1 pb-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-[#E5E0D5] text-[#4A4640] text-[13px] font-semibold rounded-[10px] hover:border-[#1B2B6B] hover:text-[#1B2B6B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="flex-1 py-2.5 bg-[#D84040] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#c03030] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                ) : (
                  <>⚠️ Submit Report</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
