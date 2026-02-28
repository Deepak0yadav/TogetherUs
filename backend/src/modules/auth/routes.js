import { Router } from 'express';
import passport from './passport.js';
import * as authService from './service.js';
import { createToken } from './jwt.js';

const router = Router();

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ...req.user, token: createToken(req.user.id) });
});

router.post('/logout', (req, res) => {
  req.logout(() => {});
  res.json({ ok: true });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existing = await authService.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const password_hash = await authService.hashPassword(password);
    const user = await authService.createUser({ email, name: name || email, password_hash });
    req.login(user, (err) => {
      if (err) {
        console.error('[auth] register session error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      res.status(201).json({ ...user, token: createToken(user.id) });
    });
  } catch (e) {
    console.error('[auth] register error:', e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await authService.findUserByEmail(email);
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await authService.verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    req.login({ id: user.id, email: user.email, name: user.name }, (err) => {
      if (err) {
        console.error('[auth] login session error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      res.json({ ...req.user, token: createToken(user.id) });
    });
  } catch (e) {
    console.error('[auth] login error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
