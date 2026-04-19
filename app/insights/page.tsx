import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  TrendingUp, 
  ArrowLeft, 
  Clock,
  BarChart3,
  RefreshCw,
  GitCommit,
  AlertTriangle,
  Trophy,
  Brain,
} from "lucide-react";
import { AIInsightsHero } from "./AIInsightsHero";
import { InsightsChartsSection } from "./InsightsChartsSection";
import { DataQualityIndicator } from "@/components/DataQualityIndicator";

import { CodeImpactCard } from "./components/CodeImpactCard";
import { RepoDeepDive } from "./components/RepoDeepDive";

import { detectPersona, type PersonaContext } from "@/lib/analytics/persona-detector";
import type { CodeImpactMetrics } from "@/lib/analytics/code-impact-analyzer";
import type { CommitQualityMetrics } from "@/lib/analytics/commit-quality-analyzer";

// Type definitions for JSON fields
type DailyCommits = Record<string, number>;
type DayOfWeekStats = Record<string, number>;
type HourlyStats = Record<string, number>;
type RepoStat = { id: string; name: string; fullName: string; commits: number; stars: number; forks: number; language: string | null };
type TopLanguage = { language: string; count: number; percentage: number };

/**
 * Insights Page - SpaceX Industrial Design
 */
export default async function InsightsPage() {
  const session = await requireAuth();
  const { user } = session;

  // Fetch analytics snapshot
  const analytics = await prisma.analyticsSnapshot.findUnique({
    where: { userId: user.id },
  });

  const hasData = analytics !== null;
  const isDataStale = analytics?.calculatedAt 
    ? (new Date().getTime() - new Date(analytics.calculatedAt).getTime()) > (24 * 60 * 60 * 1000)
    : false;

  const outlierCount = await prisma.commit.count({
    where: {
      repository: { userId: user.id },
      metadata: { path: ['isOutlier'], equals: true },
    },
  }).catch(() => 0);

  const dailyCommits = analytics?.dailyCommits as DailyCommits | null;
  const repoStats = analytics?.repoStats as RepoStat[] | null;
  const codeImpactMetrics = (analytics as any)?.codeImpactMetrics as CodeImpactMetrics | null;
  const commitQualityMetrics = (analytics as any)?.commitQualityMetrics as CommitQualityMetrics | null;

  const personaContext: PersonaContext = {
    hourlyStats: analytics?.hourlyStats as HourlyStats | null,
    dayOfWeekStats: analytics?.dayOfWeekStats as any,
    topLanguages: analytics?.topLanguages as TopLanguage[] | null,
    currentStreak: analytics?.currentStreak,
    totalCommits: analytics?.totalCommits,
    totalRepos: analytics?.totalRepos,
  };
  const persona = analytics ? detectPersona(personaContext) : null;

  return (
    <div className="section-cinematic bg-black items-start">
      <div 
        className="section-photo grayscale opacity-40 transition-opacity duration-1000" 
        style={{ 
          backgroundImage: "url('/space-hero.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center"
        }} 
      />
      <div className="section-overlay" />
      
      <div className="section-content relative z-20 w-full" style={{ padding: "clamp(88px, 14vh, 120px) clamp(24px, 6vw, 80px) 40px" }}>
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <Link
            href="/dashboard"
            className="text-micro uppercase tracking-[4px] opacity-40 hover:opacity-100 transition-all inline-flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10"
          >
            <ArrowLeft size={11} />
            BACK TO MISSION CONTROL
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 border-b border-white/10 pb-8 sm:pb-10">
            <div>
              <p className="text-micro uppercase tracking-[5px] opacity-20 mb-4 font-bold">ARCHIVE ANALYSIS</p>
              <h1 className="text-display-hero font-bold opacity-80 tracking-tighter">CODING INSIGHTS</h1>
              <p className="text-micro uppercase tracking-[3px] opacity-20 mt-4 leading-relaxed">
                DEEP SYSTEM ANALYTICS / COGNITIVE PATTERN RECOGNITION
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-3">
              {analytics?.calculatedAt && (
                <div className="flex items-center gap-3 opacity-20 text-micro uppercase tracking-widest font-mono">
                  <Clock size={11} />
                  ARCHIVE_UPDATE: {new Date(analytics.calculatedAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }).toUpperCase()}
                </div>
              )}
              {isDataStale && (
                <div className="flex items-center gap-3 opacity-40 text-micro uppercase tracking-widest bg-white/5 px-4 py-1 border border-white/10">
                  <AlertTriangle size={11} />
                  SYNC_REQUIRED: STALE_DATA
                </div>
              )}
            </div>
          </div>
        </header>

        {hasData ? (
          <div className="space-y-8 sm:space-y-12">
            {/* AI Insights Hero */}
            <AIInsightsHero 
              analytics={{
                totalCommits: analytics.totalCommits,
                currentStreak: analytics.currentStreak,
                longestStreak: analytics.longestStreak,
                isActiveToday: analytics.isActiveToday,
                lastCommitDate: analytics.lastCommitDate,
              }}
            />

            {/* AI Stats Banner */}
            <AIStatsBanner analytics={analytics} userId={user.id} persona={persona} />

            {/* Data Quality Indicator */}
            {outlierCount > 0 && (
              <DataQualityIndicator
                outlierCount={outlierCount}
                unknownExtensionPercent={0}
                totalCommits={analytics.totalCommits}
              />
            )}

            {/* Repository Deep Dive */}
            {repoStats && repoStats.length > 0 && (
              <div className="brutalist-glass p-1">
                <RepoDeepDive repoStats={repoStats} />
              </div>
            )}

            {/* Quality & Impact Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <CodeImpactCard metrics={codeImpactMetrics} />
              
              <div className="brutalist-glass p-5 sm:p-8 border-l-2 border-l-white/10 min-w-0">
                <div className="mb-10 border-l-2 border-white/20 pl-6">
                  <h3 className="text-caption-bold text-sm tracking-widest uppercase opacity-80">CODE QUALITY SUMMARY</h3>
                  <p className="text-micro opacity-20 uppercase tracking-widest mt-2 font-bold">COMMIT LOG ANALYSIS</p>
                </div>

                {commitQualityMetrics ? (
                  <div className="space-y-12">
                    <div className="flex flex-col items-center justify-center">
                       <span className="text-display-hero text-7xl font-bold opacity-80 mb-4 font-mono">
                         {commitQualityMetrics.qualityGrade}
                       </span>
                        <div className="px-5 py-2 text-micro font-bold border border-white/10 uppercase tracking-[4px]">
                          QUALITATIVE RANKing
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
                        <p className="text-micro opacity-20 mb-3 tracking-[2px] uppercase">CONVENTIONAL</p>
                        <p className="text-3xl font-bold opacity-80 tabular-nums font-mono">{commitQualityMetrics.conventionalCommitScore}%</p>
                      </div>
                      <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
                        <p className="text-micro opacity-20 mb-3 tracking-[2px] uppercase">ISSUE REFS</p>
                        <p className="text-3xl font-bold opacity-80 tabular-nums font-mono">{commitQualityMetrics.hasTicketReferences}%</p>
                      </div>
                    </div>
                    
                    {commitQualityMetrics.insights.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="text-micro opacity-20 uppercase tracking-[2px] mb-2">SYSTEM NOTES:</div>
                        {commitQualityMetrics.insights.slice(0, 3).map((insight, index) => (
                           <div key={index} className="flex items-start gap-4 text-micro opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest leading-relaxed">
                            <span className="shrink-0 w-8 h-px bg-white/20 mt-2" />
                            <span>{insight.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center opacity-20">
                     <p className="text-micro uppercase tracking-[3px]">INSUFFICIENT DATA FOR QUALITY METRICS</p>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Analytics Section */}
            <InsightsChartsSection
              dailyCommits={analytics.dailyCommits as DailyCommits}
              dayOfWeekStats={analytics.dayOfWeekStats as DayOfWeekStats}
              hourlyStats={analytics.hourlyStats as HourlyStats}
              repoStats={repoStats}
              topLanguages={analytics.topLanguages as TopLanguage[]}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

async function AIStatsBanner({ analytics, userId, persona }: { 
  analytics: any; 
  userId: string;
  persona: any;
}) {
  const insightCount = await prisma.insightCache.count({ where: { userId } });
  
  const stats = [
    {
      label: 'SYSTEM INSIGHTS',
      value: insightCount.toLocaleString(),
      icon: <Brain className="w-5 h-5" />,
      sublabel: 'ARCHIVE_INDEX_COUNT',
    },
    {
      label: 'MAX_CYCLE_STREAK',
      value: `${analytics.longestStreak}D`,
      icon: <Trophy className="w-5 h-5" />,
      sublabel: 'PERSONAL_RECORD',
    },
    {
      label: 'SYSTEM_UPTIME',
      value: 'NOMINAL',
      icon: <TrendingUp className="w-5 h-5" />,
      sublabel: 'CYCLE_VALIDATED',
    },
    {
      label: 'DAILY_ACTIVITY',
      value: 'ACTIVE',
      icon: <GitCommit className="w-5 h-5" />,
      sublabel: 'NOMINAL_VELOCITY',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Developer Persona Badge */}
      {persona && (
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 sm:gap-10 border-b border-white/5 pb-8 sm:pb-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-display-hero text-2xl sm:text-3xl font-bold opacity-80 uppercase tracking-widest">
                {persona.primary.name}
              </span>
              <span className="px-3 py-1 border border-white/10 text-micro uppercase tracking-[3px] opacity-40">
                {persona.primary.rarity}
              </span>
            </div>
            <p className="text-micro uppercase tracking-[3px] opacity-20 leading-relaxed max-w-xl">
              {persona.primary.description}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl font-bold opacity-80 tracking-widest font-mono">{persona.confidence}%</div>
            <div className="text-micro uppercase tracking-[3px] opacity-20">COGNITIVE_MATCH</div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-4 group cursor-default">
            <div className="flex items-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <div className="p-1.5 border border-white/10">{stat.icon}</div>
              <p className="text-micro font-bold tracking-widest uppercase">{stat.label}</p>
            </div>
            <p className="text-display-hero text-4xl font-bold opacity-80 group-hover:opacity-100 transition-opacity font-mono">{stat.value}</p>
            <p className="text-micro tracking-[3px] uppercase opacity-20 group-hover:opacity-40 transition-opacity">{stat.sublabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="brutalist-glass p-8 sm:p-16 lg:p-32 text-center border-l-2 border-l-white/10">
        <div className="w-24 h-24 border border-white/10 flex items-center justify-center mx-auto mb-10 opacity-20">
           <BarChart3 size={40} className="text-[#f0f0fa]" />
        </div>
        <h2 className="text-caption-bold text-lg tracking-[5px] uppercase mb-6 opacity-80">
          ARCHIVE DATA NULL
        </h2>
        <p className="text-micro opacity-20 uppercase tracking-[3px] mb-12 max-w-sm mx-auto leading-loose">
          PERFORM SYSTEM SYNC TO INITIALIZE ARCHIVE ANALYTICS AND COGNITIVE MAPPING.
        </p>
        <Link href="/dashboard" className="btn-ghost px-12 py-4 text-micro uppercase tracking-[4px] inline-flex items-center gap-4">
          <RefreshCw size={13} className="opacity-40" />
          INITIALIZE SYNC
        </Link>
    </div>
  );
}
