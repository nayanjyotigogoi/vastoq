'use client'

import { useState } from 'react'
import { X, Zap, Home, Wrench, ShoppingBag, Info } from 'lucide-react'

interface PointsInfoModalProps {
  trigger?: 'icon' | 'button'
  className?: string
}

export function PointsInfoTrigger({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1B2B6B]/10 hover:bg-[#1B2B6B]/20 transition-colors flex-shrink-0 ${className ?? ''}`}
      aria-label="Learn about Vastoq Points"
      title="How Vastoq Points work"
    >
      <Info size={10} className="text-[#1B2B6B]" />
    </button>
  )
}

export default function PointsInfoModal({ trigger = 'icon', className }: PointsInfoModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {trigger === 'icon' ? (
        <PointsInfoTrigger onClick={() => setOpen(true)} className={className} />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`text-[11px] text-[#1B2B6B] underline underline-offset-2 hover:text-[#2D3E8C] transition-colors ${className ?? ''}`}
        >
          How does this work?
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Vastoq Points explained"
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-[22px] sm:rounded-[18px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F0E8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B2B6B] to-[#2D3E8C] flex items-center justify-center flex-shrink-0">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#1A1814]">Vastoq Points</h2>
                  <p className="text-[11px] text-[#8A8480]">Your unlock wallet</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F5F0E8] transition-colors"
                aria-label="Close"
              >
                <X size={17} className="text-[#4A4640]" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Buy */}
              <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#F0F4FF] to-[#FAFAF8] rounded-[12px] border border-[#1B2B6B]/10">
                <div className="w-8 h-8 rounded-full bg-[#1B2B6B] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShoppingBag size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1A1814]">₹99 → 100 Vastoq Points</p>
                  <p className="text-[11.5px] text-[#4A4640] mt-0.5 leading-relaxed">
                    Buy one pack and you get 100 points credited to your wallet instantly.
                  </p>
                </div>
              </div>

              {/* Spend */}
              <div>
                <p className="text-[11px] font-bold text-[#8A8480] uppercase tracking-wider mb-2">Spend your points on</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-[#F5F0E8] rounded-[10px]">
                    <div className="w-7 h-7 rounded-full bg-[#1D9E75]/15 flex items-center justify-center flex-shrink-0">
                      <Home size={13} className="text-[#1D9E75]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12.5px] font-bold text-[#1A1814]">Unlock Rental Listing</p>
                      <p className="text-[11px] text-[#4A4640]">Get owner's phone + exact address</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[13px] font-black text-[#1B2B6B]">20 pts</span>
                      <p className="text-[10px] text-[#8A8480]">5 listings / pack</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#F5F0E8] rounded-[10px]">
                    <div className="w-7 h-7 rounded-full bg-[#1B2B6B]/10 flex items-center justify-center flex-shrink-0">
                      <Wrench size={13} className="text-[#1B2B6B]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12.5px] font-bold text-[#1A1814]">Unlock Local Worker</p>
                      <p className="text-[11px] text-[#4A4640]">Get worker's phone + service areas</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[13px] font-black text-[#1B2B6B]">10 pts</span>
                      <p className="text-[10px] text-[#8A8480]">10 workers / pack</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <p className="text-[11px] text-[#8A8480] text-center leading-relaxed pb-1">
                Points never expire · Includes Rental Agreement Guarantee · No broker
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
