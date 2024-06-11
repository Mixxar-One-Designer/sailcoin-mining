// utils/auth.js
import { auth } from '../firebase';
import axios from 'axios';

const authenticateWithTelegram = async (telegramId, displayName) => {
  try {
    const response = await axios.post('/auth/telegram', { telegramId, displayName });
    const { token } = response.data;
    await auth.signInWithCustomToken(token);
    console.log('User signed in with custom token');
  } catch (error) {
    console.error('Error authenticating with Telegram:', error);
  }
};

export default authenticateWithTelegram;