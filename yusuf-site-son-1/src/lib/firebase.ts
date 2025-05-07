import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAcwbpAJDBXENwXDGdcqgxJyFiKKHoor6A",
  authDomain: "yusuf-site-1bc9c.firebaseapp.com",
  databaseURL: "https://yusuf-site-1bc9c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yusuf-site-1bc9c",
  storageBucket: "yusuf-site-1bc9c.appspot.com",
  messagingSenderId: "869601917338",
  appId: "1:869601917338:web:78d78c25a16e530904e223",
  measurementId: "G-58CSJ82H7V"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app); 