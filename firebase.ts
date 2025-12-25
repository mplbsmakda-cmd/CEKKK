
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC5j6AxPj9hLIW4wo-HQsmgz8f67JUutVw",
  authDomain: "ai-studio-5130b.firebaseapp.com",
  projectId: "ai-studio-5130b",
  storageBucket: "ai-studio-5130b.firebasestorage.app",
  messagingSenderId: "11974912794",
  appId: "1:11974912794:web:e9d743dd7cc691f0a15aa3",
  measurementId: "G-T1YPC672F3"
};

// Initialize Firebase App only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

/**
 * Firestore Initialization
 * 
 * To fix "SDK cache is already specified":
 * We use `initializeFirestore` with the `localCache` property. 
 * We must NOT call `enableIndexedDbPersistence` when using this modern configuration.
 */
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // If already initialized (common in hot-reloading), get existing instance
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const storage = getStorage(app);
