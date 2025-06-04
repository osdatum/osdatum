import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

// Inisialisasi Firebase Admin hanya sekali
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync('/etc/secrets/serviceAccountKey.json', 'utf8')
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}


const router = express.Router();

router.post('/', async (req, res) => {
  const { idToken, mode } = req.body;
  console.log('FirebaseAuth POST:', { mode, idToken: !!idToken });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decoded;

    // Get Firestore instance
    const db = admin.firestore();
    const usersRef = db.collection('users');
    // Check if user exists in Firestore
    const userDoc = await usersRef.where('email', '==', email).get();

    if (userDoc.empty) {
      if (mode === 'register') {
        // Register: create new user in Firestore
        const newUser = {
          email,
          name,
          picture,
          googleId: uid,
          subscriptionType: 'free',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await usersRef.add(newUser);
      } else {
        // Login: reject if not registered
        return res.status(401).json({ error: 'Email belum terdaftar. Silakan register terlebih dahulu.' });
      }
    }

    // Sign custom JWT using the Firebase User ID (uid)
    const token = jwt.sign(
      { userId: uid, email: email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Signed custom JWT with userId:', uid);

    res.json({ 
      token,
      expiresIn: 3600, // 1 hour in seconds
      message: 'Token will expire in 1 hour'
    });
  } catch (error) {
    console.error('FirebaseAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
