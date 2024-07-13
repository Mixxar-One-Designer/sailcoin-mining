import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import axios from 'axios';
import { auth } from '../firebase';

const useAuth = (telegramId) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        if (telegramId) {
          try {
            const response = await axios.post('/api/create-firebase-token', { telegramId });
            const { token } = response.data;
            await signInWithCustomToken(auth, token);
          } catch (error) {
            console.error('Error signing in with custom token:', error);
          }
        } else {
          signInAnonymously(auth).catch((error) => {
            console.error('Error signing in anonymously:', error);
          });
        }
      }
    });

    return () => unsubscribe();
  }, [telegramId]);

  return user;
};

export default useAuth;