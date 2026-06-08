/** @format */

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Edit2,
  KeyRound,
  X,
  Plus,
} from 'lucide-react';
import { usersApi, authApi } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

const editSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  role: z.enum(['admin', 'lecturer', 'student']),
});

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
  role: z.enum(['admin', 'lecturer', 'student']),
  staff_id: z.string().optional(),
  matric_number: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [resetUser, setResetUser] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () =>
      usersApi
        .list({ search, role: roleFilter || undefined })
        .then((r) => r.data),
  });

  const users = usersData?.data || [];

  const toggleStatusMut = useMutation({
    mutationFn: (id: string) => usersApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('User status updated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const updateMut = useMutation({
    mutationFn: (d: EditForm) => usersApi.update(editUser!.id, d),
    onSuccess: () => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.detail || 'Update failed'),
  });

  const resetPasswordMut = useMutation({
    mutationFn: () => usersApi.resetPassword(resetUser!.id, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully');
      setResetUser(null);
      setNewPassword('');
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.detail || 'Password reset failed'),
  });

  const registerMut = useMutation({
    mutationFn: (d: RegisterForm) => authApi.register(d),
    onSuccess: () => {
      toast.success('User created successfully');
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowRegister(false);
      registerReset();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.detail || 'Failed to create user'),
  });

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: editReset,
    formState: { errors: editErrors },
  } = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    reset: registerReset,
    watch: watchRegister,
    formState: { errors: regErrors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const watchRole = watchRegister('role');

  const openEdit = (u: any) => {
    setEditUser(u);
    editReset({ full_name: u.full_name, email: u.email, role: u.role });
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      lecturer: 'bg-blue-100 text-blue-700',
      student: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`badge capitalize ${colors[role] || 'bg-gray-100'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>User Management</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            {users.length} system users
          </p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className='btn-primary flex items-center gap-2'
        >
          <Plus size={15} /> New User
        </button>
      </div>

      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search
            size={15}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by name or email...'
            className='input pl-9'
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className='input w-auto'
        >
          <option value=''>All Roles</option>
          <option value='admin'>Admin</option>
          <option value='lecturer'>Lecturer</option>
          <option value='student'>Student</option>
        </select>
      </div>

      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100'>
              <tr>
                <th className='px-6 py-4 font-semibold'>User</th>
                <th className='px-6 py-4 font-semibold'>Role</th>
                <th className='px-6 py-4 font-semibold'>Status</th>
                <th className='px-6 py-4 font-semibold hidden md:table-cell'>
                  Joined
                </th>
                <th className='px-6 py-4 font-semibold text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 text-sm'>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className='animate-pulse'>
                    <td colSpan={5} className='px-6 py-6'>
                      <div className='h-4 bg-slate-100 rounded w-full' />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u: any, i: number) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className='hover:bg-slate-50/50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 uppercase font-bold text-sm flex-shrink-0'>
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className='font-medium text-slate-800'>
                            {u.full_name}
                          </div>
                          <div className='text-[11px] text-slate-400 flex items-center gap-1'>
                            <Mail size={10} /> {u.email}
                          </div>
                          {u.matric_number && u.matric_number !== 'string' && (
                            <div className='text-[10px] font-mono text-slate-400'>
                              {u.matric_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>{getRoleBadge(u.role)}</td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => toggleStatusMut.mutate(u.id)}
                        disabled={toggleStatusMut.isPending}
                        className={`flex items-center gap-1.5 transition-opacity disabled:opacity-50 ${u.is_active ? 'text-green-600' : 'text-slate-400'}`}
                      >
                        {u.is_active ? (
                          <UserCheck size={16} />
                        ) : (
                          <UserX size={16} />
                        )}
                        <span className='text-xs'>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </button>
                    </td>
                    <td className='px-6 py-4 text-slate-500 hidden md:table-cell'>
                      {format(new Date(u.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => openEdit(u)}
                          className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors'
                          title='Edit user'
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setResetUser(u);
                            setNewPassword('');
                          }}
                          className='p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors'
                          title='Reset password'
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${u.full_name}?`))
                              deleteMut.mutate(u.id);
                          }}
                          className='p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors'
                          title='Delete user'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-12 text-center text-slate-400'
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUser && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='card w-full max-w-md p-6'
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='font-semibold text-slate-800 text-lg'>
                  Edit User
                </h3>
                <button
                  onClick={() => setEditUser(null)}
                  className='text-slate-400 hover:text-slate-600'
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={handleEditSubmit((d) => updateMut.mutate(d))}
                className='space-y-4'
              >
                <div>
                  <label className='label'>Full Name</label>
                  <input {...editRegister('full_name')} className='input' />
                  {editErrors.full_name && (
                    <p className='text-red-500 text-xs mt-1'>
                      {editErrors.full_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>Email</label>
                  <input
                    {...editRegister('email')}
                    type='email'
                    className='input'
                  />
                  {editErrors.email && (
                    <p className='text-red-500 text-xs mt-1'>
                      {editErrors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>Role</label>
                  <select {...editRegister('role')} className='input'>
                    <option value='admin'>Admin</option>
                    <option value='lecturer'>Lecturer</option>
                    <option value='student'>Student</option>
                  </select>
                </div>
                <div className='flex gap-3 justify-end pt-2'>
                  <button
                    type='button'
                    onClick={() => setEditUser(null)}
                    className='btn-secondary'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={updateMut.isPending}
                    className='btn-primary'
                  >
                    {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetUser && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='card w-full max-w-sm p-6'
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='font-semibold text-slate-800 text-lg'>
                  Reset Password
                </h3>
                <button
                  onClick={() => setResetUser(null)}
                  className='text-slate-400 hover:text-slate-600'
                >
                  <X size={18} />
                </button>
              </div>
              <p className='text-sm text-slate-500 mb-4'>
                Set a new password for <strong>{resetUser.full_name}</strong>.
              </p>
              <div className='space-y-4'>
                <div>
                  <label className='label'>New Password</label>
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='input'
                    placeholder='At least 6 characters'
                    minLength={6}
                  />
                </div>
                <div className='flex gap-3 justify-end'>
                  <button
                    onClick={() => setResetUser(null)}
                    className='btn-secondary'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => resetPasswordMut.mutate()}
                    disabled={
                      newPassword.length < 6 || resetPasswordMut.isPending
                    }
                    className='btn-primary'
                  >
                    {resetPasswordMut.isPending
                      ? 'Resetting...'
                      : 'Reset Password'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register New User Modal */}
      <AnimatePresence>
        {showRegister && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='card w-full max-w-md p-6'
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='font-semibold text-slate-800 text-lg'>
                  Create New User
                </h3>
                <button
                  onClick={() => setShowRegister(false)}
                  className='text-slate-400 hover:text-slate-600'
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={handleRegisterSubmit((d) => registerMut.mutate(d))}
                className='space-y-4'
              >
                <div>
                  <label className='label'>Full Name *</label>
                  <input
                    {...regRegister('full_name')}
                    className='input'
                    placeholder='John Doe'
                  />
                  {regErrors.full_name && (
                    <p className='text-red-500 text-xs mt-1'>
                      {regErrors.full_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>Email *</label>
                  <input
                    {...regRegister('email')}
                    type='email'
                    className='input'
                    placeholder='user@esut.edu.ng'
                  />
                  {regErrors.email && (
                    <p className='text-red-500 text-xs mt-1'>
                      {regErrors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>Password *</label>
                  <input
                    {...regRegister('password')}
                    type='password'
                    className='input'
                    placeholder='Min. 6 characters'
                  />
                  {regErrors.password && (
                    <p className='text-red-500 text-xs mt-1'>
                      {regErrors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>Role *</label>
                  <select {...regRegister('role')} className='input'>
                    <option value='admin'>Admin</option>
                    <option value='lecturer'>Lecturer</option>
                    <option value='student'>Student</option>
                  </select>
                </div>
                {watchRole === 'lecturer' && (
                  <div>
                    <label className='label'>Staff ID</label>
                    <input
                      {...regRegister('staff_id')}
                      className='input'
                      placeholder='STAFF/001'
                    />
                  </div>
                )}
                {watchRole === 'student' && (
                  <div>
                    <label className='label'>Matric Number</label>
                    <input
                      {...regRegister('matric_number')}
                      className='input'
                      placeholder='ESUT/2024/COE/001'
                    />
                  </div>
                )}
                <div className='flex gap-3 justify-end pt-2'>
                  <button
                    type='button'
                    onClick={() => setShowRegister(false)}
                    className='btn-secondary'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={registerMut.isPending}
                    className='btn-primary'
                  >
                    {registerMut.isPending ? 'Creating...' : 'Create User'}
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
