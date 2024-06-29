import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import styles from '../styles/Leaderboard.module.css';

interface User {
  id: string;
  balance: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('balance', 'desc'), limit(100000));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          balance: doc.data().balance,
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Leaderboard</h1>
      <div className={styles.table}>
        <div className={styles.header}>
          <div className={styles.rank}>Rank</div>
          <div className={styles.userId}>User ID</div>
          <div className={styles.balance}>Balance (SLC)</div>
        </div>
        {users.map((user, index) => (
          <div key={user.id} className={styles.row}>
            <div className={styles.rank}>{index + 1}</div>
            <div className={styles.userId}>{user.id}</div>
            <div className={styles.balance}>{user.balance.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;