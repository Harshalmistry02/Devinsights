'use client';

import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

export interface InsightFilters {
  repoType: 'all' | 'personal' | 'work' | 'archived';
  languages: string[];
  includeForked: boolean;
}

export function InsightsFilters({
  onFilterChange,
  availableLanguages,
}: {
  onFilterChange: (filters: InsightFilters) => void;
  availableLanguages: string[];
}) {
  const [filters, setFilters] = useState<InsightFilters>({
    repoType: 'all',
    languages: [],
    includeForked: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (newFilters: Partial<InsightFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleLanguage = (lang: string) => {
    const updated = filters.languages.includes(lang)
      ? filters.languages.filter((l) => l !== lang)
      : [...filters.languages, lang];
    handleFilterChange({ languages: updated });
  };

  const clearLanguages = () => {
    handleFilterChange({ languages: [] });
  };

  return (
    <div className="space-y-4 bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm">
      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-800/50 text-slate-400 hover:text-slate-300 border border-slate-700/20 hover:border-slate-600/30 transition-all w-full justify-center"
      >
        <Filter className="w-4 h-4" />
        Advanced Filters
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 border-t border-slate-700/30 pt-4">
          {/* Repository Type Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Repository Type</label>
            <select
              value={filters.repoType}
              onChange={(e) =>
                handleFilterChange({ repoType: e.target.value as InsightFilters['repoType'] })
              }
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Repositories</option>
              <option value="personal">Personal Only</option>
              <option value="work">Work Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-400">
                Languages {filters.languages.length > 0 && `(${filters.languages.length})`}
              </label>
              {filters.languages.length > 0 && (
                <button
                  onClick={clearLanguages}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            {availableLanguages.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filters.languages.includes(lang)
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:text-slate-300 border border-slate-700/20 hover:border-slate-600/30'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No languages available</p>
            )}
          </div>

          {/* Fork Inclusion */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.includeForked}
              onChange={(e) => handleFilterChange({ includeForked: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
              Include forked repositories
            </span>
          </label>
        </div>
      )}

      {/* Active Filters Summary */}
      {(filters.languages.length > 0 || filters.repoType !== 'all' || filters.includeForked) && (
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/30">
          Active filters: 
          {filters.repoType !== 'all' && <span className="ml-1 text-cyan-400">{filters.repoType}</span>}
          {filters.languages.length > 0 && (
            <span className="ml-1 text-cyan-400">{filters.languages.length} languages</span>
          )}
          {filters.includeForked && <span className="ml-1 text-cyan-400">+forks</span>}
        </div>
      )}
    </div>
  );
}
