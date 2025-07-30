import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBQSSaiephyOQxlsPsaiuWVTkW4qxYxpBo",
  authDomain: "sister-circle-app-b5f0e.firebaseapp.com",
  projectId: "sister-circle-app-b5f0e",
  storageBucket: "sister-circle-app-b5f0e.appspot.com",
  messagingSenderId: "944990844302",
  appId: "1:944990844302:web:bfdaa0f0c11e029621e0df",
  measurementId: "G-71PHYCLFPT"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app; 