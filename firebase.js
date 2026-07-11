import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9AarJiWz3Gr3GYpt9uC7nQZfjTRJDqh8",
  authDomain: "baniniya-youth-cricket-c-fcf89.firebaseapp.com",
  projectId: "baniniya-youth-cricket-c-fcf89",
  storageBucket: "baniniya-youth-cricket-c-fcf89.firebasestorage.app",
  messagingSenderId: "942736963772",
  appId: "1:942736963772:web:1fc242256d980fd002b8b9",
  measurementId: "G-ZWYGZJ98W5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

export { auth, db, storage };
