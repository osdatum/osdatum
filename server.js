import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import authRoutes from './src/api/auth.js';
import userRoutes from './src/api/user.js';
import firebaseAuthRoutes from './src/routes/firebaseAuth.js';
import { authenticateToken } from './src/middleware/authMiddleware.js';
import subscriptionRoutes from './src/routes/subscription.js';

// Initialize Firebase Admin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  console.log('Initializing Firebase Admin...');
  // Check if we're in production (Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Using Firebase service account from environment variable');
    // Use service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.log('Using local service account file');
    // Use local service account file
    const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');
    console.log('Service account path:', serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath)
    });
  }
  console.log('Firebase Admin initialized successfully');
}

console.log('OSDATUM Backend Starting...');
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
  PORT: process.env.PORT || 3000
});

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://osdatum.vercel.app',
      'https://osdatum-app.vercel.app',
      'https://osdatum-git-main-osdatum.vercel.app',
      'https://osdatum-git-dev-osdatum.vercel.app',
      'https://osdatum-app.onrender.com',
      /^https:\/\/osdatum.*\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.onrender\.com$/
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/auth/firebase', firebaseAuthRoutes);
app.use('/api/subscription', subscriptionRoutes);

// REMOVE TEMPORARY Endpoint to manually create purchase data in Firestore
// REMOVE THIS IN PRODUCTION
// app.get('/test/create-purchase/:userId/:gridId', async (req, res) => { ... }); // Removed endpoint

// REMOVE Purchase grid endpoint (now in src/api/user.js)
// app.post('/api/user/purchase/grid', authenticateToken, async (req, res) => { ... }); // Removed endpoint

// REMOVE Get user's purchased grids (now in src/api/user.js via /access)
// app.get('/api/user/purchased-grids', authenticateToken, async (req, res) => { ... }); // Removed endpoint

// Error handling middleware
app.use((err, req, res) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 