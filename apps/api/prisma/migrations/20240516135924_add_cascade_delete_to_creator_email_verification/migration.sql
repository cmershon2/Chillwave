-- DropForeignKey
ALTER TABLE "CreatorEmailVerification" DROP CONSTRAINT "CreatorEmailVerification_creatorRequestId_fkey";

-- AddForeignKey
ALTER TABLE "CreatorEmailVerification" ADD CONSTRAINT "CreatorEmailVerification_creatorRequestId_fkey" FOREIGN KEY ("creatorRequestId") REFERENCES "CreatorRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
