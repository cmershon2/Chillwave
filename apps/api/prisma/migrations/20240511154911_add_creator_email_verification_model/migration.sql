/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `CreatorRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CreatorRequest" DROP COLUMN "emailVerified";

-- CreateTable
CREATE TABLE "CreatorEmailVerification" (
    "id" TEXT NOT NULL,
    "creatorRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CreatorEmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorEmailVerification_creatorRequestId_key" ON "CreatorEmailVerification"("creatorRequestId");

-- AddForeignKey
ALTER TABLE "CreatorEmailVerification" ADD CONSTRAINT "CreatorEmailVerification_creatorRequestId_fkey" FOREIGN KEY ("creatorRequestId") REFERENCES "CreatorRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
