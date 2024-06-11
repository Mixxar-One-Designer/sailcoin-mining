// utils/telegramBotWebhook.js

const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://<YOUR_FIREBASE_PROJECT_ID>.firebaseio.com'
  });
}

const db = admin.firestore();

const bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN');

bot.start(async (ctx) => {
  const userId = ctx.from.id.toString();
  const userDoc = db.collection('users').doc(userId);

  const doc = await userDoc.get();
  if (!doc.exists) {
    await userDoc.set({
      userId: userId,
      balance: 0,
      mining: false,
      referralCount: 0
    });
  }

  ctx.reply('Welcome to Sailcoin Mining! Click the button below to start mining.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Let's Go", callback_data: 'start_mining' }],
        [{ text: 'Join Sailcoin Community', url: 'https://t.me/salcoin_dot' }],
        [{ text: 'Referral Earning', callback_data: 'referral_earning' }]
      ]
    }
  });
});

bot.action('start_mining', async (ctx) => {
  const userId = ctx.from.id.toString();
  const userDoc = db.collection('users').doc(userId);

  const userData = await userDoc.get();
  if (!userData.exists) {
    ctx.reply('You need to start the bot first by sending /start command.');
    return;
  }

  await userDoc.update({ mining: true });

  ctx.reply('Starting mining...');

  // Simulate mining process
  const miningInterval = setInterval(async () => {
    const user = await userDoc.get();
    if (!user.exists || !user.data().mining) {
      clearInterval(miningInterval);
      return;
    }

    await userDoc.update({ balance: admin.firestore.FieldValue.increment(1) });
    const newBalance = (await userDoc.get()).data().balance;
    ctx.reply(`Mining in progress... Current SLC balance: ${newBalance}`);
  }, 2000); // Adjust the interval as needed
});

bot.action('referral_earning', async (ctx) => {
  const userId = ctx.from.id.toString();
  const referralLink = `https://t.me/sailcoin_bot?start=${userId}`;

  ctx.reply(`Share this referral link with your friends: ${referralLink}`);
});

module.exports = bot;