import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9cqIUmOG_vG3o1Ljjxh1ZXCv0yUQvGiA",
  authDomain: "crop-doctor-ai.firebaseapp.com",
  projectId: "crop-doctor-ai",
  storageBucket: "crop-doctor-ai.firebasestorage.app",
  messagingSenderId: "807544518136",
  appId: "1:807544518136:web:d3dbb1cca2b14e76a1920d",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

