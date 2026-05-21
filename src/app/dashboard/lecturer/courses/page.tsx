/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, Layers, Search } from 'lucide-react';
import { coursesApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import { useState } from 'react';

const SESSIONS = ['2023/2024', '2022/2023', '2021/2022', '2020/2021'];

export default function LecturerCoursesPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [session, setSession] = useState(SESSIONS[0]);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['lecturer-courses', user?.id, session],
    queryFn: () =>
      coursesApi.getLecturerCourses(user!.id, session).then((r) => r.data),
    enabled: !!user?.id,
  });

  const courses = coursesData?.courses || [];
  const filteredCourses = courses.filter(
    (c: any) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='section-title'>My Courses</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            Manage and view your assigned courses
          </p>
        </div>
        <select
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className='input max-w-[200px]'
        >
          {SESSIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className='card p-4 flex items-center gap-3'>
        <Search size={18} className='text-slate-400' />
        <input
          type='text'
          placeholder='Search by course code or title...'
          className='bg-transparent border-none focus:ring-0 w-full text-sm outline-none'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='card p-6 h-40 animate-pulse bg-slate-50' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => (
              <div
                key={course.id}
                className='card p-6 hover:border-esut-green/30 transition-colors group'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div className='p-2.5 bg-esut-green/10 rounded-xl text-esut-green'>
                    <BookOpen size={20} />
                  </div>
                  <span className='text-xs font-bold text-slate-400 uppercase'>
                    {course.level}L
                  </span>
                </div>
                <h3 className='font-bold text-slate-800 group-hover:text-esut-green transition-colors'>
                  {course.code}
                </h3>
                <p className='text-sm text-slate-500 mt-1 line-clamp-1'>
                  {course.title}
                </p>

                <div className='flex items-center gap-4 mt-6 pt-4 border-t border-slate-50 text-xs font-medium text-slate-400'>
                  <div className='flex items-center gap-1.5'>
                    <Users size={14} />
                    <span>{course.student_count || 0} Students</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Layers size={14} />
                    <span className='capitalize'>
                      {course.semester} Semester
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-full py-12 text-center card bg-slate-50 border-dashed'>
              <p className='text-slate-500 text-sm'>
                No courses found for the selected session.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
