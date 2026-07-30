import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('admin@2004', {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 65536,
    parallelism: 4,
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@momen.app' },
    update: {},
    create: {
      email: 'admin@momen.app',
      username: 'admin',
      passwordHash,
      displayName: 'Admin',
      authProvider: 'EMAIL',
      emailVerified: true,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created: ${admin.email} (${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
