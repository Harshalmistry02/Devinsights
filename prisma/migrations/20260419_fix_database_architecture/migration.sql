-- Fix Issue #1: Remove global githubId uniqueness, keep compound unique
ALTER TABLE "repositories" DROP CONSTRAINT IF EXISTS "repositories_githubId_key";
ALTER TABLE "repositories" DROP CONSTRAINT IF EXISTS "Repository_githubId_key";
-- Compound unique already exists: @@unique([userId, githubId])

-- Fix Issue #2: Add FK indexes for faster lookups
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");

-- Fix Issue #3: Fix InsightCache hash scoping - remove global unique, add compound unique
ALTER TABLE "insight_caches" DROP CONSTRAINT IF EXISTS "insight_caches_dataHash_key";
CREATE UNIQUE INDEX IF NOT EXISTS "insight_caches_userId_dataHash_key" ON "insight_caches"("userId", "dataHash");

-- Fix Issue #4: Add missing Commit indexes
CREATE INDEX IF NOT EXISTS "commits_createdAt_idx" ON "commits"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "commits_repositoryId_authorDate_idx" ON "commits"("repositoryId", "authorDate" DESC);

-- Fix Issue #5: Update Repository indexes
DROP INDEX IF EXISTS "repositories_githubId_idx";
CREATE INDEX IF NOT EXISTS "repositories_lastSyncedAt_idx" ON "repositories"("lastSyncedAt" DESC);

-- Fix Issue #6: Add User and AiUsage relationship support
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Fix Issue #7: Update SyncCheckpoint to use proper foreign keys
ALTER TABLE "sync_checkpoints" 
  DROP CONSTRAINT IF EXISTS "sync_checkpoints_userId_fkey";

ALTER TABLE "sync_checkpoints"
  DROP COLUMN IF EXISTS "lastProcessedRepo",
  DROP COLUMN IF EXISTS "lastProcessedCommit",
  DROP COLUMN IF EXISTS "timestamp";

ALTER TABLE "sync_checkpoints"
  ADD COLUMN IF NOT EXISTS "lastProcessedRepoId" TEXT,
  ADD COLUMN IF NOT EXISTS "lastProcessedCommitId" TEXT,
  ADD COLUMN IF NOT EXISTS "lastProcessedCommitSha" TEXT,
  ADD COLUMN IF NOT EXISTS "lastSyncTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "sync_checkpoints"
  ADD CONSTRAINT "sync_checkpoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  ADD CONSTRAINT "sync_checkpoints_lastProcessedRepoId_fkey" FOREIGN KEY ("lastProcessedRepoId") REFERENCES "repositories"("id");

-- Add index on SyncCheckpoint for queries
CREATE INDEX IF NOT EXISTS "sync_checkpoints_lastSyncTimestamp_idx" ON "sync_checkpoints"("lastSyncTimestamp" DESC);

-- Fix Issue #8: Update Commit message field type
ALTER TABLE "commits" ALTER COLUMN "message" SET DATA TYPE TEXT;

-- Fix Issue #9: Add missing User index
CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");

-- Fix Issue #10: Add index for cache cleanup queries
CREATE INDEX IF NOT EXISTS "insight_caches_userId_expiresAt_idx" ON "insight_caches"("userId", "expiresAt");
