// server.js
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

app.post('/auth/telegram', async (req, res) => {
  const { telegramId, displayName } = req.body;

  if (!telegramId) {
    return res.status(400).send('Telegram ID is required');
  }

  try {
    const user = await admin.auth().updateUser(telegramId, {
      displayName: displayName,
    }).catch(async error => {
      if (error.code === 'auth/user-not-found') {
        return await admin.auth().createUser({
          uid: telegramId,
          displayName: displayName,
        });
      }
      throw error;
    });

    const token = await admin.auth().createCustomToken(user.uid);
    res.send({ token });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});