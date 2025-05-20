const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authorizeRole, authorizeBaseAccess } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// Validation middleware
const validatePurchase = [
  body('date').isISO8601().withMessage('Invalid date'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
  body('baseId').isUUID().withMessage('Invalid base ID'),
  body('assets').isArray().withMessage('Assets must be an array'),
  body('assets.*.serialNumber').notEmpty().withMessage('Serial number is required'),
  body('assets.*.type').isIn(['VEHICLE', 'WEAPON', 'AMMUNITION', 'OTHER']).withMessage('Invalid asset type'),
  body('assets.*.name').notEmpty().withMessage('Name is required')
];

// Get all purchases (with filters)
router.get('/', authorizeBaseAccess, async (req, res, next) => {
  try {
    const { baseId, startDate, endDate } = req.query;
    
    const where = {};
    if (baseId) where.baseId = baseId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        base: true,
        assets: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(purchases);
  } catch (error) {
    next(error);
  }
});

// Get purchase by ID
router.get('/:id', authorizeBaseAccess, async (req, res, next) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: req.params.id },
      include: {
        base: true,
        assets: true
      }
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    next(error);
  }
});

// Create new purchase
router.post('/', validatePurchase, authorizeRole('ADMIN', 'LOGISTICS_OFFICER'), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, quantity, unitPrice, baseId, assets } = req.body;
    const totalAmount = quantity * unitPrice;

    // Start a transaction
    const purchase = await prisma.$transaction(async (prisma) => {
      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          date: new Date(date),
          quantity,
          unitPrice,
          totalAmount,
          baseId
        }
      });

      // Create assets
      const createdAssets = await Promise.all(
        assets.map(asset =>
          prisma.asset.create({
            data: {
              ...asset,
              status: 'AVAILABLE',
              baseId,
              purchaseId: purchase.id
            }
          })
        )
      );

      return {
        ...purchase,
        assets: createdAssets
      };
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PURCHASE',
        entityType: 'PURCHASE',
        entityId: purchase.id,
        userId: req.user.id,
        details: {
          quantity,
          unitPrice,
          totalAmount,
          baseId,
          assetCount: assets.length
        }
      }
    });

    res.status(201).json(purchase);
  } catch (error) {
    next(error);
  }
});

// Get purchase statistics
router.get('/stats/summary', authorizeRole('ADMIN', 'BASE_COMMANDER'), async (req, res, next) => {
  try {
    const { baseId, startDate, endDate } = req.query;
    
    const where = {};
    if (baseId) where.baseId = baseId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const stats = await prisma.purchase.aggregate({
      where,
      _sum: {
        quantity: true,
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    res.json({
      totalPurchases: stats._count.id,
      totalQuantity: stats._sum.quantity,
      totalAmount: stats._sum.totalAmount
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 