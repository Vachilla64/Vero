const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

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
      nuban: '1000000007',
      bankCode: '032', // Union Bank (Verified Institution tag trigger)
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
      bankCode: '000',
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
      bankCode: '000',
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
      bankCode: '000',
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
      bankCode: '000',
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
