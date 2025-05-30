require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth.routes');
const assetRoutes = require('./routes/asset.routes');
const baseRoutes = require('./routes/base.routes');
const transferRoutes = require('./routes/transfer.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { authenticateToken } = require('./middleware/auth.middleware');

const app = express();
const prisma = new PrismaClient();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://military-asset-management-system-chi.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Military Asset Management System API is running' });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', authenticateToken, assetRoutes);
app.use('/api/bases', authenticateToken, baseRoutes);
app.use('/api/transfers', authenticateToken, transferRoutes);
app.use('/api/purchases', authenticateToken, purchaseRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 