import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBoIQhenDm0P7k2RJ79Bh8VkbYrp8X39Zc',
  authDomain: 'gloves-detector.firebaseapp.com',
  projectId: 'gloves-detector',
  storageBucket: 'gloves-detector.firebasestorage.app',
  messagingSenderId: '1054256106882',
  appId: '1:1054256106882:web:8e92eb9c2dff30d64f139b',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// The Firestore database in this Firebase project was created with the ID "gloves"
// instead of the default "(default)", so it must be named explicitly here.
export const db = getFirestore(app, 'gloves');
export const functions = getFunctions(app);
export const storage = getStorage(app);
