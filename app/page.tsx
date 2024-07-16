'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../styles/Home.module.css';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faTrophy, faRocket, faWallet, faSackDollar, faUser, faBolt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface FlyingNumber {
  id: number;
  amount: number;
}

const Home: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [userName, setUserName] = useState<string>('User');
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const incrementInterval = useRef<NodeJS.Timeout | null>(null);
  const isClicking = useRef<boolean>(false);
  const router = useRouter();
  const miningAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const actualUserId = queryParams.get('userId') || 'testUser123';
    setUserId(actualUserId);
  }, []);  

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData?.name || 'User');
        } else {
          // If user data doesn't exist, fetch from Telegram and store it
          const userData = await fetchAndStoreUserData(userId);
          if (userData) {
            setUserName(userData.userName);
          }
        }
      }
    };

    const fetchBalance = async () => {
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userBalance = userDoc.data()?.balance || 0;
            setBalance(userBalance);
          } else {
            await setDoc(userRef, { balance: 0 });
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchUserData();
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
      }, 300);
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
      try {
        const userRef = doc(db, 'users', userId);
        const newBalance = balance + 1;
        setBalance(newBalance);
        setRewardedAmount(1);
        const newFlyingNumberId = flyingNumberId + 1;
        setFlyingNumberId(newFlyingNumberId);
        setFlyingNumbers((prev) => [...prev, { id: newFlyingNumberId, amount: 1 }]);
        setClicksRemaining((prev) => Math.max(prev - 1, 0));
        
        await updateDoc(userRef, { balance: newBalance });

        const success = await updateBalance(userId, newBalance);
        if (success) {
          console.log('Balance updated successfully via API');
        } else {
          console.error('Failed to update balance via API');
        }

        if (newBalance >= 10000) {
          setDailyLimitReached(true);
          const nextTime = new Date();
          nextTime.setDate(nextTime.getDate() + 1);
          nextTime.setHours(0, 0, 0, 0);
          setNextMiningTime(nextTime);
        }

        setTimeout(() => {
          setFlyingNumbers((prev) => prev.filter(f => f.id !== newFlyingNumberId));
        }, 2000);
      } catch (error) {
        console.error("Error updating balance:", error);
      }
    }
  };  

  const handleMineRelease = () => {
    isClicking.current = false;
    if (clicksRemaining === 0) {
      incrementInterval.current = setInterval(() => {
        setClicksRemaining((prev) => Math.min(prev + 1, 1000));
      }, 300);
    }
  };

  const handleRechargeTool = () => {
    let rechargeInterval: NodeJS.Timeout;
    rechargeInterval = setInterval(() => {
      setClicksRemaining((prev) => {
        if (prev >= 1000) {
          clearInterval(rechargeInterval);
          return 1000;
        }
        return prev + 50;
      });
    }, 100);
  };

  const fetchAndStoreUserData = async (userId: string) => {
    try {
      // Fetch user data from Telegram bot API
      const response = await axios.get(`https://api.telegram.org/bot<6897920395:AAEl4SH-ZdkLdYwC8Ex9t7sp5jNhT2Ei2ws>/getUserProfilePhotos`, {
        params: {
          user_id: userId,
          limit: 1
        }
      });

      const userName = response.data.result.user.first_name;
      const userAvatar = response.data.result.total_count > 0 ? response.data.result.photos[0][0].file_id : null;

      // Store user data in Firestore
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { name: userName, avatar: userAvatar }, { merge: true });

      return { userName, userAvatar };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
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

  const handleWalletClick = () => {
    router.push('/wallet');
  };  

  const handleLeaderboardClick = () => {
    router.push('/leaderboard');
  };

  const handleTasksClick = () => {
    router.push('/tasks');
  };

  const handleComingSoonClick = () => {
    setShowComingSoon(true);
    setTimeout(() => {
      setShowComingSoon(false);
    }, 2000);
  };

  const updateBalance = async (userId: string, balance: number) => {
    try {
      await axios.post('/api/updateBalance', {
        userId,
        balance
      });
      return true;
    } catch (error) {
      console.error('Failed to update balance:', error);
      return false;
    }
  };

  const renderFlyingNumbers = () => {
    return flyingNumbers.map(number => (
      <div
        key={number.id}
        className={styles.flyingNumber}
        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
      >
        +{number.amount}
      </div>
    ));
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>
      <div className={styles.statusItem}>
          <FontAwesomeIcon icon={faUser} size="2x" />
          <div>{userName}</div>
        </div>
        <div className={styles.statusItem}>
          <FontAwesomeIcon icon={faSackDollar} size="2x" />
            <span>{formatBalance(balance)} SLC</span>
        </div>
        <div className={styles.statusItem}>
          <FontAwesomeIcon icon={faBolt} size="2x" />
          <div>{clicksRemaining}</div>
        </div>
      </div>
      <div className={styles.mineArea} ref={miningAreaRef} onMouseDown={handleMineClick} onMouseUp={handleMineRelease} style={{ position: 'relative' }}>
        <Image src="/slcoin.PNG" alt="SLCoin" width={200} height={200} className={styles.pickaxe} id="pickaxe" />
        {flyingNumbers.map((number) => (
          <div key={number.id} className={styles.slcFlying}>
            +{number.amount}
          </div>
        ))}
      </div>
      <div className={styles.buttonContainer}>
      <button className={styles.actionButton} onClick={handleWalletClick}>
          <FontAwesomeIcon icon={faWallet} size="2x" />
          <div>Wallet</div>
        </button>
        <button className={styles.actionButton} onClick={handleTasksClick}>
          <FontAwesomeIcon icon={faTasks} size="2x" />
          <div>Tasks</div>
        </button>
        <button onClick={handleRechargeTool} className={styles.actionButton}>
          <FontAwesomeIcon icon={faBolt} size="2x" />
          <div>Recharge</div>
        </button>
        <button className={styles.actionButton} onClick={handleLeaderboardClick}>
          <FontAwesomeIcon icon={faTrophy} size="2x" />
          <div>Leaderboard</div>
        </button>
        <button className={styles.actionButton} onClick={handleComingSoonClick}>
          <FontAwesomeIcon icon={faRocket} size="2x" />
          <div>Boost</div>
        </button>
      </div>
      {showRewardAnimation && (
        <div className={styles.rewardAnimation}>
          <span>+{rewardedAmount}</span>
        </div>
      )}
      {showComingSoon && (
        <div className={styles.comingSoon}>
          Coming Soon!
        </div>
      )}
      <style jsx>{`
        .${styles.slcFlying} {
          position: absolute;
          animation: fly 2s ease-in-out forwards;
        }
        @keyframes fly {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;