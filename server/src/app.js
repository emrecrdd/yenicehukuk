import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { connectDB } from './config/database.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { clientRoutes } from './modules/clients/client.routes.js';
import { caseRoutes } from './modules/cases/case.routes.js';
import { casePartyRoutes } from './modules/case-parties/case-party.routes.js';
import { documentRoutes } from './modules/documents/document.routes.js';
import { taskRoutes } from './modules/tasks/task.routes.js';
import { financeRoutes } from './modules/finance/finance.routes.js';
import { searchRoutes } from './modules/search/search.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { eventRoutes } from './modules/events/event.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js'; 
import { meetingRoutes } from './modules/meetings/meeting.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { reminderJob } from './jobs/reminder.job.js';
import { auditLogRoutes } from './modules/audit-logs/audit-log.routes.js';
import { powerOfAttorneyRoutes } from './modules/power-of-attorney/powerOfAttorney.routes.js';
import { templateRoutes } from './modules/templates/template.routes.js';  // ✅ EKLENDI

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ CORS - GÜNCELLENDI (Netlify için)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://yenicehukuk.netlify.app',
  'https://www.yenicehukuk.netlify.app',
  config.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || config.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Legal System API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/case-parties', casePartyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/power-of-attorney', powerOfAttorneyRoutes);
app.use('/api/templates', templateRoutes);  // ✅ EKLENDI

// ✅ REMINDER JOB'U BAŞLAT
try {
  reminderJob.start();
  console.log('✅ Reminder jobs started successfully');
} catch (error) {
  console.error('❌ Reminder jobs failed to start:', error);
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Database Connection
connectDB();

export { app };