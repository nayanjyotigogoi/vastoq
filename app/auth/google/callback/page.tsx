"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check } from "lucide-react";

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
  const [submitting, setSubmitting] = useState(false);

  const exchangeToken = (token: string, role?: string) => {
    fetch("/api/auth/google/session", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify({ token, role }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          router.replace(json.data.redirect_to ?? "/dashboard");
        } else {
          setErrorMsg(json.error?.message ?? "Sign-in failed. Please try again.");
          setTimeout(() => router.replace("/login"), 3000);
        }
      })
      .catch(() => {
        setErrorMsg("Network error. Please try again.");
        setTimeout(() => router.replace("/login"), 3000);
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
      return;
    }

    // Exchange the Sanctum token directly for standard returning users
    exchangeToken(token);
  }, [router, searchParams]);

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSubmitting(true);

    const token = searchParams.get("token");
    if (!token) {
      setErrorMsg("Authentication token missing.");
      return;
    }

    exchangeToken(token, selectedRole);
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
                      onClick={() => setSelectedRole(r.id)}
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
              </div>

              <button
                type="submit"
                disabled={!selectedRole || submitting}
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
