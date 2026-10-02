import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get as rawGet,
  set as rawSet,
  update as rawUpdate,
  remove as rawRemove,
  push as rawPush,
  onValue as rawOnValue,
} from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
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
export const auth = getAuth(app);

// The anonymous uid only satisfies the database rules (auth != null); it is not the player's identity.
// Never rejects, so the app keeps working under open rules if the Anonymous provider isn't enabled yet.
export const authReady: Promise<void> = auth
  .authStateReady()
  .then(() => (auth.currentUser ? undefined : signInAnonymously(auth).then(() => undefined)))
  .catch((err) => console.warn("Firebase anonymous sign-in failed, continuing without auth:", err));

export { ref };
export const get: typeof rawGet = (...args) => authReady.then(() => rawGet(...args));
export const set: typeof rawSet = (...args) => authReady.then(() => rawSet(...args));
export const update: typeof rawUpdate = (...args) => authReady.then(() => rawUpdate(...args));
export const remove: typeof rawRemove = (...args) => authReady.then(() => rawRemove(...args));
export const push = (...args: Parameters<typeof rawPush>) => authReady.then(() => rawPush(...args));

export const onValue = ((...args: Parameters<typeof rawOnValue>) => {
  let unsubscribe: (() => void) | null = null;
  let cancelled = false;
  authReady.then(() => {
    if (!cancelled) unsubscribe = (rawOnValue as (...a: unknown[]) => () => void)(...args);
  });
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}) as typeof rawOnValue;
