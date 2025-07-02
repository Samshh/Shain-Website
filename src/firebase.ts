import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvwdQLvlHgJaRr_u7qx4ekBuPznzVy7-g",
  authDomain: "shanica-85bf1.firebaseapp.com",
  projectId: "shanica-85bf1",
  storageBucket: "shanica-85bf1.firebasestorage.app",
  messagingSenderId: "636847302440",
  appId: "1:636847302440:web:e23521a3323895069a121d",
  measurementId: "G-11QMCZM869",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
