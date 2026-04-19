-- Fix missing unique constraint on repositories table
-- This constraint is required for the upsert operation in RepositoryDataPipeline

-- Check if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'repositories_userId_githubId_key'
    ) THEN
        -- Create the unique constraint
        ALTER TABLE "repositories" 
        ADD CONSTRAINT "repositories_userId_githubId_key" 
        UNIQUE ("userId", "githubId");
        
        RAISE NOTICE 'Unique constraint repositories_userId_githubId_key created successfully';
    ELSE
        RAISE NOTICE 'Unique constraint repositories_userId_githubId_key already exists';
    END IF;
END $$;
