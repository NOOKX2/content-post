-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "displayName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "phoneCountry" TEXT NOT NULL DEFAULT '+66';
ALTER TABLE "User" ADD COLUMN "position" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "imageUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "busy" BOOLEAN NOT NULL DEFAULT false;

-- Backfill display name from existing name
UPDATE "User" SET "displayName" = "name" WHERE "displayName" = '';
