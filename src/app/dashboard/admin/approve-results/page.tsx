/** @format */

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  CheckSquare,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { adminApi, resultsApi } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function GradeBadge({ grade }: { grade: string }) {
  const cls: Record<string, string> = {
    A: 'grade-a',
    B: 'grade-b',
    C: 'grade-c',
    D: 'grade-d',
    E: 'grade-e',
    F: 'grade-f',
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${cls[grade] || 'bg-gray-100 text-gray-700'}`}
    >
      {grade}
    </span>
  );
}

export default function ApproveResultsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-results', page],
    queryFn: () => adminApi.getPendingResults(page, 20).then((r) => r.data),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => resultsApi.approve(id),
    onSuccess: () => {
      toast.success('Result approved');
      qc.invalidateQueries({ queryKey: ['pending-results'] });
    },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      resultsApi.reject(id, reason),
    onSuccess: () => {
      toast.success('Result rejected');
      setRejectId(null);
      setRejectReason('');
      qc.invalidateQueries({ queryKey: ['pending-results'] });
    },
    onError: () => toast.error('Failed to reject'),
  });

  const bulkApproveMut = useMutation({
    mutationFn: () => resultsApi.bulkApprove(selected),
    onSuccess: () => {
      toast.success(`${selected.length} results approved`);
      setSelected([]);
      qc.invalidateQueries({ queryKey: ['pending-results'] });
    },
    onError: () => toast.error('Bulk approval failed'),
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const selectAll = () => {
    const ids = data?.data?.map((r: any) => r.id) || [];
    setSelected(selected.length === ids.length ? [] : ids);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>Approve Results</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            Review and approve pending result submissions
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {selected.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => bulkApproveMut.mutate()}
              disabled={bulkApproveMut.isPending}
              className='btn-primary flex items-center gap-2'
            >
              <CheckSquare size={15} />
              Approve {selected.length} Selected
            </motion.button>
          )}
          <button
            onClick={() => refetch()}
            className='btn-secondary flex items-center gap-2'
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className='card overflow-hidden'>
        {/* Table header */}
        <div className='px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3'>
          <input
            type='checkbox'
            checked={
              selected.length === (data?.data?.length || 0) &&
              data?.data?.length > 0
            }
            onChange={selectAll}
            className='rounded'
          />
          <span className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
            {data?.total || 0} Pending Results
          </span>
        </div>

        {isLoading ? (
          <div className='divide-y divide-slate-50'>
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className='flex items-center gap-4 p-4'>
                  <div className='skeleton w-4 h-4 rounded' />
                  <div className='skeleton w-10 h-10 rounded-xl' />
                  <div className='flex-1 space-y-2'>
                    <div className='skeleton h-3 w-48 rounded' />
                    <div className='skeleton h-3 w-32 rounded' />
                  </div>
                  <div className='flex gap-2'>
                    <div className='skeleton w-20 h-8 rounded-lg' />
                    <div className='skeleton w-20 h-8 rounded-lg' />
                  </div>
                </div>
              ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className='text-center py-16'>
            <CheckCircle size={48} className='mx-auto text-green-400 mb-3' />
            <p className='text-slate-600 font-medium'>All caught up!</p>
            <p className='text-slate-400 text-sm'>
              No pending results to review.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-slate-50'>
            {data?.data?.map((result: any, i: number) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors ${selected.includes(result.id) ? 'bg-esut-green/5' : ''}`}
              >
                <input
                  type='checkbox'
                  checked={selected.includes(result.id)}
                  onChange={() => toggleSelect(result.id)}
                  className='rounded flex-shrink-0'
                />
                <div className='w-10 h-10 rounded-xl bg-esut-green/10 flex items-center justify-center flex-shrink-0'>
                  <GradeBadge grade={result.grade} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-sm text-slate-800 truncate'>
                    {result.student_name}
                  </p>
                  <p className='text-xs text-slate-400 truncate'>
                    {result.matric_number} · {result.course_code} —{' '}
                    {result.course_title}
                  </p>
                </div>
                <div className='text-center hidden md:block'>
                  <p className='font-bold text-slate-700'>{result.score}</p>
                  <p className='text-xs text-slate-400'>Score</p>
                </div>
                <div className='text-center hidden md:block'>
                  <p className='text-xs text-slate-600 font-medium'>
                    {result.session}
                  </p>
                  <p className='text-xs text-slate-400 capitalize'>
                    {result.semester} Sem
                  </p>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <button
                    onClick={() => approveMut.mutate(result.id)}
                    disabled={approveMut.isPending}
                    className='flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors disabled:opacity-50'
                  >
                    <CheckCircle size={13} />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectId(result.id)}
                    className='flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors'
                  >
                    <XCircle size={13} />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.total > 20 && (
          <div className='flex items-center justify-between px-5 py-3 border-t border-slate-100'>
            <p className='text-xs text-slate-500'>
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of{' '}
              {data.total}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='btn-secondary py-1.5 px-3 text-xs'
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= data.total}
                className='btn-secondary py-1.5 px-3 text-xs'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='card w-full max-w-md p-6'
          >
            <h3 className='font-semibold text-slate-800 mb-2'>Reject Result</h3>
            <p className='text-sm text-slate-500 mb-4'>
              Please provide a reason for rejection.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder='e.g. Score mismatch, invalid entry...'
              className='input h-24 resize-none mb-4'
            />
            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => {
                  setRejectId(null);
                  setRejectReason('');
                }}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  rejectMut.mutate({ id: rejectId!, reason: rejectReason })
                }
                disabled={!rejectReason.trim() || rejectMut.isPending}
                className='btn-danger'
              >
                {rejectMut.isPending ? 'Rejecting...' : 'Reject Result'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
