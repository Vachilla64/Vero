const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateJWT = require('../middleware/authMiddleware');
const { validateNuban } = require('../utils/nuban');
const { calculateTrustScore } = require('../utils/scoring');
const { getExplanation } = require('../utils/llm');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/verify
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { nuban, amount } = req.body;
    const senderId = req.user.userId;

    if (!nuban || amount === undefined) {
      return res.status(400).json({ error: 'Missing nuban or amount' });
    }

    // 1. Strict NUBAN Checksum Validation
    if (!validateNuban(nuban)) {
      // Simulate the NUBAN verification failure for the UI
      return res.status(200).json({
        score: 0,
        flags: ['invalid_nuban'],
        explanation: 'This account number is invalid and failed mathematical checksum verification.'
      });
    }

    // 2. Fetch Account from Postgres
    const account = await prisma.account.findUnique({
      where: { nuban }
    });

    // 3. Run Trust Score Math Engine
    const { score, flags } = await calculateTrustScore(account, senderId, parseFloat(amount));

    // 4. Generate AI Explanation
    const explanation = await getExplanation(flags);

    // 5. Return payload exactly as expected by the UI
    res.status(200).json({
      score,
      flags,
      explanation
    });

  } catch (error) {
    console.error('Verify Route Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
