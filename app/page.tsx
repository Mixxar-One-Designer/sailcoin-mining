"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css'; // Ensure you have the correct path to your CSS file
import { db } from '../lib/firebase'; // Adjust the import path as necessary
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface FlyingNumber {
  id: number;
  amount: number;
}

const Home: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState<boolean>(false);
  const [rewardedAmount, setRewardedAmount] = useState<number>(0);
  const [flyingNumbers, setFlyingNumbers] = useState<FlyingNumber[]>([]);
  const [flyingNumberId, setFlyingNumberId] = useState<number>(0);

  useEffect(() => {
    // Placeholder for user ID setup
    const mockUserId = 'testUser123'; // Replace with actual user ID logic from Telegram
    setUserId(mockUserId);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setBalance(userDoc.data().balance || 0);
        } else {
          // Initialize the user document if it does not exist
          await setDoc(userRef, { balance: 0 });
          setBalance(0);
        }
      }
    };
    fetchBalance();
  }, [userId]);

  const handleMineClick = async () => {
    if (userId) {
      const userRef = doc(db, 'users', userId);
      const newBalance = balance + 1;
      setBalance(newBalance);
      setRewardedAmount(1); // Set the amount to be rewarded (can be adjusted as needed)
      const newFlyingNumberId = flyingNumberId + 1;
      setFlyingNumberId(newFlyingNumberId);
      setFlyingNumbers([...flyingNumbers, { id: newFlyingNumberId, amount: 1 }]);
      await updateDoc(userRef, { balance: newBalance });
      // Reset animation state after a delay to allow animation to play
      setTimeout(() => {
        setFlyingNumbers(flyingNumbers.filter(f => f.id !== newFlyingNumberId));
      }, 2000); // Adjust the delay as needed to match the animation duration
    }
  };

  const formatBalance = (balance: number) => {
    if (balance < 1000000) {
      return balance.toLocaleString(); // Display as 100,000 format
    } else if (balance < 10000000) {
      return (balance / 1000000).toFixed(1) + 'M'; // Display as 1.0M format
    } else {
      return (balance / 1000000).toFixed(0) + 'M'; // Display as 10M format
    }
  };

  return (
    <div className={styles.container}>
      {/* Background animation */}
      <div className={styles.backgroundAnimation}>
        {[...Array(20)].map((_, index) => (
          <div
            key={index}
            className={styles.bubble}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
        {[...Array(10)].map((_, index) => (
          <div
            key={`sparkle-${index}`}
            className={styles.sparkle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Balance display */}
      <div className={styles.balanceContainer}>
        <Image src="/gold-coin.png" alt="Sailcoin" className={styles.balanceIcon} width={50} height={50} />
        <div>
          <div className={styles.balanceText}>Your Balance</div>
          <div className={styles.balanceAmount}>{formatBalance(balance)} SLC</div>
        </div>
      </div>

      {/* Mining button */}
      <div className={styles.coinButton} onClick={handleMineClick}>
        <div className={styles.miningButton}>
          <Image src="/slc.PNG" alt="Mine" width={150} height={150} />
          {showRewardAnimation && (
            <div className={styles.rewardText}>
              +{rewardedAmount}
            </div>
          )}
        </div>
      </div>

      {/* Flying numbers */}
      {flyingNumbers.map(flyingNumber => (
        <div key={flyingNumber.id} className={styles.flyingNumber}>
          +{flyingNumber.amount}
        </div>
      ))}

      {/* Navigation buttons */}
      <div className={styles.navButtons}>
        <button className={styles.navButton}>Tasks</button>
        <button className={styles.navButton}>Leaderboard</button>
        <button className={styles.navButton}>Daily Limit</button>
      </div>
    </div>
  );
};

export default Home;