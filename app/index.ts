import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import studentRoutes from './routes/studentRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import './firebase.js';
import logger from './utils/logger.js';
import authRouters from './routes/authRoute.js';
import teacherRouter from './routes/teacherRoute.js';
import attendanceRouter from './routes/attendanceRoute.js';
import gradeRouter from './routes/gradeRoute.js';
import circularRouter from './routes/circularRoute.js';
import subjectRouter from './routes/subjectRoute.js';
import timeTableRouter from './routes/timetableRoute.js';
import parentRouter from './routes/parentRoute.js';
import examResultRouter from './routes/examresultRoute.js';
import examTimeTableRouter from './routes/examTimeTableRoute.js';
import sectionRouter from './routes/sectionRoute.js';
import eventBlogRouter from './routes/eventBlogRoute.js';
import axios from 'axios';
import {
  generalLimiter,
  authLimiter,
  readLimiter,
  writeLimiter
} from './middlewares/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

// Compression middleware - compress responses for better performance on slow connections
app.use(compression({
  level: 6, // Compression level (1-9, 6 is a good balance)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other requests
    return compression.filter(req, res);
  }
}));

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: true }));

app.use((req, res, next) => {
  if (req.method === 'GET') {
    return readLimiter(req, res, next);
  } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  return generalLimiter(req, res, next);
});

// Apply stricter rate limiting to auth routes (login, signup, password reset)
app.use('/api/v1/auth', authLimiter, authRouters);

app.use('/students', studentRoutes);
app.use('/attendance', attendanceRouter);
app.use('/grades', gradeRouter);
app.use('/circulars', circularRouter);
app.use('/teachers', teacherRouter);
app.use('/timetables', timeTableRouter);
app.use('/parents', parentRouter);
app.use('/examresults', examResultRouter);
app.use('/exam-timetables', examTimeTableRouter);
app.use('/subjects', subjectRouter);
app.use('/sections', sectionRouter);
app.use('/event-blogs', eventBlogRouter);

app.get('/alive', (req, res) => {
  res.status(200).send('OK Backend alive');
});

app.listen(PORT, () => {
  logger.info(`Server running at ${process.env.VITE_BACKEND_API_URL}`);
  setInterval(async () => {
    try {
      const response = await axios.get(
        `${process.env.VITE_BACKEND_API_URL}/alive`
      );
      logger.info(
        `health check successful at ${new Date().toISOString()}:`,
        response.data
      );
    } catch (error) {
      logger.error('health check failed:', error);
    }
  }, 60 * 1000);
});
