"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, getDocs } from "firebase/firestore";
import styles from '../../styles/Leaderboard.module.css';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<{ id: string; balance: number }[]>([]);
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

  const handleHomeClick = () => {
    router.push('/'); // Navigate to home page
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Leaderboard</h1>
      <ul className={styles.leaderboardList}>
        {users.length > 0 ? users.map((user, index) => (
          <li key={user.id} className={styles.leaderboardItem}>
            <span className={styles.userId}>{index + 1}. {user.id}</span>
            <strong className={styles.userBalance}>{user.balance} SLC</strong>
          </li>
        )) : <p>No users found.</p>}
      </ul>

      <div className={styles.homeButton} onClick={handleHomeClick}>
        <Link href="/" passHref>
          <div>Home</div>
        </Link>
      </div>
    </div>
  );
};

export default Leaderboard;