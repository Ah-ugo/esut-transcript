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
  Upload,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { studentsApi, programmesApi } from '../../../../lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const studentSchema = z.object({
  matric_number: z.string().min(5),
  full_name: z.string().min(2),
  email: z.string().email(),
  programme_id: z.string().min(1, 'Programme required'),
  level: z.coerce.number().min(100).max(500),
  entry_year: z.coerce.number().min(2000).max(2030),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

export default function AdminStudentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search, programmeFilter],
    queryFn: () =>
      studentsApi
        .list({
          page,
          per_page: 15,
          search: search || undefined,
          programme_id: programmeFilter || undefined,
        })
        .then((r) => r.data),
  });

  const { data: progData } = useQuery({
    queryKey: ['programmes-list'],
    queryFn: () => programmesApi.list(1, 100).then((r) => r.data),
  });

  const programmes = progData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });

  const createMut = useMutation({
    mutationFn: (d: StudentForm) => studentsApi.create(d),
    onSuccess: () => {
      toast.success('Student created. Login password = matric number.');
      qc.invalidateQueries({ queryKey: ['students'] });
      setShowModal(false);
      reset();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.detail || 'Failed to create student'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      toast.success('Student deleted');
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Failed to delete student'),
  });

  const onSubmit = (d: StudentForm) => createMut.mutate(d);

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>Students</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            {data?.total || 0} registered students
          </p>
        </div>
        <div className='flex gap-2'>
          <button className='btn-secondary flex items-center gap-2 text-sm'>
            <Upload size={14} /> Import CSV
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              reset();
            }}
            className='btn-primary flex items-center gap-2'
          >
            <Plus size={15} /> Add Student
          </button>
        </div>
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Search by name or matric number...'
            className='input pl-9'
          />
        </div>
        <select
          value={programmeFilter}
          onChange={(e) => {
            setProgrammeFilter(e.target.value);
            setPage(1);
          }}
          className='input w-auto min-w-[200px]'
        >
          <option value=''>All Programmes</option>
          {programmes.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
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
                <th className='px-5 py-3 text-left'>Student</th>
                <th className='px-4 py-3 text-left'>Matric No.</th>
                <th className='px-4 py-3 text-left hidden md:table-cell'>
                  Programme
                </th>
                <th className='px-4 py-3 text-center hidden sm:table-cell'>
                  Level
                </th>
                <th className='px-4 py-3 text-center hidden lg:table-cell'>
                  Entry Year
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
                            <div className='skeleton h-3 w-36 rounded' />
                            <div className='skeleton h-3 w-24 rounded' />
                          </div>
                        </div>
                      </td>
                      {Array(4)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className='px-4 py-3.5'>
                            <div className='skeleton h-3 w-20 rounded' />
                          </td>
                        ))}
                      <td className='px-4 py-3.5'>
                        <div className='skeleton h-7 w-16 rounded-lg ml-auto' />
                      </td>
                    </tr>
                  ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-5 py-16 text-center'>
                    <Users size={40} className='mx-auto text-slate-200 mb-3' />
                    <p className='text-slate-500 font-medium'>
                      No students found
                    </p>
                    <p className='text-slate-400 text-sm mt-1'>
                      Try adjusting your search filters
                    </p>
                  </td>
                </tr>
              ) : (
                data?.data?.map((s: any, i: number) => {
                  const initials = s.full_name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className='table-row'
                    >
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 rounded-xl bg-esut-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0'>
                            {initials}
                          </div>
                          <div>
                            <p className='font-semibold text-sm text-slate-800'>
                              {s.full_name}
                            </p>
                            <p className='text-xs text-slate-400'>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3.5'>
                        <span className='font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg'>
                          {s.matric_number}
                        </span>
                      </td>
                      <td className='px-4 py-3.5 hidden md:table-cell'>
                        <p className='text-sm text-slate-600 max-w-[180px] truncate'>
                          {s.programme_name || '—'}
                        </p>
                      </td>
                      <td className='px-4 py-3.5 text-center hidden sm:table-cell'>
                        <span className='badge badge-green'>{s.level}L</span>
                      </td>
                      <td className='px-4 py-3.5 text-center hidden lg:table-cell'>
                        <span className='text-sm text-slate-500'>
                          {s.entry_year}
                        </span>
                      </td>
                      <td className='px-4 py-3.5'>
                        <div className='flex items-center justify-end gap-1'>
                          <button
                            onClick={() =>
                              toast(
                                'Edit functionality — populate form with student data',
                              )
                            }
                            className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors'
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${s.full_name}?`))
                                deleteMut.mutate(s.id);
                            }}
                            className='p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors'
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.total > 15 && (
          <div className='flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50'>
            <p className='text-xs text-slate-500'>
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, data.total)} of{' '}
              {data.total} students
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='p-1.5 rounded-lg hover:bg-white border border-slate-200 text-slate-500 disabled:opacity-40 transition-colors'
              >
                <ChevronLeft size={15} />
              </button>
              <span className='text-xs text-slate-600 font-medium px-2'>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className='p-1.5 rounded-lg hover:bg-white border border-slate-200 text-slate-500 disabled:opacity-40 transition-colors'
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Student Modal */}
      <AnimatePresence>
        {showModal && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='card w-full max-w-xl p-6'
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='font-semibold text-slate-800 text-lg'>
                  Add New Student
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className='text-slate-400 hover:text-slate-600 p-1'
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <label className='label'>Full Name *</label>
                    <input
                      {...register('full_name')}
                      className='input'
                      placeholder='Chukwuemeka Obiora'
                    />
                    {errors.full_name && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='label'>Matric Number *</label>
                    <input
                      {...register('matric_number')}
                      className='input uppercase'
                      placeholder='ESUT/2024/CS/001'
                    />
                    {errors.matric_number && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.matric_number.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='label'>Email *</label>
                    <input
                      {...register('email')}
                      type='email'
                      className='input'
                      placeholder='student@esut.edu.ng'
                    />
                    {errors.email && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className='col-span-2'>
                    <label className='label'>Programme *</label>
                    <select {...register('programme_id')} className='input'>
                      <option value=''>Select programme</option>
                      {programmes.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.programme_id && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.programme_id.message}
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
                    <label className='label'>Entry Year *</label>
                    <input
                      {...register('entry_year')}
                      type='number'
                      className='input'
                      placeholder='2024'
                    />
                  </div>
                  <div>
                    <label className='label'>Gender *</label>
                    <select {...register('gender')} className='input'>
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className='label'>Phone</label>
                    <input
                      {...register('phone')}
                      className='input'
                      placeholder='+234...'
                    />
                  </div>
                </div>

                <p className='text-xs text-slate-400 bg-slate-50 rounded-xl p-3'>
                  ℹ️ A student login account will be created automatically.
                  Default password is the matric number.
                </p>

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
                    {createMut.isPending ? 'Creating...' : 'Create Student'}
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
