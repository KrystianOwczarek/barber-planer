// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCP3CVhWdQnKxIu5gdvgcokUBUjoCv1S0w",
  authDomain: "barber-planer.firebaseapp.com",
  projectId: "barber-planer",
  storageBucket: "barber-planer.appspot.com",
  messagingSenderId: "36525964568",
  appId: "1:36525964568:web:ce8d73d77bd9c93c87b26d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app)