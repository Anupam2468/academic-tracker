import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-cguautomatedacad-523b2dd1-4023-4183-b906-280938245cb2");
export const auth = getAuth(app);

export const tasksCollection = collection(db, 'tasks');
export const notificationsCollection = collection(db, 'notifications');
