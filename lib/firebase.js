import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDDzWn3FLOCwxl-RAycd6Q7mBZmYEeRh1A",
  authDomain: "sih-project-1.firebaseapp.com",
  projectId: "sih-project-1",
  storageBucket: "sih-project-1.appspot.com",
  messagingSenderId: "982366774224",
  appId: "1:982366774224:web:d4c8cf88518b575dcf8fd5",
  measurementId: "G-RH8622WKFN"
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