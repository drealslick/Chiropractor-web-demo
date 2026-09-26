import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { PatientLead, PatientAccount, DispatchedNotification } from '../data/leadsStore';

// Collection References
const APPOINTMENTS_COLLECTION = 'appointments';
const PATIENTS_COLLECTION = 'patients';
const SETTINGS_COLLECTION = 'clinic_settings';

/**
 * Real-time Firestore sync for Appointments
 */
export async function syncAppointmentToFirestore(lead: PatientLead): Promise<boolean> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, lead.id);
    await setDoc(
      docRef,
      {
        ...lead,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to sync appointment to Firestore:', error);
    return false;
  }
}

/**
 * Subscribe to real-time appointments across all devices/branches
 */
export function subscribeToAppointments(callback: (appointments: PatientLead[]) => void): () => void {
  try {
    const q = collection(db, APPOINTMENTS_COLLECTION);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appts: PatientLead[] = [];
        snapshot.forEach((docSnap) => {
          appts.push(docSnap.data() as PatientLead);
        });
        if (appts.length > 0) {
          callback(appts);
        }
      },
      (error) => {
        console.error('Firestore appointments subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Error initiating appointments subscription:', error);
    return () => {};
  }
}

/**
 * Fetch patient appointments by email from Cloud Firestore
 */
export async function fetchAppointmentsByEmailFromFirestore(email: string): Promise<PatientLead[]> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const q = query(collection(db, APPOINTMENTS_COLLECTION), where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(q);
    const results: PatientLead[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as PatientLead);
    });
    return results;
  } catch (error) {
    console.error('Failed to query appointments by email:', error);
    return [];
  }
}

/**
 * Fetch single appointment by booking ID from Cloud Firestore
 */
export async function fetchAppointmentByIdFromFirestore(id: string): Promise<PatientLead | null> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as PatientLead;
    }
    return null;
  } catch (error) {
    console.error('Failed to query appointment by ID:', error);
    return null;
  }
}

/**
 * Patient Account Registration with Firebase Auth & Cloud Firestore
 */
export async function registerPatientWithFirebaseAuth(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: boolean; account?: PatientAccount; message: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    const patientProfile: PatientAccount = {
      id: user.uid,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    // 2. Persist profile document in Firestore
    await setDoc(doc(db, PATIENTS_COLLECTION, user.uid), patientProfile);

    return {
      success: true,
      account: patientProfile,
      message: 'Account created and verified on Vance Health Cloud.',
    };
  } catch (error: any) {
    console.error('Firebase Auth Registration error:', error);
    let message = error.message || 'Failed to create patient account.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email address already exists. Please log in.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak. Please use at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please provide a valid email address.';
    }
    return { success: false, message };
  }
}

/**
 * Patient Login with Firebase Auth
 */
export async function loginPatientWithFirebaseAuth(
  email: string,
  password: string
): Promise<{ success: boolean; account?: PatientAccount; message: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    const profileSnap = await getDoc(doc(db, PATIENTS_COLLECTION, user.uid));
    let account: PatientAccount;
    if (profileSnap.exists()) {
      account = profileSnap.data() as PatientAccount;
    } else {
      account = {
        id: user.uid,
        name: user.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      account,
      message: 'Login successful.',
    };
  } catch (error: any) {
    console.error('Firebase Auth Login error:', error);
    let message = 'Incorrect email or password. Please try again.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'No patient account found with these credentials. Please check your spelling or register.';
    }
    return { success: false, message };
  }
}

/**
 * Real Password Reset Email Dispatch via Firebase Auth
 */
export async function sendRealPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, cleanEmail);
    return {
      success: true,
      message: `A secure password recovery email has been sent by Firebase to ${cleanEmail}. Please check your inbox and spam folder.`,
    };
  } catch (error: any) {
    console.error('Firebase sendPasswordResetEmail error:', error);
    let message = error.message || 'Unable to send password recovery email.';
    if (error.code === 'auth/user-not-found') {
      message = 'No account is registered with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please provide a valid email format.';
    }
    return { success: false, message };
  }
}

/**
 * Sign out patient
 */
export async function logoutPatientFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

/**
 * Seed initial sample appointments to Firestore so cross-device tests immediately have data
 */
export async function seedInitialFirestoreData(leads: PatientLead[]): Promise<void> {
  try {
    for (const lead of leads) {
      const docRef = doc(db, APPOINTMENTS_COLLECTION, lead.id);
      await setDoc(docRef, lead, { merge: true });
    }
  } catch (err) {
    console.warn('Initial Firestore seed warning:', err);
  }
}
