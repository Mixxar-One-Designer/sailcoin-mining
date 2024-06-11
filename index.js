// pages/index.js
import { useEffect } from 'react';
import authenticateWithTelegram from '../utils/auth';

export default function Home() {
  useEffect(() => {
    // Assuming you have the telegramId and displayName from your Telegram bot
    const telegramId = 'USER_TELEGRAM_ID';
    const displayName = 'USER_DISPLAY_NAME';
    authenticateWithTelegram(telegramId, displayName);
  }, []);

  return (
    <div>
      <h1>Welcome to the Sailcoin Mining Page</h1>
      {/* Your mining page content */}
    </div>
  );
}