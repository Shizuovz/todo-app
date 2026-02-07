import { PrismaClient } from '@prisma/client';

/**
 * Singleton pattern for PrismaClient.
 * In development, Next.js clears the cache on reload, which can lead to
 * multiple Prisma instances and exhausted database connections.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
