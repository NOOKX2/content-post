-- AlterEnum
ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'post_failed';

-- AlterTable
ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "postError" TEXT NOT NULL DEFAULT '';
