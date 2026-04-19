/**
 * Library Barrel Exports
 * Centralized exports for better tree-shaking and imports
 */

// Core
export { default as prisma } from './prisma';
export { auth } from './auth';
export { cn } from './utils';
export { config, env } from './env';

// Analytics
export * from './analytics';

// GitHub
export * from './github/auth-token';
export { GitHubSyncService } from './github/sync-service';
export { AdvancedGitHubSyncService } from './github/advanced-sync-service';

// AI
export * from './ai';

// Hooks
export * from './hooks';
