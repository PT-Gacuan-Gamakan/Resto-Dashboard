import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { DatabaseService } from './services/database.service';
import { MQTTService } from './mqtt/mqtt.service';
import { createRouter } from './api/routes';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.BACKEND_PORT || '4000');

async function startServer() {
  // Initialize services
  const dbService = new DatabaseService();
  await dbService.initialize();

  const mqttService = new MQTTService(dbService);
  await mqttService.connect();

  // Create Express app
  const app = express();
  const httpServer = createServer(app);

  // Setup Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use(createRouter(dbService, mqttService));

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send initial data
    dbService.getCurrentStatus().then(data => {
      socket.emit('dashboard:update', data);
    });

    dbService.getTodayHourlyStats().then(stats => {
      socket.emit('stats:hourly', stats);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Listen to MQTT events and broadcast to all connected clients
  mqttService.onEvent(async (event) => {
    // Broadcast real-time event
    io.emit('visitor:event', event);

    // Broadcast updated dashboard data
    const dashboardData = await dbService.getCurrentStatus();
    io.emit('dashboard:update', dashboardData);

    // Broadcast updated hourly stats
    const hourlyStats = await dbService.getTodayHourlyStats();
    io.emit('stats:hourly', hourlyStats);
  });

  // Start server
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Backend running on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    console.log(`[Server] Dashboard API: http://localhost:${PORT}/api/dashboard`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[Server] Shutting down gracefully...');
    mqttService.disconnect();
    await dbService.disconnect();
    httpServer.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start the application
startServer().catch((error) => {
  console.error('[Server] Failed to start:', error);
  process.exit(1);
});
