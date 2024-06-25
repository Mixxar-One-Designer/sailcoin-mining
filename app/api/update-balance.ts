import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

const updateBalance = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { user_id, balance } = req.body;

    if (!user_id || balance === undefined) {
      return res.status(400).json({ error: 'Missing user_id or balance' });
    }

    try {
      const userRef = doc(db, 'users', user_id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, { balance });
      } else {
        await setDoc(userRef, { balance });
      }

      return res.status(200).json({ success: true, balance });
    } catch (error) {
      console.error('Error updating balance:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};

// Assign the function to a variable before exporting
const handler = updateBalance;
export default handler;