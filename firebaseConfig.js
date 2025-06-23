
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVmyIy6bq2Pp_XLP3nBQAqZt7an_UNZtk",
  authDomain: "forkfit-dev.firebaseapp.com",
  projectId: "forkfit-dev",
  storageBucket: "forkfit-dev.firebasestorage.app",
  messagingSenderId: "161660580984",
  appId: "1:161660580984:android:5714ac6c68992b8178a98d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
