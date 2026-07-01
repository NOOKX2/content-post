-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('video', 'image');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'pending', 'approved', 'scheduled', 'posted', 'rejected');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('facebook', 'instagram', 'tiktok', 'line', 'lemon8', 'youtube');

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "channel" TEXT NOT NULL DEFAULT '',
    "platforms" "Platform"[],
    "details" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "scheduledDate" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "endTime" TEXT,
    "team" JSONB NOT NULL DEFAULT '[]',
    "productsNeeded" TEXT[],
    "itemsToPrepare" TEXT NOT NULL DEFAULT '',
    "attachments" TEXT[],
    "script" JSONB NOT NULL DEFAULT '[]',
    "ideaCreator" TEXT NOT NULL DEFAULT '',
    "photographer" TEXT NOT NULL DEFAULT '',
    "editor" TEXT NOT NULL DEFAULT '',
    "approver" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'pending',
    "category" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[],
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_contentId_key" ON "Content"("contentId");

-- CreateIndex
CREATE INDEX "Content_status_scheduledDate_idx" ON "Content"("status", "scheduledDate");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
