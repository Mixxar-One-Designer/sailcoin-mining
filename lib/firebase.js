import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCIbR_IUO8DmWosjimObLuCE8CmQUniWU",
  authDomain: "sailcoin-mining.firebaseapp.com",
  projectId: "sailcoin-mining",
  storageBucket: "sailcoin-mining.appspot.com",
  messagingSenderId: "813284735552",
  appId: "1:813284735552:web:5ca3a96bce3a3380ed3da5",
  measurementId: "G-P7EHZ4TXNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };