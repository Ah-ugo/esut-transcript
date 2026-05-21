/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { transcriptsApi } from '../../../lib/api';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
  BookOpen,
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PublicVerificationPage() {
  const params = useParams();
  const matricArray = params.matric as string[];
  // Joins segments like ["ESUT", "2026", "COE", "123"] back into "ESUT/2026/COE/123"
  const matricNumber = matricArray?.join('/') || '';

  const { data: ver, isLoading } = useQuery({
    queryKey: ['verify', matricNumber],
    queryFn: () => transcriptsApi.verify(matricNumber).then((r) => r.data),
    enabled: !!matricNumber,
  });

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-esut-green'></div>
      </div>
    );

  return (
    <div className='min-h-screen bg-slate-50 py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-8'>
          <div className='inline-flex p-3 bg-white rounded-2xl shadow-sm mb-4'>
            <ShieldCheck size={32} className='text-esut-green' />
          </div>
          <h1 className='text-2xl font-bold text-slate-900'>
            ESUT Transcript Verification
          </h1>
          <p className='text-slate-500 text-sm mt-1'>
            Official Digital Result Verification Portal
          </p>
        </div>

        <div
          className={`card p-8 border-t-4 ${ver?.verified ? 'border-t-green-500' : 'border-t-red-500'}`}
        >
          {ver?.verified ? (
            <div className='space-y-6'>
              <div className='flex items-center gap-3 text-green-600 font-bold mb-6'>
                <CheckCircle2 size={24} />
                <span>Record Verified Authentically</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100'>
                <div>
                  <label className='text-[10px] uppercase font-bold text-slate-400 tracking-wider'>
                    Student Name
                  </label>
                  <div className='text-slate-800 font-medium flex items-center gap-2 mt-1'>
                    <User size={14} /> {ver.student_name}
                  </div>
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-slate-400 tracking-wider'>
                    Matric Number
                  </label>
                  <div className='text-slate-800 font-medium mt-1'>
                    {ver.matric_number}
                  </div>
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-slate-400 tracking-wider'>
                    Programme
                  </label>
                  <div className='text-slate-800 font-medium flex items-center gap-2 mt-1'>
                    <BookOpen size={14} /> {ver.programme}
                  </div>
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-slate-400 tracking-wider'>
                    CGPA / Class
                  </label>
                  <div className='text-slate-800 font-bold mt-1 text-lg'>
                    {ver.cgpa}{' '}
                    <span className='text-sm font-normal text-slate-500'>
                      ({ver.degree_class})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <XCircle size={48} className='text-red-500 mx-auto mb-4' />
              <h2 className='text-xl font-bold text-slate-800'>
                Verification Failed
              </h2>
              <p className='text-slate-500 mt-2'>
                No record found for matric number:{' '}
                <span className='font-mono'>{matricNumber}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
