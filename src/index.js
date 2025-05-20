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

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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