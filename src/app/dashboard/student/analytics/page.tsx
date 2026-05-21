/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { resultsApi, studentsApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function GPAAnalyticsPage() {
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

  const semesters = summary?.semesters || [];

  // Build chart data
  const gpaOverTime = semesters.map((s: any, i: number) => ({
    name: `${s.session.split('/')[0]} ${s.semester === 'first' ? '1st' : '2nd'}`,
    GPA: s.gpa,
    CGPA: (() => {
      // cumulative up to this point
      const slice = semesters.slice(0, i + 1);
      const allR: any[] = [];
      slice.forEach((sem: any) => allR.push(...sem.results));
      const best: Record<string, any> = {};
      allR.forEach((r) => {
        if (
          !best[r.course_code] ||
          r.grade_point > best[r.course_code].grade_point
        )
          best[r.course_code] = r;
      });
      const vals = Object.values(best);
      const tu = vals.reduce(
        (a: number, r: any) => a + (r.course_units || 0),
        0,
      );
      const tp = vals.reduce(
        (a: number, r: any) => a + (r.course_units || 0) * (r.grade_point || 0),
        0,
      );
      return tu > 0 ? parseFloat((tp / tu).toFixed(2)) : 0;
    })(),
  }));

  // Grade distribution for radar
  const gradeCount: Record<string, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  };
  semesters.forEach((s: any) => {
    s.results?.forEach((r: any) => {
      if (r.grade in gradeCount) gradeCount[r.grade]++;
    });
  });
  const radarData = Object.entries(gradeCount).map(([grade, count]) => ({
    grade,
    count,
  }));

  // Trend
  const trend =
    gpaOverTime.length >= 2
      ? gpaOverTime[gpaOverTime.length - 1].GPA -
        gpaOverTime[gpaOverTime.length - 2].GPA
      : 0;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend > 0
      ? 'text-green-600'
      : trend < 0
        ? 'text-red-500'
        : 'text-slate-400';

  return (
    <div className='space-y-6 max-w-4xl'>
      <div>
        <h1 className='section-title'>GPA Analytics</h1>
        <p className='text-sm text-slate-500 mt-0.5'>
          Track your academic performance over time
        </p>
      </div>

      {/* Summary metrics */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        {[
          {
            label: 'Current CGPA',
            value: summary?.cgpa?.toFixed(2) ?? '—',
            sub: 'out of 5.00',
          },
          {
            label: 'Last GPA',
            value: semesters.at(-1)?.gpa?.toFixed(2) ?? '—',
            sub: 'most recent semester',
          },
          {
            label: 'Best GPA',
            value: semesters.length
              ? Math.max(...semesters.map((s: any) => s.gpa)).toFixed(2)
              : '—',
            sub: 'all time high',
          },
          {
            label: 'Total Courses',
            value: semesters.reduce(
              (a: number, s: any) => a + (s.results?.length || 0),
              0,
            ),
            sub: 'attempted',
          },
        ].map(({ label, value, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className='card p-4'
          >
            <p className='text-xs text-slate-400 uppercase tracking-wide font-medium'>
              {label}
            </p>
            <p className='text-3xl font-bold text-slate-800 font-display mt-1'>
              {isLoading ? '—' : value}
            </p>
            <p className='text-xs text-slate-400 mt-0.5'>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* GPA trend chart */}
      <div className='card p-5'>
        <div className='flex items-center justify-between mb-5'>
          <h3 className='font-semibold text-slate-700'>GPA / CGPA Trend</h3>
          {trend !== 0 && (
            <div
              className={`flex items-center gap-1.5 text-sm font-medium ${trendColor}`}
            >
              <TrendIcon size={16} />
              {Math.abs(trend).toFixed(2)}{' '}
              {trend > 0 ? 'improvement' : 'decline'}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className='skeleton h-52 rounded-xl' />
        ) : gpaOverTime.length > 0 ? (
          <ResponsiveContainer width='100%' height={220}>
            <AreaChart data={gpaOverTime}>
              <defs>
                <linearGradient id='gpaGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#1a5c38' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#1a5c38' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='cgpaGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#c9a84c' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#c9a84c' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
              <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area
                type='monotone'
                dataKey='GPA'
                stroke='#1a5c38'
                strokeWidth={2.5}
                fill='url(#gpaGrad)'
                dot={{ fill: '#1a5c38', r: 4 }}
              />
              <Area
                type='monotone'
                dataKey='CGPA'
                stroke='#c9a84c'
                strokeWidth={2}
                fill='url(#cgpaGrad)'
                strokeDasharray='5 5'
                dot={{ fill: '#c9a84c', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className='h-52 flex items-center justify-center text-slate-400 text-sm'>
            No data available yet
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {/* Grade breakdown radar */}
        <div className='card p-5'>
          <h3 className='font-semibold text-slate-700 mb-4 text-sm'>
            Grade Distribution
          </h3>
          {isLoading ? (
            <div className='skeleton h-44 rounded-xl' />
          ) : radarData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width='100%' height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke='#f1f5f9' />
                <PolarAngleAxis
                  dataKey='grade'
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Radar
                  name='Courses'
                  dataKey='count'
                  stroke='#1a5c38'
                  fill='#1a5c38'
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className='h-44 flex items-center justify-center text-slate-400 text-sm'>
              No data yet
            </div>
          )}
        </div>

        {/* Semester GPA bar breakdown */}
        <div className='card p-5'>
          <h3 className='font-semibold text-slate-700 mb-4 text-sm'>
            Semester-by-Semester
          </h3>
          {isLoading ? (
            <div className='space-y-3'>
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className='skeleton h-6 rounded' />
                ))}
            </div>
          ) : semesters.length > 0 ? (
            <div className='space-y-3'>
              {semesters.map((s: any, i: number) => {
                const pct = (s.gpa / 5) * 100;
                const barColor =
                  s.gpa >= 4.5
                    ? 'bg-green-500'
                    : s.gpa >= 3.5
                      ? 'bg-blue-500'
                      : s.gpa >= 2.4
                        ? 'bg-yellow-500'
                        : 'bg-red-500';
                return (
                  <div key={i}>
                    <div className='flex justify-between text-xs mb-1'>
                      <span className='text-slate-600'>
                        {s.session} —{' '}
                        <span className='capitalize'>{s.semester}</span>
                      </span>
                      <span className='font-bold text-slate-700'>
                        {s.gpa.toFixed(2)}
                      </span>
                    </div>
                    <div className='h-2.5 bg-slate-100 rounded-full overflow-hidden'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.7,
                          delay: i * 0.1,
                          ease: 'easeOut',
                        }}
                        className={`h-full ${barColor} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='h-44 flex items-center justify-center text-slate-400 text-sm'>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Classification scale */}
      <div className='card p-5'>
        <h3 className='font-semibold text-slate-700 mb-4 text-sm'>
          Degree Classification Scale
        </h3>
        <div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
          {[
            {
              range: '4.50 – 5.00',
              cls: 'First Class',
              color: 'bg-green-100 border-green-300 text-green-800',
            },
            {
              range: '3.50 – 4.49',
              cls: '2nd Class Upper',
              color: 'bg-blue-100 border-blue-300 text-blue-800',
            },
            {
              range: '2.40 – 3.49',
              cls: '2nd Class Lower',
              color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
            },
            {
              range: '1.50 – 2.39',
              cls: 'Third Class',
              color: 'bg-orange-100 border-orange-300 text-orange-800',
            },
            {
              range: '1.00 – 1.49',
              cls: 'Pass',
              color: 'bg-slate-100 border-slate-300 text-slate-700',
            },
          ].map(({ range, cls, color }) => {
            const isActive =
              summary?.degree_class?.includes(cls.split(' ')[0]) &&
              summary?.degree_class?.includes(
                cls.split(' ').slice(1).join(' ').split(' ')[0],
              );
            return (
              <div
                key={cls}
                className={`rounded-xl border p-3 text-center ${color} ${isActive ? 'ring-2 ring-offset-1 ring-esut-green shadow-md' : ''}`}
              >
                <p className='font-bold text-xs'>{cls}</p>
                <p className='text-xs opacity-70 mt-0.5'>{range}</p>
                {isActive && <p className='text-xs font-bold mt-1'>← You</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
