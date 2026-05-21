/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  FolderOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../../../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

const GRADE_COLORS = {
  'A (5.0)': '#1a5c38',
  'B (4.0)': '#2d7a50',
  'C (3.0)': '#c9a84c',
  'D (2.0)': '#f59e0b',
  'E (1.0)': '#ef4444',
  'F (0.0)': '#dc2626',
};

function StatCard({ label, value, icon: Icon, color, subtitle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='stat-card'
    >
      <div className='flex items-center justify-between'>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={20} className='text-white' />
        </div>
        <TrendingUp size={14} className='text-green-500' />
      </div>
      <div>
        <p className='text-3xl font-bold text-slate-800 font-display'>
          {value?.toLocaleString() ?? '—'}
        </p>
        <p className='text-sm font-semibold text-slate-600'>{label}</p>
        {subtitle && (
          <p className='text-xs text-slate-400 mt-0.5'>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className='card p-5 space-y-3'>
      <div className='flex justify-between'>
        <div className='skeleton w-11 h-11 rounded-xl' />
        <div className='skeleton w-10 h-4 rounded' />
      </div>
      <div className='skeleton w-20 h-8 rounded' />
      <div className='skeleton w-32 h-4 rounded' />
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data),
    refetchInterval: 30000,
  });

  const gradeData = data?.gpa_distribution
    ? Object.entries(data.gpa_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const barData = gradeData.filter((d) => (d.value as number) > 0);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>Admin Overview</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            {format(new Date(), 'EEEE, d MMMM yyyy')} · Real-time data
          </p>
        </div>
        <div className='flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl'>
          <span className='status-dot online' />
          <span className='text-xs font-medium text-green-700'>
            System Online
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label='Total Students'
              value={data?.total_students}
              icon={Users}
              color='bg-esut-green'
              subtitle='Enrolled'
            />
            <StatCard
              label='Lecturers'
              value={data?.total_lecturers}
              icon={Users}
              color='bg-blue-500'
              subtitle='Active staff'
            />
            <StatCard
              label='Courses'
              value={data?.total_courses}
              icon={BookOpen}
              color='bg-purple-500'
              subtitle='All programmes'
            />
            <StatCard
              label='Programmes'
              value={data?.total_programmes}
              icon={FolderOpen}
              color='bg-esut-gold'
              subtitle='Academic programmes'
            />
          </>
        )}
      </div>

      {/* Result status + Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Pending / Approved */}
        <div className='card p-5 space-y-4'>
          <h3 className='font-semibold text-slate-700 text-sm'>
            Result Status
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center'>
                  <Clock size={16} className='text-yellow-600' />
                </div>
                <div>
                  <p className='text-xs text-slate-500'>Pending Approval</p>
                  <p className='font-bold text-slate-800 text-lg'>
                    {data?.pending_results ?? '—'}
                  </p>
                </div>
              </div>
              <span className='badge badge-yellow'>Needs Action</span>
            </div>
            <div className='h-px bg-slate-100' />
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
                  <CheckCircle size={16} className='text-green-600' />
                </div>
                <div>
                  <p className='text-xs text-slate-500'>Approved Results</p>
                  <p className='font-bold text-slate-800 text-lg'>
                    {data?.approved_results ?? '—'}
                  </p>
                </div>
              </div>
              <span className='badge badge-green'>Verified</span>
            </div>
          </div>

          {data && (
            <div className='mt-4'>
              <div className='flex justify-between text-xs text-slate-500 mb-1'>
                <span>Approval rate</span>
                <span className='font-medium text-esut-green'>
                  {Math.round(
                    (data.approved_results /
                      (data.approved_results + data.pending_results || 1)) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(data.approved_results / (data.approved_results + data.pending_results || 1)) * 100}%`,
                  }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className='h-full bg-esut-green rounded-full'
                />
              </div>
            </div>
          )}
        </div>

        {/* Grade distribution chart */}
        <div className='card p-5 lg:col-span-2'>
          <h3 className='font-semibold text-slate-700 text-sm mb-4'>
            Grade Distribution
          </h3>
          {isLoading ? (
            <div className='h-48 skeleton rounded-xl' />
          ) : barData.length > 0 ? (
            <ResponsiveContainer width='100%' height={180}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                <XAxis
                  dataKey='name'
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  cursor={{ fill: 'rgba(26,92,56,0.04)' }}
                />
                <Bar
                  dataKey='value'
                  radius={[6, 6, 0, 0]}
                  label={{ position: 'top', fontSize: 10 }}
                >
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        GRADE_COLORS[entry.name as keyof typeof GRADE_COLORS] ||
                        '#1a5c38'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className='h-48 flex items-center justify-center text-slate-400 text-sm'>
              No results data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className='card p-5'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold text-slate-700 text-sm'>
            Recent Result Uploads
          </h3>
          <a
            href='/dashboard/admin/approve-results'
            className='text-xs text-esut-green font-medium hover:underline'
          >
            View all pending →
          </a>
        </div>

        {isLoading ? (
          <div className='space-y-3'>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className='flex gap-3'>
                  <div className='skeleton w-9 h-9 rounded-xl' />
                  <div className='flex-1 space-y-1.5'>
                    <div className='skeleton h-3 w-48 rounded' />
                    <div className='skeleton h-3 w-32 rounded' />
                  </div>
                  <div className='skeleton h-5 w-16 rounded-full' />
                </div>
              ))}
          </div>
        ) : data?.recent_uploads?.length > 0 ? (
          <div className='divide-y divide-slate-50'>
            {data.recent_uploads.map((upload: any, i: number) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className='flex items-center gap-3 py-3'
              >
                <div className='w-9 h-9 rounded-xl bg-esut-green/10 flex items-center justify-center text-esut-green font-bold text-sm flex-shrink-0'>
                  {upload.grade || '?'}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-slate-700 truncate'>
                    {upload.student_name}
                  </p>
                  <p className='text-xs text-slate-400 truncate'>
                    {upload.matric_number} · {upload.course_code} · Score:{' '}
                    {upload.score}
                  </p>
                </div>
                <span
                  className={`badge ${upload.status === 'approved' ? 'badge-green' : upload.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}
                >
                  {upload.status}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-slate-400'>
            <AlertCircle size={32} className='mx-auto mb-2 opacity-40' />
            <p className='text-sm'>No recent uploads</p>
          </div>
        )}
      </div>
    </div>
  );
}
