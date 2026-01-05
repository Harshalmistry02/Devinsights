-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalRepos" INTEGER NOT NULL DEFAULT 0,
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalAdditions" INTEGER NOT NULL DEFAULT 0,
    "totalDeletions" INTEGER NOT NULL DEFAULT 0,
    "totalStars" INTEGER NOT NULL DEFAULT 0,
    "totalForks" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCommitDate" TIMESTAMP(3),
    "isActiveToday" BOOLEAN NOT NULL DEFAULT false,
    "languageStats" JSONB,
    "dailyCommits" JSONB,
    "dayOfWeekStats" JSONB,
    "hourlyStats" JSONB,
    "repoStats" JSONB,
    "topLanguages" JSONB,
    "averageCommitsPerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mostProductiveDay" TEXT,
    "mostProductiveHour" INTEGER,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRangeStart" TIMESTAMP(3),
    "dataRangeEnd" TIMESTAMP(3),

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_userId_key" ON "analytics_snapshots"("userId");

-- CreateIndex
CREATE INDEX "analytics_snapshots_userId_idx" ON "analytics_snapshots"("userId");

-- CreateIndex
CREATE INDEX "analytics_snapshots_calculatedAt_idx" ON "analytics_snapshots"("calculatedAt");

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
