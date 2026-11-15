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

export function useSessionOptions(programmeId?: string | null) {
  // All sessions from DB
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-all-sessions'],
    queryFn: () => adminApi.getSessions().then((r) => r.data),
    staleTime: 60_000,
  });

  // Current active session (programme-specific or global default)
  const { data: currentSessionData, isLoading: currentSessionLoading } =
    useQuery({
      queryKey: ['admin-current-session', programmeId ?? 'global'],
      queryFn: () =>
        adminApi.getCurrentSession(programmeId ?? undefined).then((r) => r.data),
      staleTime: 60_000,
    });

  const rawSessions: string[] = sessionsData?.sessions ?? [];
  const fetchedCurrent: string | null = currentSessionData?.session ?? null;

  // Build a distinct set of sessions:
  // 1. Always prioritize current active session from backend
  // 2. Add all sessions from DB
  const sessionSet = new Set<string>();
  if (fetchedCurrent) {
    sessionSet.add(fetchedCurrent);
  }
  rawSessions.forEach((s) => {
    if (s) sessionSet.add(s);
  });

  // Fallback generation so dropdowns never render empty or outdated
  if (sessionSet.size === 0) {
    sessionSet.add('2024/2025');
    sessionSet.add('2023/2024');
    sessionSet.add('2025/2026');
  }

  // Sort descending: e.g. 2026/2027, 2025/2026, 2024/2025, 2023/2024...
  const sessions = Array.from(sessionSet).sort().reverse();
  const currentSession = fetchedCurrent || sessions[0] || '2024/2025';

  return {
    sessions,
    currentSession,
    isLoading: sessionsLoading || currentSessionLoading,
  };
}
