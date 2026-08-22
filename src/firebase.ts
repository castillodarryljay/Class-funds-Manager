import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOdPBu3KRJezbNojP0cyJuNCHQhEPRU14",
  authDomain: "gen-lang-client-0192880941.firebaseapp.com",
  projectId: "gen-lang-client-0192880941",
  storageBucket: "gen-lang-client-0192880941.firebasestorage.app",
  messagingSenderId: "1060216918182",
  appId: "1:1060216918182:web:7796f2d50dffb0026e2467"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId if provided, otherwise default
export const db = getFirestore(app, "ai-studio-classfundmanager-d0bb1c2d-7985-4119-afbb-79f307cd6438");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection as required by validation guidelines
export async function testFirestoreConnection() {
  try {
    // Attempting a read from a dummy document using getDocFromServer
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore connection test passed.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Firestore is offline. Please check your Firebase configuration or networks.");
    } else {
      console.log("Firestore connection initialized (empty document response is normal).");
    }
    return false;
  }
}

testFirestoreConnection();
