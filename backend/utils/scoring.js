const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculates the Trust Score for an account based on Postgres history.
 * @param {Object} account - The recipient Account record from Prisma.
 * @param {String} senderId - The ID of the User sending the money.
 * @param {Number} amount - The transfer amount in NGN.
 * @returns {Object} { score: Number, flags: Array<String> }
 */
async function calculateTrustScore(account, senderId, amount) {
  let score = 100;
  const flags = new Set();

  // 1. Invalid or Missing Account
  if (!account) {
    return { score: 0, flags: ['invalid_nuban'] };
  }

  // 2. Suspended Account Check
  if (account.status === 'suspended') {
    return { score: 0, flags: ['suspended_account', 'critical_risk'] };
  }

  // 3. Self-Transfer Bypass
  if (account.userId === senderId) {
    return { score: 100, flags: [] };
  }

  // Calculate Account Age (in days)
  const ageInMs = Date.now() - new Date(account.createdAt).getTime();
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

  // 4. Age Penalty (New Account)
  if (ageInDays < 7) {
    score -= 40;
    flags.add('new_account');
  }

  // 5. Heavy Reporting Penalty
  const reportCount = await prisma.report.count({
    where: { accountId: account.id }
  });

  if (reportCount > 0) {
    if (reportCount > 2) {
      score -= 50;
      flags.add('heavily_reported');
    } else {
      score -= 20;
      flags.add('flagged_by_users');
    }
  }

  // 6. Sender Transaction History (Velocity Check)
  const senderTransactions = await prisma.transaction.aggregate({
    _sum: { amount: true },
    _avg: { amount: true },
    _count: { id: true },
    where: {
      senderId: senderId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });

  const txCount = senderTransactions._count.id || 0;
  
  if (txCount < 3) {
    // Skip velocity checks for new/infrequent senders
    if (ageInDays < 7) {
      // Just rely on the new_account flag
    }
  } else {
    const avgAmount = senderTransactions._avg.amount || 1; // Fallback to avoid div zero
    
    // Amount Deviation / Velocity Spike
    // Floor of 10000 NGN to prevent triggering on microtransactions
    if (amount > 10000 && amount > avgAmount * 3) {
      score -= 15;
      flags.add('velocity_anomaly');
    }
  }

  // High Absolute Value
  if (amount > 1000000) {
    score -= 10;
    flags.add('high_value');
  }

  // Critical Risk Floor
  if (score < 30) {
    flags.add('critical_risk');
  }

  // Ensure score is clamped perfectly between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    flags: Array.from(flags)
  };
}

module.exports = {
  calculateTrustScore
};
