/**
 * Single-Source-of-Truth Application Mode Configuration
 * 
 * Enforces explicit boundaries between:
 * - 'demo': Explicit interactive sandbox (VITE_DEMO_MODE === 'true').
 *           All mutable reads/writes are stored locally in localStorage.
 *           Side-effects (Stripe, Twilio, Resend) are simulated and visually tagged.
 * - 'live': Real clinic deployment. Live Firebase Firestore, Auth, and Stripe.
 *           Missing credentials or initialization failures MUST produce an error,
 *           NEVER silently degrading or fabricating successful transactions.
 * - 'test': Unit and integration testing environment.
 */

import { isFirebaseConfigured } from './firebase';

export type AppMode = 'demo' | 'live' | 'test' | 'unconfigured';

export function getAppMode(): AppMode {
  // Test environment check
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'test';
  }

  // Explicit demo mode (must be explicitly enabled via VITE_DEMO_MODE=true)
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    return 'demo';
  }

  // Live deployment check
  if (isFirebaseConfigured) {
    return 'live';
  }

  // Live configuration missing: Explicitly unconfigured, NEVER silent fallback
  return 'unconfigured';
}

export function isExplicitDemo(): boolean {
  return getAppMode() === 'demo';
}

export function isLiveMode(): boolean {
  return getAppMode() === 'live';
}

export function isUnconfiguredMode(): boolean {
  return getAppMode() === 'unconfigured';
}
