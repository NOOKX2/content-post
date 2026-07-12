-- CreateTable
CREATE TABLE "PostingChannel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostingChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostingChannelPlatform" (
    "id" TEXT NOT NULL,
    "postingChannelId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "bufferChannelId" TEXT NOT NULL,
    "bufferChannelName" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostingChannelPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostingChannel_slug_key" ON "PostingChannel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PostingChannel_prefix_key" ON "PostingChannel"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "PostingChannelPlatform_postingChannelId_platform_key" ON "PostingChannelPlatform"("postingChannelId", "platform");

-- AddForeignKey
ALTER TABLE "PostingChannelPlatform" ADD CONSTRAINT "PostingChannelPlatform_postingChannelId_fkey" FOREIGN KEY ("postingChannelId") REFERENCES "PostingChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
