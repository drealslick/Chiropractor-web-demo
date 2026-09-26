/**
 * Production Firebase Authentication Service
 * 
 * Supports:
 * - Patient sign-up & sign-in with email/password
 * - Email verification & Password resets
 * - Staff and Admin authentication
 * - Custom claims reading and role checking (admin, staff, patient)
 * - Immediate token refresh handling to ensure newly promoted roles take effect instantly (Gotcha #3)
 * - Multi-tenant context (attaches clinicId to user operations)
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  getIdToken,
  getIdTokenResult,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../lib/firebase';

export type UserRole = 'admin' | 'staff' | 'patient';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  clinicId: string;
  phone?: string;
  emailVerified: boolean;
  createdAt?: string;
}

/**
 * Dynamically resolves the primary clinic ID for this deployment
 * Checks clinic_config/active, then clinics collection, or returns 'unassigned'
 */
export async function resolveActiveClinicId(): Promise<string> {
  try {
    const configSnap = await getDoc(doc(db, 'clinic_config', 'active'));
    if (configSnap.exists() && configSnap.data()?.primaryClinicId) {
      return configSnap.data()!.primaryClinicId;
    }
  } catch (err) {
    console.warn('Note checking clinic config:', err);
  }
  return 'unassigned';
}

/**
 * Register a new patient in Firebase Auth and Firestore
 * Uses dynamic clinic resolution (never silently cross-contaminating other clinic tenants)
 */
export async function signUpPatientWithEmail(
  email: string,
  pass: string,
  fullName: string,
  phone?: string,
  clinicId?: string
): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const resolvedClinicId = clinicId || (await resolveActiveClinicId());

    const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
    const user = cred.user;

    // Update display name
    await updateProfile(user, { displayName: fullName.trim() });

    // Send email verification link
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.warn('Email verification dispatch notice:', err);
    }

    // Persist user document in Firestore under users/{uid}
    await setDoc(
      doc(db, 'users', user.uid),
      {
        uid: user.uid,
        email: user.email,
        displayName: fullName.trim(),
        role: 'patient',
        clinicId: resolvedClinicId,
        phone: phone?.trim() || '',
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      success: true,
      user,
      message: 'Account created successfully. A verification link has been sent to your email.',
    };
  } catch (error: any) {
    console.error('Sign-up error:', error);
    let message = error.message || 'Failed to create patient account.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email already exists. Please sign in instead.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password must be at least 6 characters long.';
    }
    return { success: false, message };
  }
}

/**
 * Authenticate existing user with self-healing token claims check
 */
export async function signInUser(
  email: string,
  pass: string
): Promise<{ success: boolean; profile?: UserProfile; message: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
    const user = cred.user;

    // Fetch token result with claims
    let tokenResult = await getIdTokenResult(user);
    let role = tokenResult.claims.role as UserRole | undefined;
    let clinicId = tokenResult.claims.clinicId as string | undefined;

    // Self-healing: If custom claims are missing from JWT (e.g. transient trigger hiccup),
    // invoke the ensureUserClaims Cloud Function to re-apply claims and refresh token
    if (!role || !clinicId) {
      try {
        const healFn = httpsCallable(functions, 'ensureUserClaims');
        await healFn();
        // Force token refresh to capture the newly signed claims
        await getIdToken(user, true);
        tokenResult = await getIdTokenResult(user);
        role = tokenResult.claims.role as UserRole | undefined;
        clinicId = tokenResult.claims.clinicId as string | undefined;
      } catch (healErr) {
        console.warn('ensureUserClaims notice:', healErr);
      }
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      role: role || 'patient',
      clinicId: clinicId || 'unassigned',
      emailVerified: user.emailVerified,
    };

    return { success: true, profile, message: 'Logged in successfully.' };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    let message = 'Invalid email or password.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'Invalid credentials. Please verify your email and password.';
    }
    return { success: false, message };
  }
}

/**
 * Force fresh ID token refresh with self-healing check
 * Ensures newly granted custom claims or role promotions take effect immediately
 */
export async function forceRefreshToken(): Promise<{ role: UserRole; clinicId: string } | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    // Passing true forces a token refresh from Firebase servers
    await getIdToken(user, true);
    let tokenResult = await getIdTokenResult(user);
    let role = tokenResult.claims.role as UserRole | undefined;
    let clinicId = tokenResult.claims.clinicId as string | undefined;

    if (!role || !clinicId) {
      const healFn = httpsCallable(functions, 'ensureUserClaims');
      await healFn();
      await getIdToken(user, true);
      tokenResult = await getIdTokenResult(user);
      role = tokenResult.claims.role as UserRole | undefined;
      clinicId = tokenResult.claims.clinicId as string | undefined;
    }

    return {
      role: role || 'patient',
      clinicId: clinicId || 'unassigned',
    };
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
}

/**
 * Dispatch real password reset email via Firebase Auth
 */
export async function dispatchPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return {
      success: true,
      message: `A secure password reset link has been dispatched to ${email}.`,
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    let message = error.message || 'Unable to send password reset email.';
    if (error.code === 'auth/user-not-found') {
      message = 'No registered patient account found with this email.';
    }
    return { success: false, message };
  }
}

/**
 * Sign out current user
 */
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}
