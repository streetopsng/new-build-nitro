// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyBlzzucCjbIeKCz88TtrESAQBFYtyABOms",
  authDomain: "nitro-252b7.firebaseapp.com",
  projectId: "nitro-252b7",
  storageBucket: "nitro-252b7.firebasestorage.app",
  databaseURL: "https://nitro-252b7-default-rtdb.firebaseio.com/",
  messagingSenderId: "421329253385",
  appId: "1:421329253385:web:3ae330a191ac8a57b0b4d8",
  measurementId: "G-JGPQJGLSJ6",
};
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
