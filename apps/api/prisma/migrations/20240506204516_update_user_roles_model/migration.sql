/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Roles" ADD VALUE 'CREATOR';
ALTER TYPE "Roles" ADD VALUE 'EDITOR';
ALTER TYPE "Roles" ADD VALUE 'MODERATOR';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "roles" "Roles"[] DEFAULT ARRAY['USER']::"Roles"[];
