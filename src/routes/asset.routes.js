const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authorizeRole, authorizeBaseAccess } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// Validation middleware
const validateAsset = [
  body('serialNumber').notEmpty().withMessage('Serial number is required'),
  body('type').isIn(['VEHICLE', 'WEAPON', 'AMMUNITION', 'OTHER']).withMessage('Invalid asset type'),
  body('name').notEmpty().withMessage('Name is required'),
  body('baseId').isUUID().withMessage('Invalid base ID'),
  body('status').isIn(['AVAILABLE', 'ASSIGNED', 'EXPENDED', 'IN_TRANSIT']).withMessage('Invalid status')
];

// Get all assets (with filters)
router.get('/', authorizeBaseAccess, async (req, res, next) => {
  try {
    const { baseId, type, status, startDate, endDate } = req.query;
    
    const where = {};
    if (baseId) where.baseId = baseId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        base: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(assets);
  } catch (error) {
    next(error);
  }
});

// Get asset by ID
router.get('/:id', authorizeBaseAccess, async (req, res, next) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        base: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        transfers: {
          include: {
            sourceBase: true,
            destBase: true
          }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    next(error);
  }
});

// Create new asset
router.post('/', validateAsset, authorizeRole('ADMIN', 'LOGISTICS_OFFICER'), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await prisma.asset.create({
      data: req.body,
      include: {
        base: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'ASSET',
        entityId: asset.id,
        userId: req.user.id,
        details: req.body
      }
    });

    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

// Update asset
router.put('/:id', validateAsset, authorizeRole('ADMIN', 'LOGISTICS_OFFICER'), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        base: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'ASSET',
        entityId: asset.id,
        userId: req.user.id,
        details: req.body
      }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
});

// Assign asset to user
router.post('/:id/assign', authorizeRole('ADMIN', 'BASE_COMMANDER'), async (req, res, next) => {
  try {
    const { assignedToId } = req.body;

    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: {
        assignedToId,
        status: 'ASSIGNED'
      },
      include: {
        base: true,
        assignedTo: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ASSIGN',
        entityType: 'ASSET',
        entityId: asset.id,
        userId: req.user.id,
        details: { assignedToId }
      }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
});

// Mark asset as expended
router.post('/:id/expend', authorizeRole('ADMIN', 'BASE_COMMANDER'), async (req, res, next) => {
  try {
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: {
        status: 'EXPENDED'
      },
      include: {
        base: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'EXPEND',
        entityType: 'ASSET',
        entityId: asset.id,
        userId: req.user.id,
        details: { status: 'EXPENDED' }
      }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 