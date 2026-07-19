const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateJWT = require('../middleware/authMiddleware');
const { validateNuban, generateFakeName } = require('../utils/nuban');
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

    // Check premium status and daily lookup limit
    const userObj = await prisma.user.findUnique({
      where: { id: senderId }
    });

    if (!userObj) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!userObj.isPremium) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const count = await prisma.verification.count({
        where: {
          userId: senderId,
          createdAt: {
            gte: startOfDay
          }
        }
      });

      if (count >= 15) {
        return res.status(403).json({
          error: 'LIMIT_REACHED',
          message: 'You have reached your daily limit of 15 free checks. Please upgrade to Pro.'
        });
      }
    }

    let score = 0;
    let flags = [];
    let explanation = '';
    let breakdown = [];

    let account = null;

    // 1. Format gate (hard): must be exactly 10 digits
    if (!/^\d{10}$/.test(nuban)) {
      score = 0;
      flags = ['invalid_format'];
      explanation = 'That is not a valid 10-digit account number.';
      breakdown = [{ signal: 'invalid_format', points: -100, reason: 'Invalid NUBAN format' }];
    } else {
      // 2. Fetch Account from Postgres
      account = await prisma.account.findUnique({
        where: { nuban }
      });

      // 3. Run Trust Score Math Engine
      const result = await calculateTrustScore(account, senderId, parseFloat(amount));
      score = result.score;
      flags = result.flags;
      breakdown = result.breakdown;

      // 4. Checksum is a soft signal only — we can't know every institution's
      // bank code, so a failed checksum informs, it never blocks.
      if (!validateNuban(nuban)) {
        flags = [...flags, 'checksum_unverified'];
        breakdown.push({ signal: 'checksum_unverified', points: 0, reason: 'Could not verify check digit' });
      }

      // 5. Generate AI Explanation
      explanation = await getExplanation(flags);
    }

    // 5. Save verification log to database
    await prisma.verification.create({
      data: {
        nuban,
        amount: parseFloat(amount),
        score,
        flags,
        explanation,
        userId: senderId
      }
    });

    // 6. Return payload exactly as expected by the UI
    const timesChecked = await prisma.verification.count({ where: { nuban } });

    res.status(200).json({
      score,
      flags,
      explanation,
      breakdown,
      timesChecked,
      accountName: account ? account.name : generateFakeName(nuban)
    });

  } catch (error) {
    console.error('Verify Route Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
