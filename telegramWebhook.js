// telegramWebhook.js
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = '6897920395:AAEl4SH-ZdkLdYwC8Ex9t7sp5jNhT2Ei2ws';
const WEBHOOK_URL = 'https://your-domain.com/telegram-webhook';

app.post('/telegram-webhook', async (req, res) => {
  const message = req.body.message;

  if (message && message.text === '/start') {
    const telegramId = message.from.id;
    const displayName = `${message.from.first_name} ${message.from.last_name || ''}`.trim();
    const authUrl = `https://your-domain.com?telegramId=${telegramId}&displayName=${encodeURIComponent(displayName)}`;

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: telegramId,
      text: `Welcome! Click the link to start mining: ${authUrl}`
    });
  }

  res.sendStatus(200);
});

app.listen(3002, () => {
  console.log('Telegram webhook server running on port 3002');
});

axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`, {
  url: WEBHOOK_URL,
});