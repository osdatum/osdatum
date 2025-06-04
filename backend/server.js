import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./api/auth.js";
import userRoutes from "./api/user.js"; // Contains /access, /purchase/grid, /subscribe
import firebaseAuthRoutes from "./routes/firebaseAuth.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import subscriptionRoutes from "./routes/subscription.js";
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync('/etc/secrets/serviceAccountKey.json', 'utf8')
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

}

console.log("OSDATUM Backend Starting...");

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://osdatum-app.vercel.app'
  ],
  credentials: true
}));

app.options('*', cors());

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authenticateToken, userRoutes); // Apply authenticateToken to all user routes
app.use("/api/auth/firebase", firebaseAuthRoutes);
app.use("/api/subscription", subscriptionRoutes);

// REMOVE TEMPORARY Endpoint to manually create purchase data in Firestore
// REMOVE THIS IN PRODUCTION
// app.get('/test/create-purchase/:userId/:gridId', async (req, res) => { ... }); // Removed endpoint

// REMOVE Purchase grid endpoint (now in src/api/user.js)
// app.post('/api/user/purchase/grid', authenticateToken, async (req, res) => { ... }); // Removed endpoint

// REMOVE Get user's purchased grids (now in src/api/user.js via /access)
// app.get('/api/user/purchased-grids', authenticateToken, async (req, res) => { ... }); // Removed endpoint

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start server
/*global process*/ // Allow process.env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
