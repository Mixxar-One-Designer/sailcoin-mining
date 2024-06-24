"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { db } from '../lib/firebase';
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
  const [dailyLimitReached, setDailyLimitReached] = useState<boolean>(false);
  const [nextMiningTime, setNextMiningTime] = useState<Date | null>(null);
  const [clicksRemaining, setClicksRemaining] = useState<number>(1000);
  const [cylinderColor, setCylinderColor] = useState<string>('green');
  const [showComingSoon, setShowComingSoon] = useState<boolean>(false);

  const incrementInterval = useRef<NodeJS.Timeout | null>(null);
  const isClicking = useRef<boolean>(false);

  useEffect(() => {
    const mockUserId = 'testUser123'; // Replace with actual user ID logic from Telegram
    setUserId(mockUserId);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userBalance = userDoc.data()?.balance || 0; // Use optional chaining
          setBalance(userBalance);
        } else {
          await setDoc(userRef, { balance: 0 });
          setBalance(0);
        }
      }
    };
    fetchBalance();
  }, [userId]);

  useEffect(() => {
    if (clicksRemaining < 500) {
      setCylinderColor('red');
    } else if (clicksRemaining < 700) {
      setCylinderColor('orange');
    } else {
      setCylinderColor('green');
    }
  }, [clicksRemaining]);

  useEffect(() => {
    if (!isClicking.current && clicksRemaining < 1000) {
      incrementInterval.current = setInterval(() => {
        setClicksRemaining((prev) => Math.min(prev + 1, 1000));
      }, 300); // Slower refill speed
    } else if (isClicking.current && incrementInterval.current) {
      clearInterval(incrementInterval.current);
      incrementInterval.current = null;
    }

    return () => {
      if (incrementInterval.current) {
        clearInterval(incrementInterval.current);
      }
    };
  }, [clicksRemaining]);

  const handleMineClick = async () => {
    if (userId && !dailyLimitReached && clicksRemaining > 0) {
      isClicking.current = true;
      const userRef = doc(db, 'users', userId);
      const newBalance = balance + 1;
      setBalance(newBalance);
      setRewardedAmount(1);
      const newFlyingNumberId = flyingNumberId + 1;
      setFlyingNumberId(newFlyingNumberId);
      setFlyingNumbers([...flyingNumbers, { id: newFlyingNumberId, amount: 1 }]);
      await updateDoc(userRef, { balance: newBalance });

      setClicksRemaining((prev) => Math.max(prev - 1, 0));

      if (newBalance >= 10000) {
        setDailyLimitReached(true);
        const nextTime = new Date();
        nextTime.setDate(nextTime.getDate() + 1);
        nextTime.setHours(0, 0, 0, 0);
        setNextMiningTime(nextTime);
      }

      setTimeout(() => {
        setFlyingNumbers(flyingNumbers.filter(f => f.id !== newFlyingNumberId));
      }, 2000);
    }
  };

  const handleMineRelease = () => {
    isClicking.current = false;
    if (clicksRemaining === 0) {
      incrementInterval.current = setInterval(() => {
        setClicksRemaining((prev) => Math.min(prev + 1, 1000));
      }, 300); // Ensure the refill starts after reaching 0
    }
  };

  const formatBalance = (balance: number) => {
    if (balance < 1000000) {
      return balance.toLocaleString();
    } else if (balance < 10000000) {
      return (balance / 1000000).toFixed(1) + 'M';
    } else {
      return (balance / 1000000).toFixed(0) + 'M';
    }
  };

  const handleComingSoonClick = () => {
    setShowComingSoon(true);
    setTimeout(() => {
      setShowComingSoon(false);
    }, 2000);
  };

  return (
    <div className={styles.container}>
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

      <div className={styles.balanceContainer}>
        <Image src="/gold-coin.PNG" alt="Sailcoin" className={styles.balanceIcon} width={50} height={50} />
        <div>
          <div className={styles.balanceText}>Your Balance</div>
          <div className={styles.balanceAmount}>{formatBalance(balance)} SLC</div>
        </div>
      </div>

      <div
        className={styles.coinButton}
        onMouseDown={handleMineClick}
        onMouseUp={handleMineRelease}
        onTouchStart={handleMineClick}
        onTouchEnd={handleMineRelease}
      >
        <div className={styles.miningButton}>
          <Image src="/slc.PNG" alt="Mine" width={150} height={150} />
          {showRewardAnimation && (
            <div className={styles.rewardText}>
              +{rewardedAmount}
            </div>
          )}
        </div>
      </div>

      {dailyLimitReached && (
        <div className={styles.dailyLimitPopup}>
          <div className={styles.popupText}>Sorry, you have reached your daily limit.</div>
          {nextMiningTime && (
            <div className={styles.popupText}>
              Come back tomorrow at {nextMiningTime.toLocaleString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}

      <div className={styles.progressContainer}>
        <div className={styles.progressCylinder} style={{ width: `${(clicksRemaining / 1000) * 100}%`, background: `linear-gradient(90deg, red, orange, green)` }}>
          <div className={styles.progressText}>{clicksRemaining}</div>
        </div>
      </div>

      {flyingNumbers.map(flyingNumber => (
        <div key={flyingNumber.id} className={styles.flyingNumber}>
          +{flyingNumber.amount}
        </div>
      ))}

      <div className={styles.navButtons}>
        <div className={styles.navButton} onClick={handleComingSoonClick}>
          Tasks
        </div>
        <div className={styles.navButton} onClick={handleComingSoonClick}>
          Leaderboard
        </div>
        <div className={styles.navButton} onClick={handleComingSoonClick}>
          Daily Limit
        </div>
      </div>

      {showComingSoon && (
        <div className={styles.comingSoonPopup}>
          <div className={styles.popupText}>Coming Soon</div>
        </div>
      )}
    </div>
  );
};

export default Home;