const admin = require('firebase-admin');
const serviceAccount = require('../path/to/your-service-account-file.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  const { telegramId } = req.body;

  if (!telegramId) {
    return res.status(400).send('Telegram ID is required');
  }

  try {
    const customToken = await admin.auth().createCustomToken(telegramId);
    res.json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).send('Error creating custom token');
  }
};