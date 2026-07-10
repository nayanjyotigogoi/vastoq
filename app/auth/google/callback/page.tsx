"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check, Phone } from "lucide-react";

const ROLES = [
  { id: 'tenant', label: 'Tenant',         desc: 'Looking for a rental or services',  emoji: '🏠' },
  { id: 'owner',  label: 'Property Owner', desc: 'I want to list my property',         emoji: '🏗' },
  { id: 'worker', label: 'Local Worker',   desc: 'I offer skilled services',           emoji: '🔧' },
]

function GoogleCallbackContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const phoneRequired = selectedRole === 'owner' || selectedRole === 'worker';

  const exchangeToken = (token: string, role?: string, phone?: string) => {
    setFormError(null);
    fetch("/api/auth/google/session", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify({ token, role, phone }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          router.replace(json.data.redirect_to ?? "/dashboard");
        } else {
          setSubmitting(false);
          if (showRoleSelection) {
            setFormError(json.error?.message ?? "Sign-in failed. Please try again.");
          } else {
            setErrorMsg(json.error?.message ?? "Sign-in failed. Please try again.");
            setTimeout(() => router.replace("/login"), 3000);
          }
        }
      })
      .catch(() => {
        setSubmitting(false);
        if (showRoleSelection) {
          setFormError("Network error. Please try again.");
        } else {
          setErrorMsg("Network error. Please try again.");
          setTimeout(() => router.replace("/login"), 3000);
        }
      });
  };

  useEffect(() => {
    const token      = searchParams.get("token");
    const errorParam = searchParams.get("error");
    const isNew      = searchParams.get("is_new");

    if (errorParam === "blocked") {
      setErrorMsg("Your account has been blocked. Please contact support.");
      setTimeout(() => router.replace("/login"), 3000);
      return;
    }

    if (errorParam) {
      setErrorMsg("Google authentication failed. Please try again.");
      setTimeout(() => router.replace("/login"), 3000);
      return;
    }

    if (!token) {
      setErrorMsg("No token received. Please try again.");
      setTimeout(() => router.replace("/login"), 3000);
      return;
    }

    if (isNew === "1") {
      setShowRoleSelection(true);
      // Decodes token to preselect role
      try {
        const dotIndex = token.lastIndexOf(".");
        if (dotIndex !== -1) {
          const payloadB64 = token.slice(0, dotIndex);
          const decoded = JSON.parse(atob(payloadB64));
          if (decoded.role) {
            setSelectedRole(decoded.role);
          }
        }
      } catch (e) {
        console.error("Failed to decode token payload:", e);
      }
      return;
    }

    // Exchange the Sanctum token directly for standard returning users
    exchangeToken(token);
  }, [router, searchParams]);

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (phoneRequired && phone.length < 10) {
      setFormError("Please enter your 10-digit mobile number.");
      return;
    }
    setSubmitting(true);

    const token = searchParams.get("token");
    if (!token) {
      setErrorMsg("Authentication token missing.");
      return;
    }

    exchangeToken(token, selectedRole, phoneRequired ? phone : undefined);
  };

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF8] px-4">
        <div className="bg-white rounded-[20px] border border-[#E5E0D5] shadow-vastoq-md p-8 max-w-sm w-full text-center">
          <p className="text-red-600 font-semibold mb-2">Authentication Error</p>
          <p className="text-[#8A8480] text-sm mb-4">{errorMsg}</p>
          <p className="text-[#8A8480] text-xs">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (showRoleSelection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF8] px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10 justify-center">
            <span className="text-2xl font-extrabold tracking-tight text-[#1B2B6B]">
              Vastoq<span className="text-[#1D9E75]">.</span>
            </span>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E5E0D5] shadow-vastoq-md p-7">
            <h2 className="text-[18px] font-extrabold text-[#1B2B6B] mb-2 text-center">
              Welcome to Vastoq!
            </h2>
            <p className="text-[#8A8480] text-sm text-center mb-6">
              Please choose how you plan to use Vastoq to complete your registration.
            </p>

            <form onSubmit={handleRoleSubmit} className="space-y-6">
              <div>
                <label className="block text-[12px] font-semibold text-[#1A1814] mb-2">
                  I am a…
                </label>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setSelectedRole(r.id); setPhone(''); setFormError(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border-2 transition-all text-left ${
                        selectedRole === r.id
                          ? 'border-[#1B2B6B] bg-[#E8ECF8]'
                          : 'border-[#E5E0D5] hover:border-[#D0C9BC]'
                      }`}
                    >
                      <span className="text-[20px] leading-none" aria-hidden="true">{r.emoji}</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#1A1814]">{r.label}</p>
                        <p className="text-[11px] text-[#8A8480]">{r.desc}</p>
                      </div>
                      {selectedRole === r.id && (
                        <div className="w-5 h-5 rounded-full bg-[#1B2B6B] flex items-center justify-center flex-shrink-0">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Phone field — shown only for owner/worker */}
                {phoneRequired && (
                  <div className="mt-4 animate-[fadeIn_0.2s_ease]">
                    <label className="block text-[12px] font-semibold text-[#1A1814] mb-1.5">
                      Mobile number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-3 border border-[#E5E0D5] rounded-[10px] focus-within:ring-2 focus-within:ring-[#1B2B6B]/30 focus-within:border-[#1B2B6B] transition-all">
                      <span className="text-[14px] font-semibold text-[#4A4640] flex-shrink-0">+91</span>
                      <div className="w-px h-4 bg-[#E5E0D5] flex-shrink-0" />
                      <Phone size={15} className="text-[#8A8480] flex-shrink-0" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setFormError(null); }}
                        className="flex-1 bg-transparent text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none"
                        required={phoneRequired}
                        autoFocus
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#8A8480]">Required for listing and contacting tenants.</p>
                  </div>
                )}
              </div>

              {formError && (
                <p className="text-[12px] text-red-600 text-center">{formError}</p>
              )}

              <button
                type="submit"
                disabled={!selectedRole || (phoneRequired && phone.length < 10) || submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B2B6B] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-60 min-h-[52px]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Completing registration...
                  </>
                ) : (
                  'Complete registration'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF8]">
      <div className="flex flex-col items-center gap-5">
        {/* Vastoq wordmark */}
        <span className="text-2xl font-extrabold tracking-tight text-[#1B2B6B]">
          Vastoq<span className="text-[#1D9E75]">.</span>
        </span>

        <Loader2 className="w-8 h-8 text-[#1B2B6B] animate-spin" />

        <p className="text-[14px] text-[#8A8480]">
          Completing secure sign in…
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
          <Loader2 className="w-8 h-8 text-[#1B2B6B] animate-spin" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
