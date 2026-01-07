'use client';

import React from 'react';

/**
 * Skeleton Components for Loading States
 * 
 * Provides visual feedback during data loading with animated placeholder elements.
 * Uses a consistent pulse animation matching the app's design system.
 */

// Base skeleton with pulse animation
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-700/50 rounded ${className}`}
    />
  );
}

// Profile Card Skeleton (sidebar)
export function ProfileCardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Profile Header Gradient */}
      <div className="h-24 bg-slate-800/50 animate-pulse" />
      
      {/* Avatar */}
      <div className="px-6 -mt-12 relative">
        <Skeleton className="w-24 h-24 rounded-full border-4 border-slate-900" />
      </div>

      {/* User Info */}
      <div className="px-6 pt-4 pb-6 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
        
        {/* Status Badge */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        
        {/* Divider */}
        <div className="border-t border-slate-700/30 my-4" />
        
        {/* Sync Button */}
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-6 h-6 rounded" />
      </div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

// Stats Grid Skeleton
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`${height} bg-slate-800/30 rounded-lg relative overflow-hidden`}>
      <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            className={`w-4 rounded-t`} 
            style={{ height: `${Math.random() * 60 + 20}%` }} 
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-800/20 to-transparent animate-shimmer" />
    </div>
  );
}

// Insight Card Skeleton
export function InsightCardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

// Language Bar Skeleton
export function LanguageBarSkeleton() {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

// Activity Overview Skeleton
export function ActivityOverviewSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center p-3 bg-slate-800/30 rounded-lg">
            <Skeleton className="h-6 w-full mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Complete Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <ProfileCardSkeleton />
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Welcome Header */}
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Stats Grid */}
            <StatsGridSkeleton />

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <InsightCardSkeleton key={i} />
              ))}
            </div>

            {/* Language Distribution */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <LanguageBarSkeleton key={i} />
                ))}
              </div>
            </div>

            {/* Activity Overview */}
            <ActivityOverviewSkeleton />

            {/* Chart Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <ChartSkeleton height="h-48" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton height="h-64" />
                <ChartSkeleton height="h-64" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Export all skeletons
export {
  Skeleton,
};
