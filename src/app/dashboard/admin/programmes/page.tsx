/** @format */

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Trash2, Edit2, Users } from 'lucide-react';
import { programmesApi } from '../../../../lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminProgrammesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['programmes'],
    queryFn: () => programmesApi.list(1, 50).then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => programmesApi.create(d),
    onSuccess: () => {
      toast.success('Programme created');
      qc.invalidateQueries({ queryKey: ['programmes'] });
      setShowModal(false);
      reset();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.detail || 'Failed to create programme'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => programmesApi.delete(id),
    onSuccess: () => {
      toast.success('Programme deleted');
      qc.invalidateQueries({ queryKey: ['programmes'] });
    },
  });

  const programmes = data?.data || [];

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>Programmes</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            {programmes.length} academic programmes
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            reset();
          }}
          className='btn-primary flex items-center gap-2'
        >
          <Plus size={15} /> Add Programme
        </button>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className='card p-5 space-y-3'>
                <div className='skeleton h-10 w-10 rounded-xl' />
                <div className='skeleton h-4 w-3/4 rounded' />
                <div className='skeleton h-3 w-1/2 rounded' />
              </div>
            ))}
        </div>
      ) : programmes.length === 0 ? (
        <div className='card p-16 text-center'>
          <FolderOpen size={48} className='mx-auto text-slate-200 mb-4' />
          <p className='text-slate-500 font-medium'>No programmes yet</p>
          <p className='text-slate-400 text-sm mt-1'>
            Create your first academic programme
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {programmes.map((p: any, i: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className='card card-hover p-5'
            >
              <div className='flex items-start justify-between mb-3'>
                <div className='w-10 h-10 rounded-xl bg-esut-green/10 flex items-center justify-center'>
                  <FolderOpen size={18} className='text-esut-green' />
                </div>
                <div className='flex gap-1'>
                  <button className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400'>
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${p.name}?`)) deleteMut.mutate(p.id);
                    }}
                    className='p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500'
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className='font-bold text-sm text-slate-800 leading-tight mb-1'>
                {p.name}
              </p>
              <p className='text-xs text-slate-500 mb-3'>
                {p.department} · {p.faculty}
              </p>
              <div className='flex items-center justify-between border-t border-slate-100 pt-3'>
                <div className='flex items-center gap-1.5 text-xs text-slate-500'>
                  <Users size={12} /> {p.total_students} students
                </div>
                <div className='flex gap-2'>
                  <span className='badge badge-gray font-mono'>{p.code}</span>
                  <span className='badge badge-green'>
                    {p.duration_years}yr
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='card w-full max-w-lg p-6'
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='font-semibold text-slate-800 text-lg'>
                  Add Programme
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
                  <div className='col-span-2'>
                    <label className='label'>Programme Name *</label>
                    <input
                      {...register('name', { required: true })}
                      className='input'
                      placeholder='BSc Computer Science'
                    />
                  </div>
                  <div>
                    <label className='label'>Code *</label>
                    <input
                      {...register('code', { required: true })}
                      className='input uppercase'
                      placeholder='BSC-CS'
                    />
                  </div>
                  <div>
                    <label className='label'>Duration (years) *</label>
                    <select {...register('duration_years')} className='input'>
                      {[4, 5, 6].map((y) => (
                        <option key={y} value={y}>
                          {y} years
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='label'>Faculty *</label>
                    <input
                      {...register('faculty', { required: true })}
                      className='input'
                      placeholder='Faculty of Natural Sciences'
                    />
                  </div>
                  <div>
                    <label className='label'>Department *</label>
                    <input
                      {...register('department', { required: true })}
                      className='input'
                      placeholder='Computer Science'
                    />
                  </div>
                  <div className='col-span-2'>
                    <label className='label'>Description</label>
                    <textarea
                      {...register('description')}
                      className='input h-20 resize-none'
                    />
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
                    {createMut.isPending ? 'Creating...' : 'Create Programme'}
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
