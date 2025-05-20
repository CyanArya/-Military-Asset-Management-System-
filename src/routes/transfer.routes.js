const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authorizeRole, authorizeBaseAccess } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// Validation middleware
const validateTransfer = [
  body('assetId').isUUID().withMessage('Invalid asset ID'),
  body('sourceBaseId').isUUID().withMessage('Invalid source base ID'),
  body('destBaseId').isUUID().withMessage('Invalid destination base ID'),
  body('transferDate').isISO8601().withMessage('Invalid transfer date'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// Get all transfers (with filters)
router.get('/', authorizeBaseAccess, async (req, res, next) => {
  try {
    const { sourceBaseId, destBaseId, startDate, endDate } = req.query;
    
    const where = {};
    if (sourceBaseId) where.sourceBaseId = sourceBaseId;
    if (destBaseId) where.destBaseId = destBaseId;
    if (startDate || endDate) {
      where.transferDate = {};
      if (startDate) where.transferDate.gte = new Date(startDate);
      if (endDate) where.transferDate.lte = new Date(endDate);
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        asset: true,
        sourceBase: true,
        destBase: true
      },
      orderBy: {
        transferDate: 'desc'
      }
    });

    res.json(transfers);
  } catch (error) {
    next(error);
  }
});

// Get transfer by ID
router.get('/:id', authorizeBaseAccess, async (req, res, next) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: req.params.id },
      include: {
        asset: true,
        sourceBase: true,
        destBase: true
      }
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

// Create new transfer
router.post('/', validateTransfer, authorizeRole('ADMIN', 'LOGISTICS_OFFICER'), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assetId, sourceBaseId, destBaseId, transferDate, notes } = req.body;

    // Start a transaction
    const transfer = await prisma.$transaction(async (prisma) => {
      // Check if asset exists and is available
      const asset = await prisma.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      if (asset.status !== 'AVAILABLE') {
        throw new Error('Asset is not available for transfer');
      }

      // Create transfer record
      const transfer = await prisma.transfer.create({
        data: {
          assetId,
          sourceBaseId,
          destBaseId,
          transferDate: new Date(transferDate),
          status: 'PENDING',
          notes
        }
      });

      // Update asset status and base
      await prisma.asset.update({
        where: { id: assetId },
        data: {
          status: 'IN_TRANSIT',
          baseId: destBaseId
        }
      });

      return transfer;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TRANSFER',
        entityType: 'ASSET',
        entityId: assetId,
        userId: req.user.id,
        details: {
          transferId: transfer.id,
          sourceBaseId,
          destBaseId,
          transferDate
        }
      }
    });

    res.status(201).json(transfer);
  } catch (error) {
    next(error);
  }
});

// Complete transfer
router.post('/:id/complete', authorizeRole('ADMIN', 'LOGISTICS_OFFICER'), async (req, res, next) => {
  try {
    const transfer = await prisma.$transaction(async (prisma) => {
      const transfer = await prisma.transfer.findUnique({
        where: { id: req.params.id },
        include: { asset: true }
      });

      if (!transfer) {
        throw new Error('Transfer not found');
      }

      if (transfer.status !== 'PENDING') {
        throw new Error('Transfer is not pending');
      }

      // Update transfer status
      const updatedTransfer = await prisma.transfer.update({
        where: { id: req.params.id },
        data: { status: 'COMPLETED' }
      });

      // Update asset status
      await prisma.asset.update({
        where: { id: transfer.assetId },
        data: { status: 'AVAILABLE' }
      });

      return updatedTransfer;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TRANSFER_COMPLETE',
        entityType: 'TRANSFER',
        entityId: transfer.id,
        userId: req.user.id,
        details: { status: 'COMPLETED' }
      }
    });

    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 