// pages/api/telegramWebhook.js

import bot from '../../utils/telegramBotWebhook';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body, res);
    } catch (error) {
      console.error('Error handling Telegram update:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}