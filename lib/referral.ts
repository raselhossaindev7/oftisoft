/**
 * Referral cookie utilities
 * The referral code is set by the backend when a user visits /ref/:CODE
 */

export function getReferralCode(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'ref') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function setReferralCode(code: string) {
  if (typeof document === 'undefined') return;

  // Cookie is already set by backend, but this allows manual setting
  document.cookie = `ref=${encodeURIComponent(code)}; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax`;
}

export function clearReferralCode() {
  if (typeof document === 'undefined') return;

  document.cookie = 'ref=; max-age=0; path=/';
}

/**
 * Get referral code from localStorage as fallback
 * (for SPA navigation where cookie might not be available)
 */
export function getReferralCodeFromStorage(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('referral_code');
}

export function setReferralCodeInStorage(code: string) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('referral_code', code);
}

export function clearReferralCodeFromStorage() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('referral_code');
}
