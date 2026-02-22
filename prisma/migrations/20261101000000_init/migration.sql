-- CreateSchema
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'VIEWER');
CREATE TYPE "ActorType" AS ENUM ('KIOSK', 'ADMIN', 'SYSTEM');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "photoUrl" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "Drink" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "imageUrl" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "minimumStock" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "Consumption" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "drinkId" TEXT NOT NULL,
  "qty" INTEGER NOT NULL,
  "priceCentsAtTime" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientUuid" TEXT NOT NULL UNIQUE
);
CREATE TABLE "AdminUser" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "StockMovement" (
  "id" TEXT PRIMARY KEY,
  "drinkId" TEXT NOT NULL,
  "deltaQty" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "note" TEXT,
  "adminUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "method" TEXT NOT NULL,
  "note" TEXT,
  "adminUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Adjustment" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "MonthlyInvoice" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "totalCents" INTEGER NOT NULL DEFAULT 0,
  "paid" BOOLEAN NOT NULL DEFAULT false,
  "paidAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  UNIQUE("userId", "year", "month")
);
CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "actorType" "ActorType" NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "adminUserId" TEXT
);
CREATE TABLE "AppConfig" (
  "id" TEXT PRIMARY KEY DEFAULT 'default',
  "allowNegativeStock" BOOLEAN NOT NULL DEFAULT true,
  "autoMarkPaidOnZero" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_drinkId_fkey" FOREIGN KEY ("drinkId") REFERENCES "Drink"("id");
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_drinkId_fkey" FOREIGN KEY ("drinkId") REFERENCES "Drink"("id");
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id");
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id");
ALTER TABLE "Adjustment" ADD CONSTRAINT "Adjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Adjustment" ADD CONSTRAINT "Adjustment_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id");
ALTER TABLE "MonthlyInvoice" ADD CONSTRAINT "MonthlyInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id");

CREATE INDEX "Consumption_userId_createdAt_idx" ON "Consumption"("userId", "createdAt");
CREATE INDEX "Consumption_drinkId_createdAt_idx" ON "Consumption"("drinkId", "createdAt");
CREATE INDEX "Payment_userId_year_month_idx" ON "Payment"("userId", "year", "month");
CREATE INDEX "Adjustment_userId_year_month_idx" ON "Adjustment"("userId", "year", "month");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
