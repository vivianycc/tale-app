import { initializeApp, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FB_APP_ID,
};

export function getFirebase() {
  function createFirebaseApp(config) {
    try {
      return getApp();
    } catch {
      return initializeApp(config);
    }
  }
  const firebaseApp = createFirebaseApp(firebaseConfig);

  const auth = getAuth(firebaseApp);

  const firestore = getFirestore(firebaseApp);

  const storage = getStorage(firebaseApp);

  return { firebaseApp, auth, firestore, storage };
}

function connectToEmulators({ firebaseApp, auth, firestore, storage }) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(firestore, "127.0.0.1", 8088);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  return { firebaseApp, auth, firestore };
}
if (
  window.location.hostname === "localhost" &&
  process.env.REACT_APP_USE_EMULATOR === "true"
) {
  connectToEmulators(getFirebase());
}
