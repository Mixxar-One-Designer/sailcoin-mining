import React from 'react';
import styles from './DailyLimit.module.css'; // Adjust the import path as necessary

const DailyLimit: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Daily Limit Information</h1>
      <p>This is where you can provide information about the daily limit and how it works.</p>
    </div>
  );
};

export default DailyLimit;