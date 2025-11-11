import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase config is available
const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value && value !== "undefined"
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new Error("Failed to initialize Firebase. Please check your configuration.");
  }
} else {
  console.warn(
    "⚠️ Firebase not configured! Please add your Firebase credentials to .env file.\n" +
    "See README.md for setup instructions."
  );
  // Create dummy exports to prevent import errors
  throw new Error(
    "Firebase not configured. Please add Firebase credentials to .env file. See README.md for setup."
  );
}

export { auth, db, storage, app as default };
