"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function GoogleCallbackContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token      = searchParams.get("token");
    const errorParam = searchParams.get("error");

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

    // Exchange the Sanctum token for a Vastoq session cookie
    fetch("/api/auth/google/session", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify({ token }),
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
  }, [router, searchParams]);

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
