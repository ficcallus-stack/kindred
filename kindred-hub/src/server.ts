import * as admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Load environment from the root .env.local if possible, or local .env
dotenv.config({ path: '../.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// 1. Database Initialization (Direct Neon Connection)
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// 2. Firebase Admin Initialization (For Handshake Security)
if (!getApps().length) {
  initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();

// 3. Socket Middleware: Token Verification (The Handshake)
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return next(new Error("Unauthenticated: Missing ID token"));
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    socket.data.user = decodedToken;
    console.log(`[HUB] Authenticated User: ${decodedToken.uid}`);
    next();
  } catch (err) {
    console.error("[HUB] Auth Error:", err);
    next(new Error("Unauthorized: Invalid ID token"));
  }
});

// 4. Connection Logic
io.on('connection', (socket) => {
  const userId = socket.data.user.uid;
  console.log(`[HUB] Socket Connected: ${socket.id} (User: ${userId})`);

  // Family Room Isolation
  socket.on('join_conversation', (convoId: string) => {
    socket.join(`room:${convoId}`);
    console.log(`[HUB] User ${userId} joined room: ${convoId}`);
  });

  // Real-time Messaging with Persistence
  socket.on('send_message', async ({ conversationId, content }: { conversationId: string; content: string }) => {
    try {
      console.log(`[HUB] Message from ${userId} to ${conversationId}: ${content}`);
      
      // OPTIONAL: Persistence to local DB (Matching schema.ts)
      // We will perform the DB write here so it's guaranteed even if the browser crashes
      /* 
      await db.insert(messages).values({
        id: crypto.randomUUID(),
        conversationId,
        senderId: userId,
        content,
        createdAt: new Date()
      });
      */

      // Broadcast to EVERYONE in the room (including the sender for confirm, or use callback)
      io.to(`room:${conversationId}`).emit('new_message', {
        senderId: userId,
        content,
        createdAt: new Date(),
      });
      
    } catch (err) {
      console.error("[HUB] Persistence Error:", err);
      socket.emit('error', 'Message failed to save');
    }
  });

  // Typing Indicators
  socket.on('typing_start', (convoId: string) => {
    socket.to(`room:${convoId}`).emit('user_typing', { userId, isTyping: true });
  });

  socket.on('typing_stop', (convoId: string) => {
    socket.to(`room:${convoId}`).emit('user_typing', { userId, isTyping: false });
  });

  socket.on('disconnect', () => {
    console.log(`[HUB] User disconnected: ${userId}`);
  });
});

// 5. Auto-Awake Ping Logic (For Hugging Face Spaces)
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Heartbeat tracker
setInterval(() => {
  const count = io.engine.clientsCount;
  if (count > 0) {
    console.log(`[HUB] Active Sockets: ${count}`);
  }
}, 30000);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[HUB] Kindred Realtime Hub running on port ${PORT}`);
});
