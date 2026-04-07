import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtB1KPFbIGAnShrNwD6F67sLZzi3AR-I4",
  authDomain: "absennew.firebaseapp.com",
  projectId: "absennew",
  storageBucket: "absennew.firebasestorage.app",
  messagingSenderId: "927152519450",
  appId: "1:927152519450:web:c39dc6ecc2c5167856d4a3",
  measurementId: "G-W64GR8BF7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);

// Mock initDB to maintain compatibility with App.jsx
export const initDB = async () => {
  return Promise.resolve();
};

export const getData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(firestoreDb, collectionName));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ ...doc.data() });
      // Note: doc.data() already contains the 'id' field because we explicitly set it below.
    });
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
};

export const addData = async (collectionName, item) => {
  try {
    // We use setDoc instead of addDoc because our app generates its own predictable IDs (e.g. GURU-XXX)
    await setDoc(doc(firestoreDb, collectionName, item.id), item);
    return await getData(collectionName);
  } catch (error) {
    console.error("Error adding document: ", error);
    return [];
  }
};

export const updateData = async (collectionName, id, updatedItem) => {
  try {
    const docRef = doc(firestoreDb, collectionName, id);
    await updateDoc(docRef, updatedItem);
    return await getData(collectionName);
  } catch (error) {
    console.error("Error updating document: ", error);
    return [];
  }
};

export const deleteData = async (collectionName, id) => {
  try {
    await deleteDoc(doc(firestoreDb, collectionName, id));
    return await getData(collectionName);
  } catch (error) {
    console.error("Error deleting document: ", error);
    return [];
  }
};

// Generate QR ID Helper
export const generateId = (prefix) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};
