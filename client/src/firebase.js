import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "lauchabmxstore.firebaseapp.com",
  projectId: "lauchabmxstore",
  storageBucket: "lauchabmxstore.firebasestorage.app",
  messagingSenderId: "569512301124",
  appId: "1:569512301124:web:9ea3b913c97475bc1ba211"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
