// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAH6aOEIYdaMeqw-U_F5OLZJiVwhtsDGNY",
  authDomain: "linea-store-59258.firebaseapp.com",
  projectId: "linea-store-59258",
  storageBucket: "linea-store-59258.firebasestorage.app",
  messagingSenderId: "133943477614",
  appId: "1:133943477614:web:2f2f006c7a5ae6059a6d7f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);
