-- CreateTable
CREATE TABLE "CollaborationChannelRead" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationChannelRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaborationChannelRead_userId_idx" ON "CollaborationChannelRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationChannelRead_channelId_userId_key" ON "CollaborationChannelRead"("channelId", "userId");

-- AddForeignKey
ALTER TABLE "CollaborationChannelRead" ADD CONSTRAINT "CollaborationChannelRead_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "CollaborationChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationChannelRead" ADD CONSTRAINT "CollaborationChannelRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
