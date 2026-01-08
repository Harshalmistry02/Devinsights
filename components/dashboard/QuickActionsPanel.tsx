'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ActionCardProps {
  title: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => Promise<void>;
}

/**
 * Enhanced Action Card with loading states, tooltips, and feedback
 */
function ActionCard({ title, href, icon, disabled, tooltip, onClick }: ActionCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (disabled || loading) return;

    if (onClick) {
      setLoading(true);
      try {
        await onClick();
        toast.success(`${title} completed successfully`);
      } catch (error) {
        console.error(`${title} failed:`, error);
        toast.error(`${title} failed. Please try again.`);
      } finally {
        setLoading(false);
      }
    } else {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
        "bg-slate-800/30 border border-slate-700/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-slate-800/50 hover:border-slate-600/50 hover:scale-[1.02] active:scale-[0.98]",
        loading && "animate-pulse cursor-wait"
      )}
      title={tooltip || title}
      aria-label={title}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      <div className="transition-transform duration-300">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" aria-hidden="true" />
        ) : (
          icon
        )}
      </div>
      <span className={cn(
        "text-sm font-medium transition-colors",
        disabled 
          ? "text-slate-500" 
          : loading 
            ? "text-cyan-400" 
            : "text-slate-300 group-hover:text-slate-100"
      )}>
        {loading ? 'Processing...' : title}
      </span>
      {loading && (
        <span className="sr-only">Loading, please wait</span>
      )}
    </button>
  );
}

interface QuickActionsPanelProps {
  actions: Array<{
    title: string;
    href: string;
    icon: React.ReactNode;
    disabled?: boolean;
    tooltip?: string;
    onClick?: () => Promise<void>;
  }>;
  className?: string;
}

/**
 * Quick Actions Panel
 * Enhanced with loading states, tooltips, and accessibility improvements
 */
export function QuickActionsPanel({ actions, className }: QuickActionsPanelProps) {
  return (
    <section 
      className={cn("bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm", className)}
      aria-labelledby="quick-actions-heading"
    >
      <h3 
        id="quick-actions-heading"
        className="text-lg sm:text-xl font-semibold text-slate-200 mb-3 sm:mb-4"
      >
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => (
          <ActionCard key={action.title} {...action} />
        ))}
      </div>
    </section>
  );
}

// Export ActionCard for standalone use
export { ActionCard };
