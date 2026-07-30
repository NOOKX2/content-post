-- AlterTable
ALTER TABLE "Content" ADD COLUMN "postingTargets" JSONB NOT NULL DEFAULT '[]';
