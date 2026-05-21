/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { FileCheck, Clock, Calendar, ExternalLink } from 'lucide-react';
import { resultsApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';

export default function LecturerSubmissionsPage() {
  const { user } = useAuthStore();

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['lecturer-submissions', user?.id],
    queryFn: () =>
      resultsApi.getLecturerSubmissions(user!.id).then((r) => r.data),
    enabled: !!user?.id,
  });

  const submissions = submissionsData?.submissions || [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className='bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase'>
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className='bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase'>
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className='bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase'>
            Rejected
          </span>
        );
      default:
        return (
          <span className='bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase'>
            {status}
          </span>
        );
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='section-title'>Result Submissions</h1>
        <p className='text-sm text-slate-500 mt-0.5'>
          Track the status of your uploaded results
        </p>
      </div>

      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100'>
              <tr>
                <th className='px-6 py-4 font-semibold'>Course</th>
                <th className='px-6 py-4 font-semibold'>Session/Semester</th>
                <th className='px-6 py-4 font-semibold'>Total Entries</th>
                <th className='px-6 py-4 font-semibold'>Date Submitted</th>
                <th className='px-6 py-4 font-semibold'>Status</th>
                <th className='px-6 py-4 font-semibold text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 text-sm'>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className='animate-pulse'>
                    <td colSpan={6} className='px-6 py-6'>
                      <div className='h-4 bg-slate-100 rounded w-full' />
                    </td>
                  </tr>
                ))
              ) : submissions.length > 0 ? (
                submissions.map((sub: any) => (
                  <tr
                    key={sub.id}
                    className='hover:bg-slate-50/50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='font-medium text-slate-800'>
                        {sub.course_code}
                      </div>
                      <div className='text-[11px] text-slate-400 line-clamp-1'>
                        {sub.course_title}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-slate-600'>
                      <div>{sub.session}</div>
                      <div className='text-[11px] capitalize text-slate-400'>
                        {sub.semester} Semester
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-1.5 font-medium text-slate-700'>
                        <FileCheck size={14} className='text-slate-400' />
                        {sub.entry_count}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-slate-500'>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4'>{getStatusBadge(sub.status)}</td>
                    <td className='px-6 py-4 text-right'>
                      <button className='text-slate-400 hover:text-esut-green p-1 transition-colors'>
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-12 text-center text-slate-400'
                  >
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
