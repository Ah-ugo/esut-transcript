/** @format */

/**
 * useSessionOptions
 *
 * Fetches all distinct academic sessions that actually exist in the database
 * (from results, course assignments, and admin-configured sessions).
 *
 * Returns them in descending order so the most recent (e.g. 2024/2025) is first.
 *
 * Usage:
 *   const { sessions, isLoading, currentSession } = useSessionOptions();
 */

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';

export function useSessionOptions(programmeId?: string) {
  // All sessions from DB
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-all-sessions'],
    queryFn: () => adminApi.getSessions().then((r) => r.data),
    staleTime: 60_000, // cache for 1 minute
  });

  // Current active session for the given programme
  const { data: currentSessionData, isLoading: currentSessionLoading } =
    useQuery({
      queryKey: ['admin-current-session', programmeId ?? null],
      queryFn: () =>
        adminApi.getCurrentSession(programmeId).then((r) => r.data),
      staleTime: 60_000,
    });

  const sessions: string[] = sessionsData?.sessions ?? [];
  const currentSession: string | null =
    currentSessionData?.session ?? sessions[0] ?? null;

  return {
    sessions,
    currentSession,
    isLoading: sessionsLoading || currentSessionLoading,
  };
}
