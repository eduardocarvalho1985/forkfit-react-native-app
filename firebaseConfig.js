
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0qmlyXYjgWl4KHQyLFYPBi0x3umBqYAw",
  authDomain: "forkfit-dev.firebaseapp.com",
  projectId: "forkfit-dev",
  storageBucket: "forkfit-dev.firebasestorage.app",
  messagingSenderId: "161660580984",
  appId: "1:161660580984:ios:9cac482dad0fc17178a98d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
