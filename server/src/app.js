const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const doorRoutes = require('./routes/doorRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const accessRoutes = require('./routes/accessRoutes');
const logRoutes = require('./routes/logRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Trop de requêtes. Veuillez réessayer plus tard.' }
});
app.use('/api', globalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Système de Gestion des Badges - API opérationnelle ✅', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/doors', doorRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
