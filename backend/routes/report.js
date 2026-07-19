const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateJWT = require('../middleware/authMiddleware');
const { validateNuban } = require('../utils/nuban');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/report
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { nuban, reason } = req.body;
    const reporterId = req.user.userId;

    if (!nuban || !reason) {
      return res.status(400).json({ error: 'Missing nuban or reason' });
    }

    if (!/^\d{10}$/.test(nuban)) {
      return res.status(400).json({ error: 'Invalid NUBAN format' });
    }

    // Wrap the reporting logic in a Prisma Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Fetch the reporter to calculate their stake-weighted penalty
      const reporter = await tx.user.findUnique({ where: { id: reporterId } });
      if (!reporter) throw new Error("Reporter not found");
      
      // For the prototype, we assume the reporter is highly trusted and give a flat penalty.
      // In production, this penalty weight scales with the reporter's own Trust Score.
      const penaltyWeight = 20; 

      // 2. Fetch the target account or CREATE it if it doesn't exist (Crowdsourcing Paradox fix)
      let targetAccount = await tx.account.findUnique({
        where: { nuban }
      });

      let justCreated = false;
      if (!targetAccount) {
        // Dynamically create the account record so its reputation can be tracked.
        // Linked to the reporter as the "discoverer" (schema requires a userId).
        justCreated = true;
        targetAccount = await tx.account.create({
          data: {
            nuban,
            bankCode: "000",
            userId: reporterId
          }
        });
      }

      // Prevent reporting oneself — only meaningful for pre-existing accounts;
      // a just-created record is merely "discovered by", not owned by, the reporter.
      if (!justCreated && targetAccount.userId === reporterId) {
        throw new Error("SelfReport");
      }

      // 3. Create the Report (Prisma will throw P2002 if duplicate report exists due to @@unique constraint)
      await tx.report.create({
        data: {
          reason,
          penalty: penaltyWeight,
          userId: reporterId,
          accountId: targetAccount.id
        }
      });
      
      // We don't manually deduct the score here anymore because our 
      // calculateTrustScore engine mathematically evaluates reports on-the-fly!
    });

    res.status(200).json({ success: true, message: 'Report submitted successfully' });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(429).json({ error: 'You have already reported this account.' });
    }
    if (error.message === 'SelfReport') {
      return res.status(400).json({ error: 'You cannot report your own account.' });
    }
    
    console.error('Report Route Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
