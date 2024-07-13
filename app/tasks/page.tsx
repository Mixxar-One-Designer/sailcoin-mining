'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTasks, faCoins } from '@fortawesome/free-solid-svg-icons';
import { faTelegram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import styles from '../../styles/Tasks.module.css';
import { db } from '../../lib/firebase'; // Adjust path as per your project structure
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<string[]>([]);
  const [claimable, setClaimable] = useState<{ [key: string]: boolean }>({
    telegram: false,
    twitter: false,
    youtube: false,
  });
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({
    telegram: false,
    twitter: false,
    youtube: false,
  });
  const [showFlyingReward, setShowFlyingReward] = useState(false);
  const [balanceUpdated, setBalanceUpdated] = useState(false); // State to track balance update

  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      setTasks(['Task 1', 'Task 2', 'Task 3']);
    };

    fetchTasks();

    const completedTasks = {
      telegram: localStorage.getItem('task_telegram') === 'true',
      twitter: localStorage.getItem('task_twitter') === 'true',
      youtube: localStorage.getItem('task_youtube') === 'true',
    };
    setCompletedTasks(completedTasks);
  }, []);

  // Function to fetch user balance from Firebase
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const userId = queryParams.get('userId') || 'testUser123'; // Replace with actual user ID logic
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData) {
            setClaimable({
              telegram: !completedTasks.telegram,
              twitter: !completedTasks.twitter,
              youtube: !completedTasks.youtube,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    };

    fetchBalance();
  }, [completedTasks]);

  const handleHomeClick = () => {
    router.push('/');
  };

  const handlePlatformClick = (platform: 'telegram' | 'twitter' | 'youtube') => {
    const platforms = {
      telegram: 'https://t.me/salcoin_dot',
      twitter: 'https://x.com/sailcoinslc',
      youtube: 'https://www.youtube.com/@Sailcoinslc',
    };

    window.open(platforms[platform], '_blank');
    setClaimable((prev) => ({ ...prev, [platform]: true }));
  };

  const handleClaimClick = async (platform: 'telegram' | 'twitter' | 'youtube') => {
    if (claimable[platform]) {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const userId = queryParams.get('userId') || 'testUser123'; // Replace with actual user ID logic
        const userRef = doc(db, 'users', userId);
        
        // Fetch user document to get current balance
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.balance !== undefined) {
            const currentBalance = userData.balance;
            
            // Update balance in Firestore
            await updateDoc(userRef, {
              balance: currentBalance + 10000, // Update balance with reward amount
            });
            
            setShowFlyingReward(true);
            setTimeout(() => {
              setShowFlyingReward(false);
              router.push('/');
            }, 2000);
            
            // Mark task as completed and save in localStorage
            setCompletedTasks((prev) => ({ ...prev, [platform]: true }));
            localStorage.setItem(`task_${platform}`, 'true');
          }
        } else {
          console.error('User document not found');
        }
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };  

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleHomeClick}>
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </button>
        <h1 className={styles.title}>
          <FontAwesomeIcon icon={faTasks} size="lg" /> Tasks
        </h1>
      </div>
      <div className={styles.tasksList}>
        <div className={styles.task}>
          <button
            className={`${styles.platformButton} ${completedTasks.telegram ? styles.completed : ''}`}
            onClick={() => handlePlatformClick('telegram')}
            disabled={completedTasks.telegram}
          >
            <FontAwesomeIcon icon={faTelegram} size="lg" /> Join Telegram
          </button>
          <button
            className={`${styles.claimButton} ${claimable.telegram ? styles.active : ''}`}
            onClick={() => handleClaimClick('telegram')}
            disabled={!claimable.telegram || completedTasks.telegram}
          >
            <FontAwesomeIcon icon={faCoins} /> Claim 10000 SLC
          </button>
        </div>
        <div className={styles.task}>
          <button
            className={`${styles.platformButton} ${completedTasks.twitter ? styles.completed : ''}`}
            onClick={() => handlePlatformClick('twitter')}
            disabled={completedTasks.twitter}
          >
            <FontAwesomeIcon icon={faTwitter} size="lg" /> Follow on Twitter
          </button>
          <button
            className={`${styles.claimButton} ${claimable.twitter ? styles.active : ''}`}
            onClick={() => handleClaimClick('twitter')}
            disabled={!claimable.twitter || completedTasks.twitter}
          >
            <FontAwesomeIcon icon={faCoins} /> Claim 10000 SLC
          </button>
        </div>
        <div className={styles.task}>
          <button
            className={`${styles.platformButton} ${completedTasks.youtube ? styles.completed : ''}`}
            onClick={() => handlePlatformClick('youtube')}
            disabled={completedTasks.youtube}
          >
            <FontAwesomeIcon icon={faYoutube} size="lg" /> Subscribe on YouTube
          </button>
          <button
            className={`${styles.claimButton} ${claimable.youtube ? styles.active : ''}`}
            onClick={() => handleClaimClick('youtube')}
            disabled={!claimable.youtube || completedTasks.youtube}
          >
            <FontAwesomeIcon icon={faCoins} /> Claim 10000 SLC
          </button>
        </div>
      </div>
      {showFlyingReward && <div className={styles.flyingReward}>+10,000 SLC</div>}
    </div>
  );
};

export default Tasks;