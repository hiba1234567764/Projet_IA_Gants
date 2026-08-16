// tsc resolves '@firebase/auth' to its Node build for type-checking, which omits this
// React Native-only helper — Metro still bundles the real RN build correctly at runtime.
// @ts-expect-error — see comment above
import { getReactNativePersistence } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBoIQhenDm0P7k2RJ79Bh8VkbYrp8X39Zc',
  authDomain: 'gloves-detector.firebaseapp.com',
  projectId: 'gloves-detector',
  storageBucket: 'gloves-detector.firebasestorage.app',
  messagingSenderId: '1054256106882',
  appId: '1:1054256106882:web:8e92eb9c2dff30d64f139b',
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
// The Firestore database in this Firebase project was created with the ID "gloves"
// instead of the default "(default)", so it must be named explicitly here.
export const db = getFirestore(app, 'gloves');
