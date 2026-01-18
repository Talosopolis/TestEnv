/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig as devConfig } from './firebase.config.dev';
import { firebaseConfig as prodConfig } from './firebase.config.prod';

// Select configuration based on VITE_APP_ENV
const appEnv = import.meta.env.VITE_APP_ENV || 'development';
console.log(`Initializing Firebase for Environment: ${appEnv}`);

export const firebaseConfig = appEnv === 'production' ? prodConfig : devConfig;

// Check if configuration is present
// Check if configuration is present and valid (not placeholders)
// Check if configuration is present and valid
const isConfigured =
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'PLACEHOLDER' &&
    firebaseConfig.apiKey !== 'v0-firebase-api-key' &&
    !!firebaseConfig.authDomain;

import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

// ... (config)

let app;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (isConfigured) {

    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        // Fallback to nulls if init fails despite keys
    }
} else {
    console.log("Firebase credentials not found. Using Mock Mode.");
}

export { auth, db, googleProvider, isConfigured };
