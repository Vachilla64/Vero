const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateJWT = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/history
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const senderId = req.user.userId;

    const verifications = await prisma.verification.findMany({
      where: { userId: senderId },
      orderBy: { createdAt: 'desc' }
    });

    const { generateFakeName } = require('../utils/nuban');
    
    const verificationsWithNames = verifications.map(v => ({
      ...v,
      name: generateFakeName(v.nuban)
    }));

    res.status(200).json(verificationsWithNames);
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
