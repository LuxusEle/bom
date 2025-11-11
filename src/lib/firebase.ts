import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

console.log("🔥 Firebase initialization starting...");
console.log("Environment check:", {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  nodeEnv: import.meta.env.MODE,
});

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
  (value) => value && value !== "undefined" && value !== ""
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!isFirebaseConfigured) {
  console.error("❌ Firebase not configured!");
  console.error("Missing environment variables. Please add them to Vercel:");
  console.error("Dashboard → Settings → Environment Variables");

  throw new Error(
    "Firebase Configuration Missing!\n\n" +
    "Please add Firebase environment variables in Vercel:\n" +
    "1. Go to your Vercel project dashboard\n" +
    "2. Click Settings → Environment Variables\n" +
    "3. Add all 6 VITE_FIREBASE_* variables\n" +
    "4. Redeploy the application\n\n" +
    "See README.md for detailed instructions."
  );
}

try {
  console.log("✅ Firebase config found, initializing...");

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized");

  // Initialize services
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized");

  db = getFirestore(app);
  console.log("✅ Firestore initialized");

  storage = getStorage(app);
  console.log("✅ Storage initialized");

  console.log("🎉 Firebase fully initialized successfully!");
} catch (error: any) {
  console.error("❌ Firebase initialization failed:", error);
  throw new Error(
    `Failed to initialize Firebase: ${error.message}\n\n` +
    "This usually means:\n" +
    "1. Your Firebase project doesn't exist\n" +
    "2. The configuration values are incorrect\n" +
    "3. Firebase services are not enabled\n\n" +
    "Please check Firebase Console: https://console.firebase.google.com/"
  );
}

export { auth, db, storage, app as default };
