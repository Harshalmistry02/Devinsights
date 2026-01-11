import useSWR from 'swr';

interface QuotaStatus {
  tokensUsed: number;
  requestsToday: number;
  remainingTokens: number;
  remainingRequests: number;
  isWithinQuota: boolean;
  resetAt: string;
  percentUsed: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useQuota() {
  const { data, error, isLoading, mutate } = useSWR<QuotaStatus>(
    '/api/ai/quota',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return {
    quota: data,
    isLoading,
    isError: error,
    refresh: mutate,
    resetAt: data?.resetAt ? new Date(data.resetAt) : undefined,
  };
}
