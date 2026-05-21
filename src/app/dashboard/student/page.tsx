/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  TrendingUp,
  Download,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { resultsApi, studentsApi, transcriptsApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

function GPAGauge({ cgpa }: { cgpa: number }) {
  const pct = (cgpa / 5.0) * 100;
  const color =
    cgpa >= 4.5
      ? '#1a5c38'
      : cgpa >= 3.5
        ? '#2d7a50'
        : cgpa >= 2.4
          ? '#c9a84c'
          : '#ef4444';
  const data = [{ name: 'CGPA', value: pct, fill: color }];

  return (
    <div className='relative w-36 h-36'>
      <ResponsiveContainer width='100%' height='100%'>
        <RadialBarChart
          innerRadius='70%'
          outerRadius='100%'
          data={data}
          startAngle={225}
          endAngle={-45}
        >
          <RadialBar
            background={{ fill: '#f1f5f9' }}
            dataKey='value'
            cornerRadius={8}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-3xl font-bold text-slate-800 font-display'>
          {cgpa.toFixed(2)}
        </span>
        <span className='text-xs text-slate-500'>/ 5.00</span>
      </div>
    </div>
  );
}

function GradePill({ grade }: { grade: string }) {
  const map: Record<string, string> = {
    A: 'bg-green-100 text-green-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-orange-100 text-orange-700',
    E: 'bg-red-100 text-red-600',
    F: 'bg-red-200 text-red-800',
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${map[grade] || 'bg-gray-100 text-gray-600'}`}
    >
      {grade}
    </span>
  );
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [studentId, setStudentId] = useState<string | null>(null);

  const { data: studentData } = useQuery({
    queryKey: ['student-profile', user?.matric_number],
    queryFn: () =>
      studentsApi.getByMatric(user!.matric_number!).then((r) => r.data),
    enabled: !!user?.matric_number,
    onSuccess: (d: any) => setStudentId(d.id),
  } as any);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['student-summary', studentId],
    queryFn: () => resultsApi.getStudentSummary(studentId!).then((r) => r.data),
    enabled: !!studentId,
  });

  const handleDownload = async () => {
    if (!studentId) return;
    try {
      const res = await transcriptsApi.downloadPdf(studentId);
      const url = URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `Transcript_${user?.matric_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Transcript downloaded!');
    } catch {
      toast.error('Failed to download transcript');
    }
  };

  const cgpa = summary?.cgpa ?? 0;
  const degreeClass = summary?.degree_class ?? '—';
  const totalSemesters = summary?.semesters?.length ?? 0;
  const totalUnits = summary?.total_units ?? 0;

  // Recent results (last semester)
  const lastSemester = summary?.semesters?.[summary.semesters.length - 1];

  return (
    <div className='space-y-6'>
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative overflow-hidden rounded-2xl bg-esut-green p-6 text-white'
      >
        <div className='absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full' />
        <div className='absolute bottom-0 right-12 w-28 h-28 bg-esut-gold/15 rounded-full' />
        <div className='relative z-10 flex items-center justify-between'>
          <div>
            <p className='text-white/70 text-sm font-medium'>Welcome back,</p>
            <h1 className='text-2xl font-bold font-display mt-0.5'>
              {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className='text-white/60 text-sm mt-1'>
              {studentData?.matric_number} · {studentData?.programme_name}
            </p>
          </div>
          <div className='hidden sm:block text-right'>
            <p className='text-white/60 text-xs'>Level</p>
            <p className='text-3xl font-bold text-esut-gold'>
              {studentData?.level || '—'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          {
            label: 'CGPA',
            value: cgpa.toFixed(2),
            icon: Award,
            color: 'bg-esut-green',
            sub: 'Cumulative',
          },
          {
            label: 'Semesters',
            value: totalSemesters,
            icon: BookOpen,
            color: 'bg-blue-500',
            sub: 'Completed',
          },
          {
            label: 'Credit Units',
            value: totalUnits,
            icon: TrendingUp,
            color: 'bg-purple-500',
            sub: 'Earned',
          },
          {
            label: 'Degree Class',
            value: degreeClass.split(' ')[0],
            icon: GraduationCap,
            color: 'bg-esut-gold',
            sub: degreeClass,
          },
        ].map(({ label, value, icon: Icon, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className='card card-hover p-5'
          >
            <div
              className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}
            >
              <Icon size={18} className='text-white' />
            </div>
            <p className='text-2xl font-bold text-slate-800 font-display'>
              {isLoading ? '—' : value}
            </p>
            <p className='text-xs text-slate-500 mt-0.5 truncate' title={sub}>
              {sub}
            </p>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* CGPA Gauge */}
        <div className='card p-5 flex flex-col items-center justify-center gap-3'>
          <h3 className='font-semibold text-slate-700 text-sm self-start'>
            CGPA Overview
          </h3>
          {isLoading ? (
            <div className='skeleton w-36 h-36 rounded-full' />
          ) : (
            <GPAGauge cgpa={cgpa} />
          )}
          <div className='text-center'>
            <p className='font-semibold text-slate-700 text-sm'>
              {degreeClass}
            </p>
            <p className='text-xs text-slate-400'>Current classification</p>
          </div>
          <button
            onClick={handleDownload}
            className='btn-primary w-full flex items-center justify-center gap-2'
          >
            <Download size={14} /> Download Transcript
          </button>
        </div>

        {/* Recent semester results */}
        <div className='card p-5 lg:col-span-2'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-semibold text-slate-700 text-sm'>
              {lastSemester
                ? `${lastSemester.session} — ${lastSemester.semester.charAt(0).toUpperCase() + lastSemester.semester.slice(1)} Semester`
                : 'Recent Results'}
            </h3>
            {lastSemester && (
              <span className='badge badge-green'>
                GPA: {lastSemester.gpa.toFixed(2)}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className='space-y-3'>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className='flex gap-3 items-center'>
                    <div className='skeleton w-8 h-8 rounded-lg' />
                    <div className='flex-1 space-y-1'>
                      <div className='skeleton h-3 w-40 rounded' />
                      <div className='skeleton h-3 w-24 rounded' />
                    </div>
                    <div className='skeleton h-5 w-10 rounded-full' />
                  </div>
                ))}
            </div>
          ) : lastSemester?.results?.length > 0 ? (
            <div className='space-y-2'>
              {lastSemester.results.map((r: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className='flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors'
                >
                  <div className='w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0'>
                    {r.course_units}u
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-slate-700 truncate'>
                      {r.course_code}
                    </p>
                    <p className='text-xs text-slate-400 truncate'>
                      {r.course_title}
                    </p>
                  </div>
                  <div className='text-right flex-shrink-0'>
                    <p className='text-sm font-semibold text-slate-700'>
                      {r.score}
                    </p>
                    <GradePill grade={r.grade} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-slate-400'>
              <BookOpen size={32} className='mx-auto mb-2 opacity-30' />
              <p className='text-sm'>No approved results yet</p>
            </div>
          )}

          <Link
            href='/dashboard/student/results'
            className='flex items-center justify-center gap-1 mt-4 text-sm text-esut-green font-medium hover:underline'
          >
            View all semesters <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
