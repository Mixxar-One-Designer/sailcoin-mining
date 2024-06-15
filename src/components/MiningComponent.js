// src/components/MiningComponent.js
"use client"; // Add this directive at the top of the file

import React, { useState, useEffect } from 'react';
import firebase from '../firebaseConfig';

const MiningComponent = () => {
  const [coins, setCoins] = useState(0);
  const [isMining, setIsMining] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userId = firebase.auth().currentUser.uid;
      const db = firebase.firestore();
      const doc = await db.collection('users').doc(userId).get();
      if (doc.exists) {
        setCoins(doc.data().coins);
      }
    };

    fetchData();
  }, []);

  const startMining = () => {
    setIsMining(true);
    const interval = setInterval(() => {
      setCoins(prevCoins => prevCoins + 1);
      // Update coins in the database
      const userId = firebase.auth().currentUser.uid;
      const db = firebase.firestore();
      db.collection('users').doc(userId).update({
        coins: firebase.firestore.FieldValue.increment(1)
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const stopMining = () => {
    setIsMining(false);
    clearInterval(startMining);
  };

  return (
    <div>
      <h1>Mining...</h1>
      <p>Coins: {coins}</p>
      {isMining ? (
        <button onClick={stopMining}>Stop Mining</button>
      ) : (
        <button onClick={startMining}>Start Mining</button>
      )}
    </div>
  );
};

export default MiningComponent;