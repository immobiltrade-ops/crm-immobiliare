-- CreateTable
CREATE TABLE "AgencySettings" (
    "id" TEXT NOT NULL,
    "nomeAgenzia" TEXT,
    "indirizzo" TEXT,
    "citta" TEXT,
    "cap" TEXT,
    "provincia" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "piva" TEXT,
    "sito" TEXT,
    "logoUrl" TEXT,
    "notificaVisita" BOOLEAN NOT NULL DEFAULT true,
    "notificaOpportunita" BOOLEAN NOT NULL DEFAULT true,
    "notificaScadenza" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencySettings_pkey" PRIMARY KEY ("id")
);
