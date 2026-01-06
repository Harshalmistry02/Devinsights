-- CreateTable
CREATE TABLE "insight_caches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "dataHash" TEXT NOT NULL,
    "insights" JSONB NOT NULL,
    "model" TEXT,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insight_caches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "insight_caches_dataHash_key" ON "insight_caches"("dataHash");

-- CreateIndex
CREATE INDEX "insight_caches_userId_idx" ON "insight_caches"("userId");

-- CreateIndex
CREATE INDEX "insight_caches_expiresAt_idx" ON "insight_caches"("expiresAt");

-- AddForeignKey
ALTER TABLE "insight_caches" ADD CONSTRAINT "insight_caches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_caches" ADD CONSTRAINT "insight_caches_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "analytics_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
