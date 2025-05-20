const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authorizeRole } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// Validation middleware
const validateBase = [
  body('name').notEmpty().withMessage('Base name is required'),
  body('location').notEmpty().withMessage('Location is required')
];

// Get all bases
router.get('/', async (req, res, next) => {
  try {
    const bases = await prisma.base.findMany({
      include: {
        _count: {
          select: {
            assets: true,
            users: true
          }
        }
      }
    });

    res.json(bases);
  } catch (error) {
    next(error);
  }
});

// Get base by ID
router.get('/:id', async (req, res, next) => {
  try {
    const base = await prisma.base.findUnique({
      where: { id: req.params.id },
      include: {
        assets: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!base) {
      return res.status(404).json({ message: 'Base not found' });
    }

    res.json(base);
  } catch (error) {
    next(error);
  }
});

// Create new base
router.post('/', validateBase, authorizeRole('ADMIN'), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const base = await prisma.base.create({
      data: req.body
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'BASE',
        entityId: base.id,
        userId: req.user.id,
        details: req.body
      }
    });

    res.status(201).json(base);
  } catch (error) {
    next(error);
  }
});

// Update base
router.put('/:id', validateBase, authorizeRole('ADMIN'), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const base = await prisma.base.update({
      where: { id: req.params.id },
      data: req.body
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'BASE',
        entityId: base.id,
        userId: req.user.id,
        details: req.body
      }
    });

    res.json(base);
  } catch (error) {
    next(error);
  }
});

// Get base statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const baseId = req.params.id;

    const [
      assetCounts,
      transferStats,
      purchaseStats
    ] = await Promise.all([
      // Get asset counts by status
      prisma.asset.groupBy({
        by: ['status'],
        where: { baseId },
        _count: true
      }),
      // Get transfer statistics
      prisma.transfer.groupBy({
        by: ['status'],
        where: {
          OR: [
            { sourceBaseId: baseId },
            { destBaseId: baseId }
          ]
        },
        _count: true
      }),
      // Get purchase statistics
      prisma.purchase.aggregate({
        where: { baseId },
        _sum: {
          quantity: true,
          totalAmount: true
        },
        _count: true
      })
    ]);

    res.json({
      assets: assetCounts,
      transfers: transferStats,
      purchases: {
        totalPurchases: purchaseStats._count,
        totalQuantity: purchaseStats._sum.quantity,
        totalAmount: purchaseStats._sum.totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 