/** @format */

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { coursesApi, programmesApi, usersApi } from '../../../../lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const courseSchema = z.object({
  code: z.string().min(3, 'Course code required'),
  title: z.string().min(5, 'Title required'),
  units: z.coerce.number().min(1).max(6),
  semester: z.enum(['first', 'second']),
  level: z.coerce.number().min(100).max(500),
  programme_code: z.string().min(1, 'Programme required'),
  is_elective: z.boolean().default(false),
  description: z.string().optional(),
});

type CourseForm = z.infer<typeof courseSchema>;

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [assignModal, setAssignModal] = useState<{
    show: boolean;
    courseId: string;
    courseCode: string;
  }>({ show: false, courseId: '', courseCode: '' });
  const [assignmentSession, setAssignmentSession] = useState('2023/2024');

  // Helper to extract string messages from complex error objects (like FastAPI 422s)
  const getErrorMessage = (error: any) => {
    const detail = error.response?.data?.detail || error.message;
    if (Array.isArray(detail)) {
      // Join multiple validation errors into one string
      return detail
        .map((d: any) => {
          const path = d.loc ? d.loc[d.loc.length - 1] : 'field';
          return `${path}: ${d.msg}`;
        })
        .join(', ');
    }
    return typeof detail === 'string'
      ? detail
      : JSON.stringify(detail) || 'An unexpected error occurred';
  };

  const { data, isLoading } = useQuery({
    queryKey: ['courses', page, semesterFilter, levelFilter, search],
    queryFn: () =>
      coursesApi
        .list({
          page,
          per_page: 15,
          search: search || undefined,
          semester: semesterFilter || undefined,
          level: levelFilter ? parseInt(levelFilter) : undefined,
        })
        .then((r) => r.data),
  });

  const { data: progData } = useQuery({
    queryKey: ['programmes-list'],
    queryFn: () => programmesApi.list(1, 100).then((r) => r.data),
  });

  const { data: lecturersData } = useQuery({
    queryKey: ['lecturers-list'],
    queryFn: () => usersApi.list({ role: 'lecturer' }).then((r) => r.data),
  });

  const assignMut = useMutation({
    mutationFn: (data: {
      courseId: string;
      lecturer_id: string;
      session: string;
    }) =>
      coursesApi.assignLecturer(data.courseId, {
        lecturer_id: data.lecturer_id,
        session: data.session,
      }),
    onSuccess: () => {
      toast.success('Lecturer assigned successfully');
      setAssignModal({ show: false, courseId: '', courseCode: '' });
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const programmes = progData?.data || [];
  const lecturers = lecturersData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
  });

  const createMut = useMutation({
    mutationFn: (d: CourseForm) =>
      coursesApi.create({
        code: d.code!,
        title: d.title!,
        units: d.units!,
        semester: d.semester!,
        level: d.level!,
        programme_code: d.programme_code!,
      }),
    onSuccess: () => {
      toast.success('Course created successfully');
      qc.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
      reset();
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      toast.success('Course deleted');
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => toast.error('Failed to delete course'),
  });

  const courses = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  const semesterColors: Record<string, string> = {
    first: 'bg-blue-100 text-blue-700',
    second: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>Courses</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            {data?.total || 0} courses across all programmes
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            reset();
          }}
          className='btn-primary flex items-center gap-2'
        >
          <Plus size={15} /> Add Course
        </button>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search
            size={15}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search courses...'
            className='input pl-9'
          />
        </div>
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className='input w-auto'
        >
          <option value=''>All Semesters</option>
          <option value='first'>First Semester</option>
          <option value='second'>Second Semester</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className='input w-auto'
        >
          <option value=''>All Levels</option>
          {[100, 200, 300, 400, 500].map((l) => (
            <option key={l} value={l}>
              {l}L
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='table-header border-b border-slate-100'>
                <th className='px-5 py-3 text-left'>Course</th>
                <th className='px-4 py-3 text-center'>Units</th>
                <th className='px-4 py-3 text-center'>Level</th>
                <th className='px-4 py-3 text-left hidden md:table-cell'>
                  Semester
                </th>
                <th className='px-4 py-3 text-left hidden lg:table-cell'>
                  Programme
                </th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className='border-b border-slate-50'>
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <div className='skeleton w-9 h-9 rounded-xl' />
                          <div className='space-y-1.5'>
                            <div className='skeleton h-3 w-24 rounded' />
                            <div className='skeleton h-3 w-40 rounded' />
                          </div>
                        </div>
                      </td>
                      {Array(4)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className='px-4 py-3.5'>
                            <div className='skeleton h-3 w-16 rounded mx-auto' />
                          </td>
                        ))}
                      <td className='px-4 py-3.5'>
                        <div className='skeleton h-7 w-16 rounded-lg ml-auto' />
                      </td>
                    </tr>
                  ))
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-5 py-16 text-center'>
                    <BookOpen
                      size={40}
                      className='mx-auto text-slate-200 mb-3'
                    />
                    <p className='text-slate-500 font-medium'>
                      No courses found
                    </p>
                  </td>
                </tr>
              ) : (
                courses.map((c: any, i: number) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className='table-row'
                  >
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-xl bg-esut-green/10 flex items-center justify-center flex-shrink-0'>
                          <BookOpen size={14} className='text-esut-green' />
                        </div>
                        <div>
                          <p className='font-bold text-sm text-slate-800 font-mono'>
                            {c.code}
                          </p>
                          <p className='text-xs text-slate-500 max-w-[240px] truncate'>
                            {c.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <span className='badge badge-gray'>{c.units}u</span>
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <span className='badge badge-green'>{c.level}L</span>
                    </td>
                    <td className='px-4 py-3.5 hidden md:table-cell'>
                      <span
                        className={`badge capitalize ${semesterColors[c.semester] || 'badge-gray'}`}
                      >
                        {c.semester}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 hidden lg:table-cell'>
                      <p className='text-xs text-slate-500 max-w-[160px] truncate'>
                        {c.programme_name || '—'}
                      </p>
                    </td>
                    <td className='px-4 py-3.5'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() =>
                            setAssignModal({
                              show: true,
                              courseId: c.id,
                              courseCode: c.code,
                            })
                          }
                          className='p-1.5 rounded-lg hover:bg-esut-green/10 text-slate-400 hover:text-esut-green'
                          title='Assign Lecturer'
                        >
                          <UserPlus size={14} />
                        </button>
                        <button className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600'>
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${c.code}?`))
                              deleteMut.mutate(c.id);
                          }}
                          className='p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.total > 15 && (
          <div className='flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50'>
            <p className='text-xs text-slate-500'>
              Page {page} of {totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='p-1.5 rounded-lg hover:bg-white border border-slate-200 text-slate-500 disabled:opacity-40'
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className='p-1.5 rounded-lg hover:bg-white border border-slate-200 text-slate-500 disabled:opacity-40'
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <AnimatePresence>
        {showModal && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='card w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto'
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='font-semibold text-slate-800 text-lg'>
                  Add New Course
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className='text-slate-400 hover:text-slate-600'
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit((d) => createMut.mutate(d))}
                className='space-y-4'
              >
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='label'>Course Code *</label>
                    <input
                      {...register('code')}
                      className='input uppercase'
                      placeholder='CSC201'
                    />
                    {errors.code && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.code.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='label'>Credit Units *</label>
                    <input
                      {...register('units')}
                      type='number'
                      min='1'
                      max='6'
                      className='input'
                      placeholder='3'
                    />
                  </div>
                  <div className='col-span-2'>
                    <label className='label'>Course Title *</label>
                    <input
                      {...register('title')}
                      className='input'
                      placeholder='Data Structures and Algorithms'
                    />
                    {errors.title && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className='col-span-2'>
                    <label className='label'>Programme *</label>
                    <select {...register('programme_code')} className='input'>
                      <option value=''>Select programme</option>
                      {programmes.map((p: any) => (
                        <option key={p.id} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.programme_code && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.programme_code.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='label'>Level *</label>
                    <select {...register('level')} className='input'>
                      {[100, 200, 300, 400, 500].map((l) => (
                        <option key={l} value={l}>
                          {l} Level
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='label'>Semester *</label>
                    <select {...register('semester')} className='input'>
                      <option value='first'>First Semester</option>
                      <option value='second'>Second Semester</option>
                    </select>
                  </div>
                  <div className='col-span-2'>
                    <label className='label'>Description (optional)</label>
                    <textarea
                      {...register('description')}
                      className='input h-20 resize-none'
                      placeholder='Brief course description...'
                    />
                  </div>
                  <div className='col-span-2'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        {...register('is_elective')}
                        className='rounded'
                      />
                      <span className='text-sm text-slate-700'>
                        This is an elective course
                      </span>
                    </label>
                  </div>
                </div>

                <div className='flex gap-3 justify-end pt-2'>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='btn-secondary'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={createMut.isPending}
                    className='btn-primary'
                  >
                    {createMut.isPending ? 'Creating...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Lecturer Modal */}
      <AnimatePresence>
        {assignModal.show && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='card w-full max-w-md p-6'
            >
              <h3 className='font-semibold text-slate-800 text-lg mb-4'>
                Assign Lecturer to {assignModal.courseCode}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  assignMut.mutate({
                    courseId: assignModal.courseId,
                    lecturer_id: formData.get('lecturer_id') as string,
                    session: assignmentSession,
                  });
                }}
                className='space-y-4'
              >
                <div>
                  <label className='label'>Select Lecturer</label>
                  <select name='lecturer_id' required className='input'>
                    <option value=''>Choose a staff member...</option>
                    {lecturers.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.full_name} ({l.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='label'>Academic Session</label>
                  <select
                    value={assignmentSession}
                    onChange={(e) => setAssignmentSession(e.target.value)}
                    className='input'
                  >
                    <option value='2023/2024'>2023/2024</option>
                    <option value='2022/2023'>2022/2023</option>
                  </select>
                </div>
                <div className='flex gap-3 justify-end pt-2'>
                  <button
                    type='button'
                    onClick={() =>
                      setAssignModal({
                        show: false,
                        courseId: '',
                        courseCode: '',
                      })
                    }
                    className='btn-secondary'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={assignMut.isPending}
                    className='btn-primary'
                  >
                    {assignMut.isPending
                      ? 'Assigning...'
                      : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
