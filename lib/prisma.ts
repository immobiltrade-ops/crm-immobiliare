import type { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientClass } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configurazione URL database con parametri Neon
function getDatabaseUrl(): string {
  const baseUrl = process.env.DATABASE_URL || '';
  if (!baseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  
  // Aggiungi parametri Neon se non presenti
  if (!baseUrl.includes('connection_limit')) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}connection_limit=1&pool_timeout=0`;
  }
  
  return baseUrl;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClientClass({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Singleton pattern per evitare istanze multiple in development
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;