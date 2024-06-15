// src/firebaseConfig.js
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Your Firebase configuration object here
console.log('Firebase:', firebase); // Add this line

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;