import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { EmailAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbgzNYCwCuU_ww2xq6hlHF4pwEWKtOWbw",
  authDomain: "livestream-shop.firebaseapp.com",
  projectId: "livestream-shop",
  storageBucket: "livestream-shop.firebasestorage.app",
  messagingSenderId: "294069903496",
  appId: "1:294069903496:web:04e07415798808b3e6ff3d",
  measurementId: "G-33M5D52FNL"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const provider = new EmailAuthProvider();
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { provider, auth, storage };
export default db;
