'use client'

import { useState } from 'react'
import { ShieldCheck, Upload, Loader2, AlertCircle, Clock, X } from 'lucide-react'

type Worker = {
  aadhaar_status: string
  aadhaar_front_url: string | null
  aadhaar_back_url: string | null
  aadhaar_submitted_at: string | null
  aadhaar_rejection_reason: string | null
  is_verified: boolean
}

interface Props {
  worker: Worker
  onSubmitted: (worker: Worker) => void
}

async function uploadSingle(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('photo', file)
  const res  = await fetch('/api/uploads/profile-photo', { method: 'POST', credentials: 'include', body: formData })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? 'Upload failed')
  return json.data.url
}

export default function AadhaarVerificationCard({ worker, onSubmitted }: Props) {
  const [showForm,  setShowForm]  = useState(false)
  const [aadhaarNo, setAadhaarNo] = useState('')
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile,  setBackFile]  = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async () => {
    setErr('')
    if (!frontFile || !backFile) { setErr('Please add both front and back photos of your Aadhaar card.'); return }
    if (aadhaarNo && !/^\d{12}$/.test(aadhaarNo)) { setErr('Aadhaar number must be exactly 12 digits.'); return }

    setSubmitting(true)
    try {
      const [frontUrl, backUrl] = await Promise.all([uploadSingle(frontFile), uploadSingle(backFile)])

      const res  = await fetch('/api/worker/aadhaar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: aadhaarNo || undefined, front_url: frontUrl, back_url: backUrl }),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json?.error?.message ?? 'Submission failed'); return }

      onSubmitted(json.data.worker)
      setShowForm(false)
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Verified ──────────────────────────────────────────────────────────────
  if (worker.is_verified) {
    return (
      <div className="rounded-[16px] border p-5 bg-[#E1F5EE] border-[#1D9E75]/20">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck size={22} className="text-[#1D9E75]" />
          <div>
            <p className="text-[14px] font-bold text-[#1A1814]">Aadhaar Verified</p>
            <p className="text-[11px] text-[#4A4640]">Your profile shows a verified badge</p>
          </div>
        </div>
        <p className="text-[12px] text-[#4A4640] leading-relaxed">
          Verified workers receive 4x more contact unlocks than unverified profiles.
        </p>
      </div>
    )
  }

  // ── Pending review ────────────────────────────────────────────────────────
  if (worker.aadhaar_status === 'pending') {
    return (
      <div className="rounded-[16px] border p-5 bg-[#FEF3DC] border-[#E8A020]/20">
        <div className="flex items-center gap-3 mb-3">
          <Clock size={22} className="text-[#E8A020]" />
          <div>
            <p className="text-[14px] font-bold text-[#1A1814]">Under review</p>
            <p className="text-[11px] text-[#4A4640]">
              {worker.aadhaar_submitted_at
                ? `Submitted ${new Date(worker.aadhaar_submitted_at).toLocaleDateString()}`
                : 'Submitted for review'}
            </p>
          </div>
        </div>
        <p className="text-[12px] text-[#4A4640] leading-relaxed">
          We typically review documents within 24-48 hours. We'll update your status here.
        </p>
      </div>
    )
  }

  // ── Unverified / rejected — submission form ──────────────────────────────
  return (
    <div className="rounded-[16px] border p-5 bg-[#FEF3DC] border-[#E8A020]/20">
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle size={22} className="text-[#E8A020]" />
        <div>
          <p className="text-[14px] font-bold text-[#1A1814]">
            {worker.aadhaar_status === 'rejected' ? 'Verification rejected' : 'Verification Pending'}
          </p>
          <p className="text-[11px] text-[#4A4640]">Status: {worker.aadhaar_status}</p>
        </div>
      </div>

      {worker.aadhaar_status === 'rejected' && worker.aadhaar_rejection_reason && (
        <p className="text-[12px] text-[#D84040] bg-red-50 border border-red-200 rounded-[8px] px-3 py-2 mb-3">
          {worker.aadhaar_rejection_reason}
        </p>
      )}

      <p className="text-[12px] text-[#4A4640] leading-relaxed mb-3">
        Complete Aadhaar verification to build trust with clients.
      </p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 bg-[#1B2B6B] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
        >
          {worker.aadhaar_status === 'rejected' ? 'Resubmit documents' : 'Submit for verification'}
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={aadhaarNo}
            onChange={(e) => setAadhaarNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Aadhaar number (optional)"
            className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
          />

          <FileSlot label="Front side" file={frontFile} onChange={setFrontFile} />
          <FileSlot label="Back side"  file={backFile}  onChange={setBackFile} />

          {err && <p className="text-[12px] text-red-600">{err}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setErr('') }}
              className="flex-1 py-2.5 border border-[#E5E0D5] text-[13px] font-semibold text-[#1B2B6B] rounded-[10px] hover:bg-[#E8ECF8]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1B2B6B] text-white text-[13px] font-bold rounded-[10px] hover:bg-[#2D3E8C] disabled:opacity-60"
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FileSlot({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-[#D0C9BC] rounded-[8px] cursor-pointer hover:border-[#1B2B6B] hover:bg-white transition-colors">
      <Upload size={14} className="text-[#1B2B6B] flex-shrink-0" />
      <span className="text-[12px] text-[#4A4640] flex-1 truncate">
        {file ? file.name : label}
      </span>
      {file && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onChange(null) }}
          aria-label={`Remove ${label}`}
        >
          <X size={13} className="text-[#8A8480]" />
        </button>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  )
}
