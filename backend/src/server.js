require('dotenv').config();

const app = require('./app');
const { checkConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log('==================================================');
  console.log(`🛡️  CyberSafe Backend running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend URL: http://localhost:${PORT}/index.html`);
  console.log('==================================================');

  // Verify the database connection using a real query.
  const dbStatus = await checkConnection();
  if (dbStatus.ok) {
    console.log(`✅ Database Status: ${dbStatus.message} (${dbStatus.type})`);
  } else {
    console.warn(`⚠️  Database Status: ${dbStatus.error || dbStatus.message}`);
    console.warn('ℹ️  Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.');
    console.warn('ℹ️  Then run backend/schema.sql in the Supabase SQL Editor.');
    console.warn('ℹ️  Until then, the API uses the local development fallback data.');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the other process or set PORT in backend/.env.`);
  } else {
    console.error('❌ Backend server error:', err.message);
  }
  process.exit(1);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('CyberSafe backend stopped.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
