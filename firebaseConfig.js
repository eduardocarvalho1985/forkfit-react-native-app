
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBzrryqKfpqxkf5fzpj_NbdWD5QfM7Kj7g",
  authDomain: "nutrisnapapp2025.firebaseapp.com",
  projectId: "nutrisnapapp2025",
  storageBucket: "nutrisnapapp2025.firebasestorage.app",
  messagingSenderId: "740196834740",
  appId: "1:740196834740:android:d4e1f19767ca7d1306a6e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
