/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Upload,
  FileText,
  Users,
  ArrowRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { coursesApi, resultsApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const currentSession = '2023/2024';

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['lecturer-courses', user?.id, currentSession],
    queryFn: () =>
      coursesApi
        .getLecturerCourses(user!.id, currentSession)
        .then((r) => r.data),
    enabled: !!user?.id,
  });

  const courses = courseData?.courses || [];

  return (
    <div className='space-y-6'>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-esut-green to-esut-green-light p-6 text-white'
      >
        <div className='absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full' />
        <div className='absolute bottom-0 right-8 w-20 h-20 bg-esut-gold/10 rounded-full' />
        <div className='relative z-10'>
          <p className='text-white/70 text-sm'>Good day,</p>
          <h1 className='text-2xl font-bold font-display mt-0.5'>
            {user?.full_name}
          </h1>
          <p className='text-white/60 text-sm mt-1'>
            {currentSession} Academic Session
          </p>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
        {[
          {
            label: 'Assigned Courses',
            value: courses.length,
            icon: BookOpen,
            color: 'bg-esut-green',
          },
          {
            label: 'Upload Results',
            value: 'Quick',
            icon: Upload,
            color: 'bg-blue-500',
            href: '/dashboard/lecturer/upload',
          },
          {
            label: 'Submissions',
            value: 'View',
            icon: FileText,
            color: 'bg-purple-500',
            href: '/dashboard/lecturer/submissions',
          },
        ].map(({ label, value, icon: Icon, color, href }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            {href ? (
              <Link
                href={href}
                className='card card-hover p-5 flex items-center gap-4 group block'
              >
                <div
                  className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}
                >
                  <Icon size={20} className='text-white' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-slate-500 text-xs'>{label}</p>
                  <p className='font-semibold text-slate-800'>{value}</p>
                </div>
                <ArrowRight
                  size={14}
                  className='text-slate-300 group-hover:text-esut-green group-hover:translate-x-0.5 transition-all'
                />
              </Link>
            ) : (
              <div className='card p-5 flex items-center gap-4'>
                <div
                  className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}
                >
                  <Icon size={20} className='text-white' />
                </div>
                <div>
                  <p className='text-slate-500 text-xs'>{label}</p>
                  <p className='text-2xl font-bold text-slate-800 font-display'>
                    {isLoading ? '—' : value}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Assigned courses */}
      <div className='card p-5'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold text-slate-700'>
            My Courses — {currentSession}
          </h3>
          <Link
            href='/dashboard/lecturer/courses'
            className='text-xs text-esut-green font-medium hover:underline'
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className='space-y-3'>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className='flex gap-3 items-center p-3'>
                  <div className='skeleton w-10 h-10 rounded-xl' />
                  <div className='flex-1 space-y-1.5'>
                    <div className='skeleton h-3 w-48 rounded' />
                    <div className='skeleton h-3 w-32 rounded' />
                  </div>
                  <div className='skeleton h-8 w-24 rounded-lg' />
                </div>
              ))}
          </div>
        ) : courses.length === 0 ? (
          <div className='text-center py-10 text-slate-400'>
            <BookOpen size={36} className='mx-auto mb-3 opacity-30' />
            <p className='text-sm'>No courses assigned for {currentSession}</p>
            <p className='text-xs mt-1'>
              Contact admin to get courses assigned
            </p>
          </div>
        ) : (
          <div className='divide-y divide-slate-50'>
            {courses.map((course: any, i: number) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className='flex items-center gap-4 py-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors'
              >
                <div className='w-10 h-10 rounded-xl bg-esut-green/10 flex items-center justify-center flex-shrink-0'>
                  <BookOpen size={16} className='text-esut-green' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-sm text-slate-700'>
                    <span className='font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2'>
                      {course.code}
                    </span>
                    {course.title}
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>
                    {course.units} units · {course.level}L · {course.semester}{' '}
                    semester · {course.programme_name}
                  </p>
                </div>
                <Link
                  href={`/dashboard/lecturer/upload?course=${course.id}`}
                  className='flex items-center gap-1.5 px-3 py-1.5 bg-esut-green/10 text-esut-green text-xs font-semibold rounded-lg hover:bg-esut-green hover:text-white transition-colors flex-shrink-0'
                >
                  <Upload size={12} /> Upload
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
