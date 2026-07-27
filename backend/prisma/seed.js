const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// DEMO-DAY CHEAT SHEET — bank code sent must match what the presenter picks
// in the UI's bank dropdown (backend/routes/banks.js FALLBACK_BANKS list).
// | login              | nuban        | bank (code)         | expected result                              |
// |---------------------|--------------|---------------------|-----------------------------------------------|
// | demo@vero.net        | (sender)     | -                   | premium, no daily cap — use this to log in    |
// | clean@vero.net        | 1000000000  | Union Bank (032)    | 100, verified_institution                     |
// | newbie@vero.net       | 1000000014  | Access Bank (044)   | ~60, new_account                              |
// | mule@vero.net         | 1000000021  | First Bank (011)    | ~10, new_account+heavily_reported+critical    |
// | suspended@vero.net    | 1000000038  | UBA (033)           | 0, suspended_account                          |
// | flagged@vero.net      | 1000000045  | Access Bank (044)   | ~80, flagged_by_users                         |
// | ellastores@vero.net   | 9876543210  | GTBank (058)        | 0, suspended_account+critical_risk            |
//   (Ella's checksum intentionally does NOT validate — her NUBAN/bank are
//   spoken verbatim in the video script, so we can't tune them; the extra
//   checksum_unverified flag on the villain account reads as more suspicion,
//   not a bug.)

