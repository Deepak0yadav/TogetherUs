import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './modules/auth/passport.js';
import authRoutes from './modules/auth/routes.js';
import roomRoutes from './modules/room/routes.js';
import sessionRoutes from './modules/room/session-routes.js';
import coupleRoutes from './modules/auth/couple-routes.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'togetheros-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/couples', coupleRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms', sessionRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

export { app };
