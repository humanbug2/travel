import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBp4K0xy0PFRWonwVwm_tpviR-jwlnqdb8",
  authDomain: "travel-824bc.firebaseapp.com",
  projectId: "travel-824bc",
  storageBucket: "travel-824bc.firebasestorage.app",
  messagingSenderId: "154361449499",
  appId: "1:154361449499:web:066cc5cf152827cfca7cbe"
};

console.log('Firebase Config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Sign-in successful:', result.user);
    return result;
  } catch (error) {
    console.error('Sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log('Sign-out successful');
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};