async function main() {
  console.log("Seeding database...");

  // Clear existing data in correct dependency order
  await prisma.report.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Clean Account User & Account
  const userClean = await prisma.user.create({
    data: {
      email: 'clean@vero.net',
      name: 'Clean User',
      password: passwordHash,
    }
  });

  const accountClean = await prisma.account.create({
    data: {
      nuban: '1000000000',
      bankCode: '032', // Union Bank (Verified Institution tag trigger)
      name: 'Adaeze Okafor',
      status: 'active',
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      userId: userClean.id,
    }
  });

  // Seed transaction history for Clean Account to establish history
  await prisma.transaction.createMany({
    data: [
      { amount: 5000, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), accountId: accountClean.id },
      { amount: 12000, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), accountId: accountClean.id },
      { amount: 15000, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), accountId: accountClean.id },
    ]
  });

  // 2. Seed New Account User & Account
  const userNew = await prisma.user.create({
    data: {
      email: 'newbie@vero.net',
      name: 'New User',
      password: passwordHash,
    }
  });

  await prisma.account.create({
    data: {
      nuban: '1000000014',
      bankCode: '044', // Access Bank
      name: 'Tunde Adeyemi',
      status: 'active',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      userId: userNew.id,
    }
  });

  // 3. Seed Mule Account User & Account
  const userMule = await prisma.user.create({
    data: {
      email: 'mule@vero.net',
      name: 'Mule User',
      password: passwordHash,
    }
  });

  const accountMule = await prisma.account.create({
    data: {
      nuban: '1000000021',
      bankCode: '011', // First Bank of Nigeria
      name: 'Chidi Nwosu',
      status: 'active',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      userId: userMule.id,
    }
  });

  // Seed reports for Mule Account (triggers heavily_reported)
  const reporter1 = await prisma.user.create({ data: { email: 'rep1@vero.net', name: 'Reporter 1', password: passwordHash } });
  const reporter2 = await prisma.user.create({ data: { email: 'rep2@vero.net', name: 'Reporter 2', password: passwordHash } });
  const reporter3 = await prisma.user.create({ data: { email: 'rep3@vero.net', name: 'Reporter 3', password: passwordHash } });

  await prisma.report.createMany({
    data: [
      { reason: 'Known Scammer', penalty: 20, userId: reporter1.id, accountId: accountMule.id },
      { reason: 'Did not deliver goods', penalty: 20, userId: reporter2.id, accountId: accountMule.id },
      { reason: 'Coordinated velocity spike', penalty: 20, userId: reporter3.id, accountId: accountMule.id },
    ]
  });

  // 4. Seed Suspended Account User & Account
  const userSuspended = await prisma.user.create({
    data: {
      email: 'suspended@vero.net',
      name: 'Suspended User',
      password: passwordHash,
    }
  });

  await prisma.account.create({
    data: {
      nuban: '1000000038',
      bankCode: '033', // United Bank For Africa
      name: 'Ibrahim Musa',
      status: 'suspended',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      userId: userSuspended.id,
    }
  });

  // 5. Seed Flagged Account User & Account
  const userFlagged = await prisma.user.create({
    data: {
      email: 'flagged@vero.net',
      name: 'Flagged User',
      password: passwordHash,
    }
  });

  const accountFlagged = await prisma.account.create({
    data: {
      nuban: '1000000045',
      bankCode: '044', // Access Bank
      name: 'Blessing Eze',
      status: 'active',
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
      userId: userFlagged.id,
    }
  });

  // Seed 1 report for Flagged Account
  await prisma.report.create({
    data: {
      reason: 'Suspicious profile',
      penalty: 20,
      userId: reporter1.id,
      accountId: accountFlagged.id,
    }
  });

  // 6. Seed "Ella Stores" — known bad actor (GTBank, 9876543210)
  //    Heavily reported, suspended, no legit transaction history.
  const userEllaStores = await prisma.user.create({
    data: {
      email: 'ellastores@vero.net',
      name: 'Ella Stores',
      password: passwordHash,
    }
  });

  const accountEllaStores = await prisma.account.create({
    data: {
      nuban: '9876543210',
      bankCode: '058', // GTBank
      name: 'Ella Stores',
      status: 'suspended',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      userId: userEllaStores.id,
    }
  });

  // Seed high-velocity suspicious transactions (spike pattern)
  const now = Date.now();
  await prisma.transaction.createMany({
    data: [
      { amount: 250000, createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000), accountId: accountEllaStores.id },
      { amount: 180000, createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), accountId: accountEllaStores.id },
      { amount: 320000, createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), accountId: accountEllaStores.id },
      { amount: 95000,  createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000), accountId: accountEllaStores.id },
      { amount: 410000, createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), accountId: accountEllaStores.id },
    ]
  });

  // Seed 5 reports from different users — triggers heavily_reported
  const rep4 = await prisma.user.create({ data: { email: 'rep4@vero.net', name: 'Reporter 4', password: passwordHash } });
  const rep5 = await prisma.user.create({ data: { email: 'rep5@vero.net', name: 'Reporter 5', password: passwordHash } });

  await prisma.report.createMany({
    data: [
      { reason: 'scam',          penalty: 20, userId: reporter1.id,       accountId: accountEllaStores.id },
      { reason: 'scam',          penalty: 20, userId: reporter2.id,       accountId: accountEllaStores.id },
      { reason: 'impersonation', penalty: 20, userId: reporter3.id,       accountId: accountEllaStores.id },
      { reason: 'phishing',      penalty: 20, userId: rep4.id,            accountId: accountEllaStores.id },
      { reason: 'scam',          penalty: 20, userId: rep5.id,            accountId: accountEllaStores.id },
    ]
  });

  // 7. Premium demo login — the ONLY account used on stage. isPremium
  // bypasses the 15/day free-tier lookup cap in routes/verify.js, so
  // rehearsals + the live pitch on the same day can't run into the wall.
  // Intentionally has no Account of its own, so verifying any seeded NUBAN
  // never trips the self_transfer flag.
  await prisma.user.create({
    data: {
      email: 'demo@vero.net',
      name: 'Demo User',
      password: passwordHash,
      isPremium: true,
    }
  });

  // 8. Social proof for Ella Stores — ~45 historical verification lookups
  // so the demo shows "checked N times" instead of resetting to ~0 after
  // every reseed. Spread over the last 45 days, rotating across users who
  // already exist above.
  const socialProofUsers = [reporter1, reporter2, reporter3, rep4, rep5];
  const ellaVerifications = [];
  for (let i = 0; i < 45; i++) {
    ellaVerifications.push({
      nuban: '9876543210',
      amount: 25000 + (i % 7) * 15000,
      score: 0,
      flags: ['suspended_account', 'critical_risk', 'checksum_unverified'],
      explanation: 'This transaction has critical risk due to a suspended account and unverified checksum.',
      userId: socialProofUsers[i % socialProofUsers.length].id,
      createdAt: new Date(now - (45 - i) * 24 * 60 * 60 * 1000),
    });
  }
  await prisma.verification.createMany({ data: ellaVerifications });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
