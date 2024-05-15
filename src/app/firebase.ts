// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: "chatapplication-with-cha-b7b63.firebaseapp.com",
  projectId: "chatapplication-with-cha-b7b63",
  storageBucket: "chatapplication-with-cha-b7b63.appspot.com",
  messagingSenderId: "760490883251",
  appId: "1:760490883251:web:454aeb8a0ef4fbc30158c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);