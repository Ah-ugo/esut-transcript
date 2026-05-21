/** @format */

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { usersApi } from '../../../../lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () =>
      usersApi.list({ search, role: roleFilter }).then((r) => r.data),
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

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-blue-100 text-blue-700',
      lecturer: 'bg-esut-green/10 text-esut-green',
      student: 'bg-slate-100 text-slate-700',
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
            Manage system access for staff and students
          </p>
        </div>
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
                <th className='px-6 py-4 font-semibold'>Joined</th>
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
                users.map((u: any) => (
                  <tr
                    key={u.id}
                    className='hover:bg-slate-50/50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 uppercase font-bold'>
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className='font-medium text-slate-800'>
                            {u.full_name}
                          </div>
                          <div className='text-[11px] text-slate-400 flex items-center gap-1'>
                            <Mail size={10} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>{getRoleBadge(u.role)}</td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => toggleStatusMut.mutate(u.id)}
                        className={`flex items-center gap-1.5 transition-opacity ${u.is_active ? 'text-green-600' : 'text-slate-400'}`}
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
                    <td className='px-6 py-4 text-slate-500'>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <button
                        onClick={() => {
                          if (confirm('Delete user?')) deleteMut.mutate(u.id);
                        }}
                        className='text-slate-400 hover:text-red-500 p-1 transition-colors'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
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
    </div>
  );
}
