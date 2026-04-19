-- Drop the legacy global uniqueness constraint on GitHub repository IDs.
ALTER TABLE "repositories" DROP CONSTRAINT IF EXISTS "repositories_githubId_key";
ALTER TABLE "repositories" DROP CONSTRAINT IF EXISTS "Repository_githubId_key";

-- Add tenant-scoped uniqueness so the same GitHub repo can exist per user without collisions.
ALTER TABLE "repositories"
  ADD CONSTRAINT "repositories_userId_githubId_key" UNIQUE ("userId", "githubId");
