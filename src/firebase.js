import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-x-v1RGBBoOND6ZqbxDKwIZ2AB2_fzoE",
  authDomain: "capstone-proj-51373.firebaseapp.com",
  projectId: "capstone-proj-51373",
  storageBucket: "capstone-proj-51373.firebasestorage.app",
  messagingSenderId: "961252191031",
  appId: "1:961252191031:web:2fdb36bdce96fbf0eb88b2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
