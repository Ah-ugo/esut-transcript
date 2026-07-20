/** @format */

'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { programmesApi, adminApi } from '../../../../lib/api';

const COMMON_SESSIONS = [
  '2020/2021',
  '2021/2022',
  '2022/2023',
  '2023/2024',
  '2024/2025',
  '2025/2026',
  '2026/2027',
  '2027/2028',
  '2028/2029',
  '2029/2030',
  '2030/2031',
  '2031/2032',
  '2032/2033',
  '2033/2034',
  '2034/2035',
];

export default function AdminSessionsPage() {
  const [selectedProgrammeCode, setSelectedProgrammeCode] =
    useState<string>('');

  const { data: programmesData } = useQuery({
    queryKey: ['admin-programmes-for-session'],
    queryFn: () => programmesApi.list(1, 100).then((r) => r.data),
  });

  const selectedProgrammeId = useMemo(() => {
    if (!selectedProgrammeCode) return null;
    const p = programmesData?.data?.find(
      (x: any) => x.code === selectedProgrammeCode,
    );
    return p?.id ?? null;
  }, [selectedProgrammeCode, programmesData]);

  const {
    data: currentSessionData,
    refetch: refetchCurrentSession,
    isFetching,
  } = useQuery({
    queryKey: ['admin-current-session', selectedProgrammeId],
    queryFn: () =>
      adminApi.getCurrentSession(selectedProgrammeId).then((r) => r.data),
    enabled: selectedProgrammeId !== undefined && selectedProgrammeId !== null,
  });

  useEffect(() => {
    // Auto-select first programme if none selected
    const first = programmesData?.data?.[0];
    if (!selectedProgrammeCode && first?.code) {
      setSelectedProgrammeCode(first.code);
    }
  }, [programmesData, selectedProgrammeCode]);

  const [sessionToSave, setSessionToSave] = useState('');

  useEffect(() => {
    const s = currentSessionData?.session;
    if (s) setSessionToSave(s);
  }, [currentSessionData]);

  const setCurrentSessionMut = useMutation({
    mutationFn: (payload: { programme_id: string | null; session: string }) =>
      adminApi.setCurrentSession(payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Current session updated');
      refetchCurrentSession();
    },
    onError: (e: any) => {
      const detail = e?.response?.data?.detail;
      toast.error(
        typeof detail === 'string'
          ? detail
          : 'Failed to update current session',
      );
    },
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>Academic Sessions</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            Set the active academic session per programme
          </p>
        </div>
      </div>

      <div className='card p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <label className='text-xs font-bold text-slate-500 uppercase'>
              Programme
            </label>
            <select
              value={selectedProgrammeCode}
              onChange={(e) => setSelectedProgrammeCode(e.target.value)}
              className='input'
            >
              <option value=''>Select programme</option>
              {(programmesData?.data || []).map((p: any) => (
                <option key={p.id} value={p.code}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-1'>
            <label className='text-xs font-bold text-slate-500 uppercase'>
              Current session (from backend)
            </label>
            <div className='input flex items-center justify-between gap-3'>
              <span className='text-sm font-medium'>
                {isFetching
                  ? 'Loading...'
                  : currentSessionData?.session || 'Not set'}
              </span>
              <span className='badge badge-gray'>Active</span>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-xs font-bold text-slate-500 uppercase'>
            Set session
          </label>
          <select
            value={sessionToSave}
            onChange={(e) => setSessionToSave(e.target.value)}
            className='input w-full'
            disabled={!selectedProgrammeId}
          >
            <option value=''>Select session</option>
            {COMMON_SESSIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className='flex justify-end gap-3 pt-2'>
          <button
            className='btn-secondary'
            type='button'
            onClick={() => {
              const s = currentSessionData?.session;
              setSessionToSave(s || '');
            }}
            disabled={!selectedProgrammeId || !currentSessionData}
          >
            Reset
          </button>

          <button
            className='btn-primary'
            type='button'
            disabled={
              !selectedProgrammeId ||
              !sessionToSave ||
              setCurrentSessionMut.isPending
            }
            onClick={() => {
              setCurrentSessionMut.mutate({
                programme_id: selectedProgrammeId,
                session: sessionToSave,
              });
            }}
          >
            {setCurrentSessionMut.isPending
              ? 'Saving...'
              : 'Save Current Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
