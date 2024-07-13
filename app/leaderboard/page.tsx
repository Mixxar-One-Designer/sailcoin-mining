'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, getDocs } from "firebase/firestore";
import styles from '../../styles/Leaderboard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy } from '@fortawesome/free-solid-svg-icons';

interface User {
  id: string;
  balance: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userDocs = await getDocs(usersCollection);
        const userData = userDocs.docs.map(doc => ({
          id: doc.id,
          balance: doc.data().balance,
        }));

        const filteredUsers = userData.filter(user => user.id !== 'testUser123');
        const sortedUsers = filteredUsers.sort((a, b) => b.balance - a.balance);
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (typeof window !== 'undefined') {
      fetchUsers();
    }
  }, []);

  const formatBalance = (balance: number): string => {
    if (balance < 1000000) {
      return balance.toLocaleString();
    } else if (balance < 1000000000) {
      return (balance / 1000000).toFixed(1) + 'M';
    } else {
      return (balance / 1000000000).toFixed(1) + 'B';
    }
  };

  const handleHomeClick = () => {
    router.push('/'); // Navigate to home page
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleHomeClick}>
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </button>
        <h1 className={styles.title}>
          <FontAwesomeIcon icon={faTrophy} size="lg" /> Leaderboard
        </h1>
      </div>
      <ul className={styles.leaderboardList}>
        {users.length > 0 ? users.map((user, index) => (
          <li key={user.id} className={styles.leaderboardItem}>
            <span className={styles.userId}>{index + 1}. {user.id}</span>
            <strong className={styles.userBalance}>{formatBalance(user.balance)} SLC</strong>
          </li>
        )) : <p>No users found.</p>}
      </ul>
    </div>
  );
};

export default Leaderboard;