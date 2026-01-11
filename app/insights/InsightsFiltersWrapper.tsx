'use client';

import { InsightsFilters, type InsightFilters } from '@/components/InsightsFilters';
import { useState } from 'react';

interface InsightsFiltersWrapperProps {
  availableLanguages: string[];
}

export function InsightsFiltersWrapper({ availableLanguages }: InsightsFiltersWrapperProps) {
  const [filters, setFilters] = useState<InsightFilters | null>(null);

  const handleFilterChange = (newFilters: InsightFilters) => {
    setFilters(newFilters);
    // Future: Could store in URL params or trigger data refetch
    console.log('Filters changed:', newFilters);
  };

  return (
    <InsightsFilters 
      onFilterChange={handleFilterChange}
      availableLanguages={availableLanguages}
    />
  );
}
