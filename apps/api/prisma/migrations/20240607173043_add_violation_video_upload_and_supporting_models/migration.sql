-- CreateEnum
CREATE TYPE "Violations" AS ENUM ('EXPLICIT_CONTENT', 'VIOLENT_CONTENT', 'HARASSMENT', 'MISINFORMATION', 'ILLEGAL_ACTIVITIES', 'INTELLECTUAL_PROPERTY', 'SPAM', 'COMMUNITY_GUIDELINES');

-- CreateEnum
CREATE TYPE "ViolationStatus" AS ENUM ('PENDING', 'DENIED', 'APPROVED');

-- CreateEnum
CREATE TYPE "VideoUploadStatus" AS ENUM ('PENDING', 'PROCESSING_FILTERING', 'PROCESSING_ENCODING', 'FAILED', 'SUCESS', 'DENIED', 'REVIEW');

-- CreateEnum
CREATE TYPE "ContentDisplayType" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateTable
CREATE TABLE "UserViolation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" INTEGER NOT NULL,
    "type" "Violations" NOT NULL,
    "status" "ViolationStatus" NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "UserViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoUploadJob" (
    "id" SERIAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "stream" TEXT NOT NULL,
    "status" "VideoUploadStatus" NOT NULL DEFAULT 'PENDING',
    "frameData" JSONB[],

    CONSTRAINT "VideoUploadJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorContent" (
    "id" TEXT NOT NULL,
    "uploadId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "displayType" "ContentDisplayType" NOT NULL DEFAULT 'PUBLIC',
    "thumbnail" TEXT,

    CONSTRAINT "CreatorContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorContent_uploadId_key" ON "CreatorContent"("uploadId");

-- AddForeignKey
ALTER TABLE "UserViolation" ADD CONSTRAINT "UserViolation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserViolation" ADD CONSTRAINT "UserViolation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserViolation" ADD CONSTRAINT "UserViolation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorContent" ADD CONSTRAINT "CreatorContent_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "VideoUploadJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
