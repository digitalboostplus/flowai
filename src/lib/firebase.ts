'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDhdyADwTEFhegVXG5EpaqCncM6hTBTTKY",
  authDomain: "fir-97718.firebaseapp.com",
  projectId: "fir-97718",
  storageBucket: "fir-97718.firebasestorage.app",
  messagingSenderId: "125518613894",
  appId: "1:125518613894:web:0553887f7e2b8f0ee93007"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider }; 