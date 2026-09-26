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
import { auth, db } from '../lib/firebase';

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

export const DEFAULT_CLINIC_ID = 'clinic_apex_columbus';

/**
 * Register a new patient in Firebase Auth and Firestore with clinicId
 */
export async function signUpPatientWithEmail(
  email: string,
  pass: string,
  fullName: string,
  phone?: string,
  clinicId: string = DEFAULT_CLINIC_ID
): Promise<{ success: boolean; user?: User; message: string }> {
  try {
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
        clinicId,
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
 * Authenticate existing user with token refresh check
 */
export async function signInUser(
  email: string,
  pass: string
): Promise<{ success: boolean; profile?: UserProfile; message: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
    const user = cred.user;

    // Fetch token result with claims
    const tokenResult = await getIdTokenResult(user);
    let role: UserRole = (tokenResult.claims.role as UserRole) || 'patient';
    let clinicId: string = (tokenResult.claims.clinicId as string) || DEFAULT_CLINIC_ID;

    // Fallback lookup to users/{uid}
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role) role = data.role as UserRole;
      if (data.clinicId) clinicId = data.clinicId;
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      role,
      clinicId,
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
 * Gotcha #3 Resolution: Force fresh ID token refresh
 * Ensures newly granted custom claims or role promotions take effect immediately
 */
export async function forceRefreshToken(): Promise<{ role: UserRole; clinicId: string } | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    // Passing true forces a token refresh from Firebase servers
    await getIdToken(user, true);
    const tokenResult = await getIdTokenResult(user);
    const role = (tokenResult.claims.role as UserRole) || 'patient';
    const clinicId = (tokenResult.claims.clinicId as string) || DEFAULT_CLINIC_ID;
    return { role, clinicId };
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
