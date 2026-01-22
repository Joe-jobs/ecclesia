
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBFyzcKLIPlnD8jHP2VFqca9krag7ujvGk",
  authDomain: "ecclesia-c5f14.firebaseapp.com",
  projectId: "ecclesia-c5f14",
  storageBucket: "ecclesia-c5f14.firebasestorage.app",
  messagingSenderId: "156332880806",
  appId: "1:156332880806:web:33cde5a16d5b080436d567"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
