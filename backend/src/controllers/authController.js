const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');

const SESSION_SECRET = process.env.SESSION_SECRET || 'cybersafe_default_dev_secret_2026';

/**
 * Administrator Login
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required.'
      });
    }

    const trimmedUsername = username.trim();
    const admin = await dbService.findAdminByUsername(trimmedUsername);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect username or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect username or password.'
      });
    }

    // Create session token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username
      },
      SESSION_SECRET,
      { expiresIn: '24h' }
    );

    // Set HttpOnly, Secure, SameSite Cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('cybersafe_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Check Current Admin Session
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const admin = await dbService.findAdminById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Administrator record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        created_at: admin.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Administrator Logout
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('cybersafe_session', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  me,
  logout
};
