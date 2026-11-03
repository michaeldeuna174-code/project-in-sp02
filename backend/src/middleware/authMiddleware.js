const jwt = require('jsonwebtoken');

const SESSION_SECRET = process.env.SESSION_SECRET || 'cybersafe_default_dev_secret_2026';

/**
 * Middleware to require and verify administrator authentication.
 * Checks both HttpOnly cookie and Authorization Bearer header.
 */
function requireAdmin(req, res, next) {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.cybersafe_session) {
    token = req.cookies.cybersafe_session;
  }

  // 2. Check Authorization Header as fallback
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No active administrator session found.'
    });
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    req.admin = {
      id: decoded.id,
      username: decoded.username
    };
    next();
  } catch (err) {
    res.clearCookie('cybersafe_session');
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.'
    });
  }
}

module.exports = {
  requireAdmin
};
