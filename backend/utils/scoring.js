const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculates the Trust Score for an account based on Postgres history.
 * @param {Object} account - The recipient Account record from Prisma.
 * @param {String} senderId - The ID of the User sending the money.
 * @param {Number} amount - The transfer amount in NGN.
 * @returns {Object} { score: Number, flags: Array<String>, breakdown: Array<Object> }
 */
async function calculateTrustScore(account, senderId, amount) {
  let score = 100;
  const flags = new Set();
  const breakdown = [];

  // 1. Unknown Account — not in the network yet. Honest moderate caution, not a false alarm.
  if (!account) {
    breakdown.push({ signal: 'unknown_account', points: -45, reason: 'No prior history on network' });
    return { score: 55, flags: ['unknown_account'], breakdown };
  }

  // 2. Suspended Account Check
  if (account.status === 'suspended') {
    breakdown.push({ signal: 'suspended_account', points: -100, reason: 'Account suspended for policy violations' });
    return { score: 0, flags: ['suspended_account', 'critical_risk'], breakdown };
  }

  // 3. Self-Transfer Bypass
  if (account.userId === senderId) {
    breakdown.push({ signal: 'self_transfer', points: 0, reason: 'Transfer to own account' });
    return { score: 100, flags: [], breakdown };
  }

  breakdown.push({ signal: 'base_score', points: 100, reason: 'Starting trust score' });

  // Calculate Account Age (in days)
  const ageInMs = Date.now() - new Date(account.createdAt).getTime();
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

  // 4. Age Penalty (New Account)
  if (ageInDays < 7) {
    score -= 40;
    flags.add('new_account');
    breakdown.push({ signal: 'new_account', points: -40, reason: 'Account is less than 7 days old' });
  }

  // 5. Heavy Reporting Penalty
  const reportCount = await prisma.report.count({
    where: { accountId: account.id }
  });

  if (reportCount > 0) {
    if (reportCount > 2) {
      score -= 50;
      flags.add('heavily_reported');
      breakdown.push({ signal: 'heavily_reported', points: -50, reason: 'Account has 3 or more user reports' });
    } else {
      score -= 20;
      flags.add('flagged_by_users');
      breakdown.push({ signal: 'flagged_by_users', points: -20, reason: 'Account has been flagged by users' });
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
      breakdown.push({ signal: 'velocity_anomaly', points: -15, reason: 'Unusually high transfer amount compared to history' });
    }
  }

  // High Absolute Value
  if (amount > 1000000) {
    score -= 10;
    flags.add('high_value');
    breakdown.push({ signal: 'high_value', points: -10, reason: 'High absolute transfer value' });
  }

  // Union Bank Tag
  if (account.bankCode === '032') {
    flags.add('verified_institution');
    breakdown.push({ signal: 'verified_institution', points: 0, reason: 'Verified partner institution' });
  }

  // Critical Risk Floor
  if (score < 30) {
    flags.add('critical_risk');
  }

  // Ensure score is clamped perfectly between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  if (clampedScore !== score) {
    breakdown.push({ signal: 'score_clamped', points: clampedScore - score, reason: 'Score adjusted to fit 0-100 range' });
  }
  score = clampedScore;

  return {
    score,
    flags: Array.from(flags),
    breakdown
  };
}

module.exports = {
  calculateTrustScore
};
