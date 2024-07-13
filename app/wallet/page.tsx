'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Wallet.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faWallet, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image'; // Import Image from next/image

const Wallet: React.FC = () => {
  const router = useRouter();
  const [buttonText, setButtonText] = useState('Connect Your Wallet');
  const [showIcon, setShowIcon] = useState(true); // State to handle icon visibility

  useEffect(() => {
    const createBubble = () => {
      const bubble = document.createElement('div');
      bubble.className = styles.bubble;
      bubble.style.left = `${Math.random() * 100}%`;
      document.body.appendChild(bubble);

      setTimeout(() => {
        bubble.remove();
      }, 10000);
    };

    const bubbleInterval = setInterval(createBubble, 300);

    return () => clearInterval(bubbleInterval);
  }, []);

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleButtonClick = () => {
    setShowIcon(false);
    setButtonText('Coming Soon');
    setTimeout(() => {
      setButtonText('Connect Your Wallet');
      setShowIcon(true);
    }, 1000); // Revert the text after 1 second
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleHomeClick}>
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </button>
        <h1 className={styles.title}>
          <FontAwesomeIcon icon={faWallet} size="lg" /> Wallet
        </h1>
      </div>
      <div className={styles.walletContent}>
        <button className={styles.walletButton} onClick={handleButtonClick}>
          {showIcon && (
            <Image src="/bnb.png" alt="BNB Icon" width={24} height={24} className={styles.icon} />
          )}
          {buttonText} <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <style jsx>{`
        .${styles.bubble} {
          position: absolute;
          bottom: 0;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: bubbleAnimation 10s linear infinite;
          z-index: 1;
        }

        @keyframes bubbleAnimation {
          0% {
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(-1000px) scale(1.5);
          }
        }

        .${styles.walletButton} {
          background-color: white;
          color: black;
          padding: 15px 30px;
          font-size: 20px;
          font-weight: bold;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background-color 0.3s ease;
        }

        .${styles.walletButton}:hover {
          background-color: #4caf50; /* Green hover color */
          color: white; /* Change text color on hover */
        }
      `}</style>
    </div>
  );
};

export default Wallet;