import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

const updateBalance = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Request Body:', req.body);

  if (req.method === 'POST') {
    const { user_id, balance } = req.body;

    if (!user_id || typeof balance !== 'number') {
      return res.status(400).json({ error: 'Invalid user_id or balance' });
    }

    try {
      const userRef = doc(db, 'users', user_id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, { balance });
      } else {
        await setDoc(userRef, { balance });
      }

      const updatedUserDoc = await getDoc(userRef);
      console.log('Updated User Data:', updatedUserDoc.data());
      return res.status(200).json({ success: true, data: updatedUserDoc.data() });
      
    } catch (error: any) {
      console.error('Error updating balance:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default updateBalance;