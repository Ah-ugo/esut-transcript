/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { resultsApi, studentsApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';

function GradeBadge({ grade }: { grade: string }) {
  const styles: Record<string, string> = {
    A: 'bg-green-100 text-green-800 border-green-200',
    B: 'bg-blue-100 text-blue-800 border-blue-200',
    C: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    D: 'bg-orange-100 text-orange-800 border-orange-200',
    E: 'bg-red-100 text-red-700 border-red-200',
    F: 'bg-red-200 text-red-900 border-red-300',
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-bold ${styles[grade] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
    >
      {grade}
    </span>
  );
}

function SemesterCard({ semester, index }: { semester: any; index: number }) {
  const [open, setOpen] = useState(index === 0);

  const gpaColor =
    semester.gpa >= 4.5
      ? 'text-green-700 bg-green-50'
      : semester.gpa >= 3.5
        ? 'text-blue-700 bg-blue-50'
        : semester.gpa >= 2.4
          ? 'text-yellow-700 bg-yellow-50'
          : 'text-red-700 bg-red-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className='card overflow-hidden'
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between p-5 hover:bg-slate-50/60 transition-colors'
      >
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 rounded-xl bg-esut-green flex items-center justify-center text-white text-xs font-bold'>
            {semester.semester === 'first' ? '1ST' : '2ND'}
          </div>
          <div className='text-left'>
            <p className='font-semibold text-slate-800 text-sm'>
              {semester.session} Academic Session
            </p>
            <p className='text-xs text-slate-500 capitalize'>
              {semester.semester} Semester · {semester.results?.length || 0}{' '}
              courses · {semester.total_units} units
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div
            className={`px-3 py-1.5 rounded-xl font-bold text-sm ${gpaColor}`}
          >
            GPA: {semester.gpa?.toFixed(2)}
          </div>
          {open ? (
            <ChevronUp size={16} className='text-slate-400' />
          ) : (
            <ChevronDown size={16} className='text-slate-400' />
          )}
        </div>
      </button>

      {/* Results table */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='overflow-hidden'
          >
            <div className='border-t border-slate-100'>
              {/* Table header */}
              <div className='grid grid-cols-[auto_1fr_80px_70px_70px_80px] gap-4 px-5 py-2.5 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                <span>#</span>
                <span>Course</span>
                <span className='text-center'>Units</span>
                <span className='text-center'>Score</span>
                <span className='text-center'>Grade</span>
                <span className='text-center'>Points</span>
              </div>

              {semester.results?.map((r: any, i: number) => (
                <div
                  key={i}
                  className='grid grid-cols-[auto_1fr_80px_70px_70px_80px] gap-4 px-5 py-3 items-center border-b border-slate-50 hover:bg-slate-50/60 transition-colors'
                >
                  <span className='text-xs text-slate-400 w-5 text-center'>
                    {i + 1}
                  </span>
                  <div>
                    <p className='text-sm font-semibold text-slate-700'>
                      {r.course_code}
                    </p>
                    <p className='text-xs text-slate-400 truncate max-w-xs'>
                      {r.course_title}
                    </p>
                  </div>
                  <p className='text-sm text-slate-600 text-center font-medium'>
                    {r.course_units}
                  </p>
                  <p className='text-sm text-slate-700 text-center font-bold'>
                    {r.score?.toFixed(1)}
                  </p>
                  <div className='flex justify-center'>
                    <GradeBadge grade={r.grade} />
                  </div>
                  <p className='text-sm text-esut-green text-center font-semibold'>
                    {(r.course_units * r.grade_point).toFixed(1)}
                  </p>
                </div>
              ))}

              {/* Total row */}
              <div className='grid grid-cols-[auto_1fr_80px_70px_70px_80px] gap-4 px-5 py-3 bg-esut-green/5 items-center'>
                <span />
                <p className='text-sm font-bold text-slate-700'>
                  SEMESTER TOTAL
                </p>
                <p className='text-sm font-bold text-slate-700 text-center'>
                  {semester.total_units}
                </p>
                <span />
                <span />
                <p className='text-sm font-bold text-esut-green text-center'>
                  GPA {semester.gpa?.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function StudentResultsPage() {
  const { user } = useAuthStore();

  const { data: student } = useQuery({
    queryKey: ['student-profile', user?.matric_number],
    queryFn: () =>
      studentsApi.getByMatric(user!.matric_number!).then((r) => r.data),
    enabled: !!user?.matric_number,
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['student-summary', student?.id],
    queryFn: () =>
      resultsApi.getStudentSummary(student!.id).then((r) => r.data),
    enabled: !!student?.id,
  });

  const cgpa = summary?.cgpa ?? 0;
  const degreeClass = summary?.degree_class ?? '—';

  return (
    <div className='space-y-6 max-w-4xl'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>My Academic Results</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            All semesters · {summary?.semesters?.length || 0} completed
          </p>
        </div>
        {!isLoading && summary && (
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <p className='text-xs text-slate-500'>CGPA</p>
              <p className='text-2xl font-bold text-esut-green font-display'>
                {cgpa.toFixed(2)}
              </p>
            </div>
            <div className='h-10 w-px bg-slate-200' />
            <div className='text-right max-w-[160px]'>
              <p className='text-xs text-slate-500'>Classification</p>
              <p className='text-sm font-semibold text-slate-700 leading-tight'>
                {degreeClass}
              </p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className='card p-5'>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-4 items-center'>
                    <div className='skeleton w-10 h-10 rounded-xl' />
                    <div className='space-y-1.5'>
                      <div className='skeleton h-3 w-48 rounded' />
                      <div className='skeleton h-3 w-32 rounded' />
                    </div>
                  </div>
                  <div className='skeleton h-8 w-24 rounded-xl' />
                </div>
              </div>
            ))}
        </div>
      ) : summary?.semesters?.length > 0 ? (
        <div className='space-y-4'>
          {summary.semesters.map((sem: any, i: number) => (
            <SemesterCard
              key={`${sem.session}-${sem.semester}`}
              semester={sem}
              index={i}
            />
          ))}

          {/* CGPA Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: summary.semesters.length * 0.08 }}
            className='card p-5 bg-gradient-to-r from-esut-green to-esut-green-light text-white'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-white/70 text-sm'>Cumulative GPA (CGPA)</p>
                <p className='text-4xl font-bold font-display mt-1'>
                  {cgpa.toFixed(2)}{' '}
                  <span className='text-xl text-white/60'>/ 5.00</span>
                </p>
                <p className='text-white/80 font-semibold mt-1'>
                  {degreeClass}
                </p>
              </div>
              <div className='text-right text-sm text-white/70 space-y-1'>
                <p>
                  Total Units:{' '}
                  <span className='text-white font-bold'>
                    {summary.total_units}
                  </span>
                </p>
                <p>
                  Semesters:{' '}
                  <span className='text-white font-bold'>
                    {summary.semesters.length}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className='card p-16 text-center'>
          <BookOpen size={48} className='mx-auto text-slate-200 mb-4' />
          <p className='text-slate-600 font-medium'>No approved results yet</p>
          <p className='text-slate-400 text-sm mt-1'>
            Results will appear here once approved by the admin
          </p>
        </div>
      )}
    </div>
  );
}
