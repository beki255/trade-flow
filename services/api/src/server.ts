import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth.routes';
import portalRoutes from './routes/portal.routes';
import matchingRoutes from './routes/matching.routes';
import { swaggerDocsHandler, swaggerJsonHandler } from './docs/swagger';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Base Health Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'TradeFlow API',
    timestamp: new Date().toISOString(),
    corridor: 'Djibouti-Modjo-Addis Ababa',
    docs: `http://localhost:${PORT}/api/docs`,
  });
});

// Swagger Documentation Endpoints
app.get('/api/docs', swaggerDocsHandler);
app.get('/docs', swaggerDocsHandler);
app.get('/api/docs/json', swaggerJsonHandler);

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/matching', matchingRoutes);

// Socket.io Real-Time Telematics Channel
io.on('connection', (socket) => {
  console.log('⚡ Client connected to TradeFlow live corridor stream:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server on all interfaces (0.0.0.0) so Expo Go on physical phones can connect
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 TradeFlow Backend API running on http://0.0.0.0:${PORT} (http://localhost:${PORT})`);
  console.log(`📑 Swagger Documentation available at http://localhost:${PORT}/api/docs`);
});
