import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_ADMIN_PASSWORD = 'Admin123!';
const DEMO_USER_PASSWORD = 'Demo123!';

async function main() {
  const adminPasswordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  const userPasswordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN', isActive: true },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const users = [
    { username: 'player1', email: 'player1@example.com' },
    { username: 'player2', email: 'player2@example.com' },
    { username: 'player3', email: 'player3@example.com' },
    { username: 'player4', email: 'player4@example.com' },
    { username: 'player5', email: 'player5@example.com' },
  ];

  const createdUsers = await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { passwordHash: userPasswordHash, role: 'USER', isActive: true },
        create: {
          username: user.username,
          email: user.email,
          passwordHash: userPasswordHash,
          role: 'USER',
          isActive: true,
        },
      }),
    ),
  );

  const achievements = [
    { name: 'First Game', description: 'Complete your first game.', requirement: 1 },
    { name: 'Score 100', description: 'Score at least 100 points.', requirement: 100 },
    { name: 'Score 500', description: 'Score at least 500 points.', requirement: 500 },
    { name: 'Score 1000', description: 'Score at least 1000 points.', requirement: 1000 },
    { name: 'Play 10 Games', description: 'Play ten games.', requirement: 10 },
  ];

  const createdAchievements = await Promise.all(
    achievements.map((achievement) =>
      prisma.achievement.upsert({
        where: { name: achievement.name },
        update: { description: achievement.description, requirement: achievement.requirement },
        create: achievement,
      }),
    ),
  );

  const scoreRecords = [
    { user: createdUsers[0], score: 680, level: 6 },
    { user: createdUsers[0], score: 420, level: 4 },
    { user: createdUsers[1], score: 520, level: 5 },
    { user: createdUsers[1], score: 140, level: 2 },
    { user: createdUsers[2], score: 980, level: 8 },
    { user: createdUsers[2], score: 250, level: 3 },
    { user: createdUsers[3], score: 60, level: 1 },
    { user: createdUsers[3], score: 310, level: 3 },
    { user: createdUsers[4], score: 110, level: 2 },
    { user: createdUsers[4], score: 700, level: 6 },
    { user: admin, score: 1200, level: 10 },
  ];

  await Promise.all(
    scoreRecords.map((record) =>
      prisma.score.create({
        data: {
          userId: record.user.id,
          score: record.score,
          level: record.level,
        },
      }),
    ),
  );

  await Promise.all(
    createdUsers.slice(0, 3).map((user, index) =>
      prisma.gameSession.create({
        data: {
          userId: user.id,
          score: 50 + index * 25,
          level: 2 + index,
          duration: 90 + index * 30,
          startedAt: new Date(Date.now() - (index + 1) * 60 * 60 * 1000),
          endedAt: new Date(Date.now() - index * 60 * 60 * 1000),
        },
      }),
    ),
  );

  const unlockPairs = [
    { user: createdUsers[0], achievement: createdAchievements[0] },
    { user: createdUsers[0], achievement: createdAchievements[1] },
    { user: createdUsers[1], achievement: createdAchievements[0] },
    { user: createdUsers[1], achievement: createdAchievements[1] },
    { user: admin, achievement: createdAchievements[0] },
    { user: admin, achievement: createdAchievements[3] },
  ];

  await Promise.all(
    unlockPairs.map(({ user, achievement }) =>
      prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId: user.id, achievementId: achievement.id },
        },
        update: {},
        create: {
          userId: user.id,
          achievementId: achievement.id,
        },
      }),
    ),
  );

  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'SEED_DATABASE', entity: 'Database', entityId: null, ipAddress: '127.0.0.1' },
      { userId: createdUsers[0].id, action: 'SEED_DATABASE', entity: 'Score', entityId: null, ipAddress: '127.0.0.1' },
    ],
  });

  console.log('Seed data created successfully.');
  console.log('Demo accounts (for local development only):');
  console.log(`  ADMIN: admin@example.com / ${DEMO_ADMIN_PASSWORD}`);
  console.log(`  USER:  player1@example.com / ${DEMO_USER_PASSWORD}`);
  console.log(`  USER:  player2@example.com / ${DEMO_USER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
