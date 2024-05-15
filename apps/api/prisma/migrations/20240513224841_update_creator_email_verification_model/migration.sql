/*
  Warnings:

  - A unique constraint covering the columns `[verificationId]` on the table `CreatorEmailVerification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CreatorEmailVerification_verificationId_key" ON "CreatorEmailVerification"("verificationId");
