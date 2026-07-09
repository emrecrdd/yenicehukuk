import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { app } from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { setIo } from './modules/notifications/notification.service.js';

const PORT = config.PORT || process.env.PORT || 5000;

// HTTP Server
const httpServer = createServer(app);

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.CLIENT_URL,
    credentials: true,
  },
});

// Socket Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    logger.warn('🔴 Socket connection rejected: No token');
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    socket.userId = decoded.id;

    next();
  } catch (error) {
    logger.warn(`🔴 Invalid socket token: ${error.message}`);
    next(new Error('Authentication error'));
  }
});

// Socket Events
io.on('connection', (socket) => {
  logger.info(`🟢 Socket connected: ${socket.userId} (${socket.id})`);

  socket.join(`user-${socket.userId}`);

  socket.on('join', ({ userId }) => {
    if (!userId) return;

    socket.join(`user-${userId}`);

    logger.info(`📥 User joined room: ${userId}`);
  });

  socket.on('ping', (callback) => {
    callback?.({
      pong: true,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    logger.info(`🔴 Socket disconnected: ${socket.userId}`);
  });

  socket.on('error', (error) => {
    logger.error('Socket Error:', error);
  });
});

// Notification Service
setIo(io);
app.set('io', io);

// Server
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server listening on port ${PORT}`);
  logger.info(`📚 Environment: ${config.NODE_ENV}`);

  if (config.NODE_ENV === 'development') {
    logger.info(`🏠 Local: http://localhost:${PORT}`);
    logger.info(`❤️ Health: http://localhost:${PORT}/health`);
  }
});

// Graceful Shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Closing server...`);

  httpServer.close(() => {
    logger.info('✅ HTTP Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));