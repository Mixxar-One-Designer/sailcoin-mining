// pages/api/update-balance.js
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, balance } = req.body;

    if (!user_id || typeof balance !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      const userRef = doc(db, 'users', user_id);
      await updateDoc(userRef, { balance });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating balance:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}