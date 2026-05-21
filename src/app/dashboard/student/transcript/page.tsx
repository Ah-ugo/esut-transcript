/** @format */

'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Download,
  Eye,
  QrCode,
  Shield,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import { transcriptsApi, studentsApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

function ClassBadge({ cls }: { cls: string }) {
  const color = cls.includes('First')
    ? 'bg-green-100 text-green-800 border-green-300'
    : cls.includes('Upper')
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : cls.includes('Lower')
        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
        : cls.includes('Third')
          ? 'bg-orange-100 text-orange-800 border-orange-300'
          : 'bg-gray-100 text-gray-700 border-gray-300';
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}
    >
      {cls}
    </span>
  );
}

export default function TranscriptPage() {
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'summary' | 'full'>('summary');

  const { data: student } = useQuery({
    queryKey: ['student-profile', user?.matric_number],
    queryFn: () =>
      studentsApi.getByMatric(user!.matric_number!).then((r) => r.data),
    enabled: !!user?.matric_number,
  });

  const { data: transcript, isLoading } = useQuery({
    queryKey: ['transcript', student?.id],
    queryFn: () => transcriptsApi.getData(student!.id).then((r) => r.data),
    enabled: !!student?.id,
  });

  const handleDownload = async () => {
    if (!student?.id) return;
    setDownloading(true);
    try {
      const res = await transcriptsApi.downloadPdf(student.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ESUT_Transcript_${user?.matric_number?.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Transcript downloaded successfully!');
    } catch {
      toast.error('Failed to download transcript. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const verifyUrl = `${window.location.origin}/verify/${user?.matric_number}`;

  return (
    <div className='space-y-6 max-w-3xl'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>Academic Transcript</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            Official ESUT transcript with QR verification
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading || !transcript}
          className='btn-primary flex items-center gap-2'
        >
          {downloading ? (
            <>
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />{' '}
              Generating...
            </>
          ) : (
            <>
              <Download size={15} /> Download PDF
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          <div className='card p-6 space-y-4'>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className='skeleton h-4 rounded w-full' />
              ))}
          </div>
        </div>
      ) : transcript ? (
        <>
          {/* Transcript Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className='card overflow-hidden'
          >
            {/* Official header */}
            <div className='bg-esut-green px-6 py-5 text-white relative overflow-hidden'>
              <div className='absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full' />
              <div className='flex items-start justify-between relative z-10'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-esut-gold rounded-xl flex items-center justify-center'>
                    <GraduationCap size={22} className='text-white' />
                  </div>
                  <div>
                    <p className='font-bold text-lg leading-tight'>
                      ENUGU STATE UNIVERSITY
                    </p>
                    <p className='text-esut-gold text-sm font-semibold'>
                      OF SCIENCE AND TECHNOLOGY
                    </p>
                    <p className='text-white/60 text-xs mt-0.5'>
                      Official Academic Transcript
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <QRCodeSVG
                    value={verifyUrl}
                    size={72}
                    bgColor='transparent'
                    fgColor='white'
                    level='M'
                  />
                  <p className='text-white/50 text-xs mt-1'>Scan to verify</p>
                </div>
              </div>
            </div>

            {/* Student info */}
            <div className='p-6 border-b border-slate-100'>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm'>
                {[
                  { label: 'Full Name', value: transcript.student.full_name },
                  {
                    label: 'Matriculation No.',
                    value: transcript.student.matric_number,
                  },
                  { label: 'Programme', value: transcript.programme.name },
                  {
                    label: 'Department',
                    value: transcript.programme.department,
                  },
                  { label: 'Faculty', value: transcript.programme.faculty },
                  { label: 'Entry Year', value: transcript.student.entry_year },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className='text-xs text-slate-400 font-medium uppercase tracking-wide'>
                      {label}
                    </p>
                    <p className='font-semibold text-slate-700 mt-0.5 text-sm'>
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle full/summary */}
            <div className='flex gap-1 p-3 bg-slate-50 border-b border-slate-100'>
              {[
                { key: 'summary', label: 'CGPA Summary' },
                { key: 'full', label: 'Full Semester Breakdown' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPreviewMode(tab.key as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    previewMode === tab.key
                      ? 'bg-white shadow text-esut-green'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {previewMode === 'summary' ? (
              /* CGPA Summary */
              <div className='p-6 space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='bg-esut-green/5 rounded-2xl p-4 text-center border border-esut-green/10'>
                    <p className='text-xs text-slate-500 uppercase tracking-wide'>
                      CGPA
                    </p>
                    <p className='text-4xl font-bold text-esut-green font-display mt-1'>
                      {transcript.cgpa?.toFixed(2)}
                    </p>
                    <p className='text-xs text-slate-400'>out of 5.00</p>
                  </div>
                  <div className='bg-slate-50 rounded-2xl p-4 text-center'>
                    <p className='text-xs text-slate-500 uppercase tracking-wide'>
                      Credit Units
                    </p>
                    <p className='text-4xl font-bold text-slate-700 font-display mt-1'>
                      {transcript.total_units}
                    </p>
                    <p className='text-xs text-slate-400'>earned</p>
                  </div>
                  <div className='bg-esut-gold/5 rounded-2xl p-4 text-center border border-esut-gold/10'>
                    <p className='text-xs text-slate-500 uppercase tracking-wide'>
                      Semesters
                    </p>
                    <p className='text-4xl font-bold text-esut-gold font-display mt-1'>
                      {transcript.semesters?.length}
                    </p>
                    <p className='text-xs text-slate-400'>completed</p>
                  </div>
                </div>

                {/* GPA per semester table */}
                <div className='rounded-xl border border-slate-100 overflow-hidden'>
                  <div className='grid grid-cols-4 gap-2 px-4 py-2.5 bg-slate-50 text-xs font-semibold text-slate-500 uppercase'>
                    <span>Session</span>
                    <span>Semester</span>
                    <span className='text-center'>Units</span>
                    <span className='text-center'>GPA</span>
                  </div>
                  {transcript.semesters?.map((sem: any, i: number) => (
                    <div
                      key={i}
                      className='grid grid-cols-4 gap-2 px-4 py-3 border-t border-slate-50 hover:bg-slate-50/60 items-center'
                    >
                      <span className='text-sm text-slate-700 font-medium'>
                        {sem.session}
                      </span>
                      <span className='text-sm text-slate-500 capitalize'>
                        {sem.semester}
                      </span>
                      <span className='text-sm text-slate-700 font-semibold text-center'>
                        {sem.total_units}
                      </span>
                      <span
                        className={`text-sm font-bold text-center ${sem.gpa >= 3.5 ? 'text-green-700' : sem.gpa >= 2.4 ? 'text-yellow-700' : 'text-red-600'}`}
                      >
                        {sem.gpa?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Degree class */}
                <div className='flex items-center justify-between p-4 rounded-xl bg-esut-green text-white'>
                  <div>
                    <p className='text-white/70 text-xs uppercase tracking-wide font-medium'>
                      Degree Classification
                    </p>
                    <p className='text-lg font-bold mt-0.5'>
                      {transcript.degree_class}
                    </p>
                  </div>
                  <Shield size={32} className='text-esut-gold' />
                </div>
              </div>
            ) : (
              /* Full breakdown */
              <div className='divide-y divide-slate-50'>
                {transcript.semesters?.map((sem: any, si: number) => (
                  <div key={si} className='p-5'>
                    <div className='flex items-center justify-between mb-3'>
                      <p className='font-semibold text-sm text-slate-700'>
                        {sem.session} —{' '}
                        <span className='capitalize'>{sem.semester}</span>{' '}
                        Semester
                      </p>
                      <span className='badge badge-green'>
                        GPA: {sem.gpa?.toFixed(2)}
                      </span>
                    </div>
                    <div className='space-y-1.5'>
                      {sem.results?.map((r: any, ri: number) => (
                        <div
                          key={ri}
                          className='flex items-center gap-3 py-1.5 text-sm'
                        >
                          <span className='text-slate-400 w-6 text-center text-xs'>
                            {ri + 1}
                          </span>
                          <span className='font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 flex-shrink-0'>
                            {r.course_code}
                          </span>
                          <span className='flex-1 text-slate-600 truncate'>
                            {r.course_title}
                          </span>
                          <span className='text-slate-500 w-8 text-center text-xs'>
                            {r.course_units}u
                          </span>
                          <span className='font-semibold text-slate-700 w-10 text-center'>
                            {r.score}
                          </span>
                          <span
                            className={`w-8 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              r.grade === 'A'
                                ? 'bg-green-100 text-green-800'
                                : r.grade === 'B'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.grade === 'C'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {r.grade}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className='px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400'>
              <CheckCircle size={13} className='text-esut-green' />
              This is a preview. The downloaded PDF contains official signatures
              and QR verification code.
            </div>
          </motion.div>

          {/* Verification info */}
          <div className='card p-5 flex items-start gap-4'>
            <div className='w-10 h-10 rounded-xl bg-esut-green/10 flex items-center justify-center flex-shrink-0'>
              <QrCode size={18} className='text-esut-green' />
            </div>
            <div>
              <p className='font-semibold text-slate-700 text-sm'>
                QR Code Verification
              </p>
              <p className='text-xs text-slate-500 mt-0.5 leading-relaxed'>
                The transcript PDF contains a QR code that can be scanned to
                verify authenticity at{' '}
                <span className='font-mono text-esut-green'>{verifyUrl}</span>
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className='card p-16 text-center'>
          <GraduationCap size={48} className='mx-auto text-slate-200 mb-4' />
          <p className='text-slate-600 font-medium'>
            No approved results available
          </p>
          <p className='text-slate-400 text-sm mt-1'>
            Your transcript will be available once results are approved
          </p>
        </div>
      )}
    </div>
  );
}
