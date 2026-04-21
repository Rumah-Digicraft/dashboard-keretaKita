import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBurhEFgrxGyI465Dn0xvUEtObXa-0DePg",
  authDomain: "kereta-kita.firebaseapp.com",
  projectId: "kereta-kita",
  storageBucket: "kereta-kita.firebasestorage.app",
  messagingSenderId: "166871473494",
  appId: "1:166871473494:web:e8a20375ca62d9efaf0af7",
  measurementId: "G-PBFQCFBLEP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Persistence failed: Browser not supported');
    }
});
