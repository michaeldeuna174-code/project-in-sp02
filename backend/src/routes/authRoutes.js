const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Rate limiting for login to prevent brute-force attacks: max 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many login attempts. Please wait 15 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/auth/login - Authenticate administrator
router.post('/login', loginLimiter, authController.login);

// GET /api/auth/me - Check current admin session (protected)
router.get('/me', requireAdmin, authController.me);

// POST /api/auth/logout - End admin session
router.post('/logout', authController.logout);

module.exports = router;
