import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const functions = getFunctions(app);

// Use custom databaseId specified in environment if present, defaulting to '(default)'
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = initializeFirestore(
  app,
  {},
  databaseId && databaseId !== '(default)' ? databaseId : undefined
);

export default app;

// Explicit local-only provider routing. Production bundles cannot redirect credentials.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings:true});
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
