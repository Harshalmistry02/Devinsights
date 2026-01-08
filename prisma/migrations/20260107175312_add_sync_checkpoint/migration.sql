-- CreateTable
CREATE TABLE "sync_checkpoints" (
    "userId" TEXT NOT NULL,
    "lastProcessedRepo" TEXT NOT NULL,
    "lastProcessedCommit" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,

    CONSTRAINT "sync_checkpoints_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "sync_checkpoints" ADD CONSTRAINT "sync_checkpoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
