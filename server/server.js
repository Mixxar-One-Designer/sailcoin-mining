const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '../path/to/your-service-account-file.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(bodyParser.json());

// Create /create-firebase-token endpoint
app.post('/create-firebase-token', async (req, res) => {
  const { telegramId } = req.body;

  if (!telegramId) {
    return res.status(400).send('Telegram ID is required');
  }

  try {
    // Create a custom token
    const customToken = await admin.auth().createCustomToken(telegramId);
    res.json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).send('Error creating custom token');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});