require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const getNetworkIP = require('./utils/getNetworkIP');
const jokesRouter = require('./routes/jokes');

const app = express();

// ============================
// Middleware Configuration
// ============================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// Enable CORS
app.use(cors());

// Compress responses
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============================
// Static Files
// ============================

// Serve client files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// ============================
// API Routes
// ============================

// Mount jokes routes
app.use('/api/jokes', jokesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================
// Error Handling
// ============================

// 404 handler for API routes (must come before catch-all)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// ============================
// Catch-all for client-side routing
// ============================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ============================
// Server Startup
// ============================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Only start server if not in test environment
if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    const networkIP = getNetworkIP();
    console.log('\n🚀 Server is running!');
    console.log(`📍 Local:    http://localhost:${PORT}`);
    if (networkIP) {
      console.log(`📍 Network:  http://${networkIP}:${PORT}`);
    }
    console.log(`🌍 Environment: ${NODE_ENV}\n`);
  });
}

// Export app for testing
module.exports = app;
