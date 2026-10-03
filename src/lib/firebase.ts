import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const rawApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const rawProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();

/**
 * Checks whether valid client credentials have been supplied by the user/buyer.
 * Returns false if keys are empty or still set to .env.example placeholders.
 */
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey !== 'your_firebase_api_key_here' &&
  !rawApiKey.includes('placeholder') &&
  rawProjectId &&
  rawProjectId !== 'your_project_id'
);

const firebaseConfig = {
  apiKey: isFirebaseConfigured ? rawApiKey : 'AIzaSyPlaceholderKeyForUnconfiguredMode0',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'unconfigured.firebaseapp.com').trim(),
  projectId: isFirebaseConfigured ? rawProjectId : 'unconfigured',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'unconfigured.firebasestorage.app').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000').trim(),
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const functions = getFunctions(app);

// Use custom databaseId specified in environment if present, defaulting to '(default)'
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = initializeFirestore(
  app,
  {},
  databaseId && databaseId !== '(default)' ? databaseId : undefined
);

if (typeof process !== 'undefined' && process.env.FIRESTORE_EMULATOR_HOST) {
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  try {
    connectFirestoreEmulator(db, host, parseInt(port || '8085', 10));
  } catch {
    // Already connected
  }
  try {
    connectFunctionsEmulator(functions, host, 5001);
  } catch {
    // Already connected
  }
}

export default app;
