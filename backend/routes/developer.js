const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateJWT = require('../middleware/authMiddleware');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/developer/keys
router.get('/keys', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Developer endpoints strictly require standard JWT user sessions (not api keys)
    if (req.user.isApi) {
      return res.status(403).json({ error: 'Cannot manage API keys using an API key' });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(keys);
  } catch (error) {
    console.error('Fetch API Keys Error:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// POST /api/developer/keys/roll
router.post('/keys/roll', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (req.user.isApi) {
      return res.status(403).json({ error: 'Cannot manage API keys using an API key' });
    }

    // Invalidate existing keys (optional, but good for "rolling" mechanics)
    await prisma.apiKey.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });

    // Generate new secure key (vero_live_ + 32 hex chars)
    const rawKey = crypto.randomBytes(16).toString('hex');
    const newKeyString = `vero_live_${rawKey}`;

    const newKey = await prisma.apiKey.create({
      data: {
        key: newKeyString,
        userId: userId
      }
    });

    res.status(201).json(newKey);
  } catch (error) {
    console.error('Roll API Key Error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

module.exports = router;
