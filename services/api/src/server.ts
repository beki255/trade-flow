import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth.routes';
import portalRoutes from './routes/portal.routes';
import matchingRoutes from './routes/matching.routes';
import trackingRoutes from './routes/tracking.routes';
import pricingRoutes from './routes/pricing.routes';
import optimizationRoutes from './routes/optimization.routes';
import customsRoutes from './routes/customs.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';
import forwarderRoutes from './routes/forwarder.routes';
import { swaggerDocsHandler, swaggerJsonHandler } from './docs/swagger';

dotenv.config();

// TradeFlow API Server - Initialized with complete OpenAPI 3.0 specs & real-time compliance
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.set('io', io);

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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
app.use('/api/tracking', trackingRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/customs', customsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/forwarder', forwarderRoutes);

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
