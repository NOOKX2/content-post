-- AlterEnum
ALTER TYPE "ContentStatus" ADD VALUE 'idea_approved';
ALTER TYPE "ContentStatus" ADD VALUE 'clip_pending';

-- AlterTable
ALTER TABLE "Content" ADD COLUMN "exampleAttachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
