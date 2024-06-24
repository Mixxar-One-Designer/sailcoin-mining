import React from 'react';
import styles from '../styles/DailyLimit.module.css'; // Adjust the import path as necessary

const Tasks: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tasks Page</h1>
      <p className={styles.description}>Here you can find and manage your tasks.</p>
      <button className={styles.button}>Go to Tasks</button>
    </div>
  );
};

export default Tasks;