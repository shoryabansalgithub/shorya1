import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const shop = await prisma.shop.upsert({
      where: { id: 'default-shop-id' },
      update: {},
      create: {
        id: 'default-shop-id',
        name: 'Default Test Shop',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      },
    });
    console.log('Successfully ensured default shop exists:', shop.id);
  } catch (e) {
    console.error('Error creating shop:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
