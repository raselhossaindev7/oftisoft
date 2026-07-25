"use client";

import { useEffect } from "react";
import {
  getReferralCode,
  setReferralCodeInStorage,
  getReferralCodeFromStorage,
} from "@/lib/referral";

/**
 * Hook to automatically capture and persist referral code from cookie
 * Use this in the root layout or a provider component
 */
export function useReferralCapture() {
  useEffect(() => {
    // On mount, check if there's a referral cookie
    const cookieCode = getReferralCode();
    if (cookieCode) {
      // Save to localStorage for SPA navigation persistence
      setReferralCodeInStorage(cookieCode);
    }
  }, []);
}

/**
 * Hook to get the current referral code (from cookie or localStorage)
 */
export function useReferralCode(): string | null {
  const cookieCode = getReferralCode();
  if (cookieCode) return cookieCode;

  return getReferralCodeFromStorage();
}
