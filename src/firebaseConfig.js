// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwkdHb7MJUBJWoPb2J6Z8v9pTFwU3S8sM",
  authDomain: "senario-3184a.firebaseapp.com",
  databaseURL: "https://senario-3184a-default-rtdb.firebaseio.com",
  projectId: "senario-3184a",
  storageBucket: "senario-3184a.appspot.com",
  messagingSenderId: "14482505795",
  appId: "1:14482505795:web:a4e2840cd7261f3c7394f6",
  measurementId: "G-S63LJNEWDE"
};

// تهيئة التطبيق
const firebaseApp = initializeApp(firebaseConfig);

// تصدير الكائنات التي سيتم استخدامها في أماكن أخرى
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export { firebaseApp }; // تصدير firebaseApp

