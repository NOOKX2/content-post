-- AlterTable
ALTER TABLE "CollaborationChannel" ADD COLUMN "createdById" TEXT;

-- CreateTable
CREATE TABLE "CollaborationChannelMember" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationChannelMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaborationChannelMember_userId_idx" ON "CollaborationChannelMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationChannelMember_channelId_userId_key" ON "CollaborationChannelMember"("channelId", "userId");

-- AddForeignKey
ALTER TABLE "CollaborationChannel" ADD CONSTRAINT "CollaborationChannel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationChannelMember" ADD CONSTRAINT "CollaborationChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "CollaborationChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationChannelMember" ADD CONSTRAINT "CollaborationChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
