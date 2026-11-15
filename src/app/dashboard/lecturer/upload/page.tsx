/** @format */

'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, FileText, Plus, BookOpen, Layers } from 'lucide-react';
import { resultsApi, coursesApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import { useSessionOptions } from '../../../../hooks/useSessionOptions';
import toast from 'react-hot-toast';

export default function UploadResultsPage() {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'csv' | 'single'>('single');

  // Load sessions dynamically from the backend
  const { sessions, currentSession, isLoading: sessionsLoading } = useSessionOptions();

  // Form state for single result
  const [singleResult, setSingleResult] = useState({
    matric_number: '',
    course_code: '',
    score: 0,
    session: '',
    semester: 'first',
  });

  const activeSession = singleResult.session || currentSession || '2024/2025';

  // Load lecturer's assigned courses for the active session
  const { data: assignedCoursesData } = useQuery({
    queryKey: ['lecturer-assigned-courses', user?.id, activeSession],
    queryFn: () => coursesApi.getLecturerCourses(user!.id, activeSession).then((r) => r.data),
    enabled: !!user?.id,
  });
  const assignedCourses = assignedCoursesData?.courses || [];

  // Once the current session is known, set it as default
  useEffect(() => {
    if (currentSession && !singleResult.session) {
      setSingleResult((prev) => ({ ...prev, session: currentSession }));
    }
  }, [currentSession, singleResult.session]);

  // CSV upload state
  const [csvCourseCode, setCsvCourseCode] = useState('');
  const [csvSemester, setCsvSemester] = useState('first');

  // When a course is picked in single mode, auto-align semester
  const handleCourseChange = (code: string) => {
    const matched = assignedCourses.find((c: any) => c.code.toUpperCase() === code.toUpperCase());
    setSingleResult((prev) => ({
      ...prev,
      course_code: code,
      semester: matched?.semester || prev.semester,
    }));
  };

  // Helper to extract string messages from complex error objects (like FastAPI 422s)
  const getErrorMessage = (error: any) => {
    const detail = error.response?.data?.detail || error.message;
    if (Array.isArray(detail)) {
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

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleResult.course_code.trim()) {
      return toast.error('Please select or enter a course code');
    }
    setIsUploading(true);
    try {
      await resultsApi.add({
        matric_number: singleResult.matric_number.trim(),
        course_code: singleResult.course_code.trim().toUpperCase(),
        score: Number(singleResult.score),
        session: activeSession,
        semester: singleResult.semester,
      });
      toast.success('Result added successfully');
      setSingleResult({
        ...singleResult,
        matric_number: '',
        score: 0,
      });
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    if (!csvCourseCode.trim()) return toast.error('Please select a course for CSV upload');

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await resultsApi.uploadCsv(formData, {
        course_code: csvCourseCode.trim().toUpperCase(),
        session: activeSession,
        semester: csvSemester,
      });
      toast.success('Results uploaded successfully and pending approval');
      setFile(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='section-title'>Manage Results</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            Add or upload student academic results
          </p>
        </div>
        <div className='flex bg-slate-100 p-1 rounded-lg gap-1'>
          <button
            onClick={() => setUploadMode('single')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${uploadMode === 'single' ? 'bg-white shadow-sm text-esut-green' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Single Entry
          </button>
          <button
            onClick={() => setUploadMode('csv')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${uploadMode === 'csv' ? 'bg-white shadow-sm text-esut-green' : 'text-slate-500 hover:text-slate-700'}`}
          >
            CSV Upload
          </button>
        </div>
      </div>

      {uploadMode === 'single' ? (
        <div className='card p-6'>
          <form
            onSubmit={handleSingleSubmit}
            className='grid grid-cols-1 md:grid-cols-2 gap-4'
          >
            {/* Student Matric */}
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Student Matric / Reg Number
              </label>
              <input
                type='text'
                required
                className='input w-full'
                placeholder='e.g. 2024070000978 or ESUT/20/0001'
                value={singleResult.matric_number}
                onChange={(e) =>
                  setSingleResult({
                    ...singleResult,
                    matric_number: e.target.value,
                  })
                }
              />
            </div>

            {/* Course Code / Assigned Course */}
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Course
              </label>
              {assignedCourses.length > 0 ? (
                <select
                  className='input w-full'
                  value={singleResult.course_code}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  required
                >
                  <option value=''>Choose assigned course...</option>
                  {assignedCourses.map((c: any) => (
                    <option key={c.id || c.code} value={c.code}>
                      {c.code} — {c.title} ({c.semester.charAt(0).toUpperCase() + c.semester.slice(1)} Sem)
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type='text'
                  required
                  className='input w-full'
                  placeholder='e.g. COE 102'
                  value={singleResult.course_code}
                  onChange={(e) => handleCourseChange(e.target.value)}
                />
              )}
            </div>

            {/* Academic Session */}
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Academic Session
              </label>
              <select
                className='input w-full'
                value={activeSession}
                onChange={(e) =>
                  setSingleResult({ ...singleResult, session: e.target.value })
                }
                disabled={sessionsLoading && sessions.length === 0}
              >
                {sessions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Semester
              </label>
              <select
                className='input w-full'
                value={singleResult.semester}
                onChange={(e) =>
                  setSingleResult({ ...singleResult, semester: e.target.value })
                }
              >
                <option value='first'>First Semester</option>
                <option value='second'>Second Semester</option>
                <option value='third'>Third Semester</option>
              </select>
            </div>

            {/* Score */}
            <div className='space-y-1 md:col-span-2'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Score (0-100)
              </label>
              <input
                type='number'
                min='0'
                max='100'
                required
                className='input w-full'
                value={singleResult.score || ''}
                placeholder='Enter score (e.g. 75)'
                onChange={(e) =>
                  setSingleResult({
                    ...singleResult,
                    score: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className='md:col-span-2 pt-2'>
              <button
                type='submit'
                disabled={isUploading}
                className='btn btn-primary w-full gap-2'
              >
                <Plus size={18} />{' '}
                {isUploading ? 'Processing...' : 'Add Result Entry'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className='card p-6 space-y-5'>
          {/* CSV Config: Course, Session, Semester */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Course
              </label>
              {assignedCourses.length > 0 ? (
                <select
                  className='input w-full'
                  value={csvCourseCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const matched = assignedCourses.find((c: any) => c.code.toUpperCase() === code.toUpperCase());
                    setCsvCourseCode(code);
                    if (matched?.semester) setCsvSemester(matched.semester);
                  }}
                  required
                >
                  <option value=''>Choose assigned course...</option>
                  {assignedCourses.map((c: any) => (
                    <option key={c.id || c.code} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type='text'
                  className='input w-full'
                  placeholder='e.g. COE 102'
                  value={csvCourseCode}
                  onChange={(e) => setCsvCourseCode(e.target.value.toUpperCase())}
                  required
                />
              )}
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Session
              </label>
              <select
                className='input w-full'
                value={activeSession}
                onChange={(e) =>
                  setSingleResult({ ...singleResult, session: e.target.value })
                }
              >
                {sessions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Semester
              </label>
              <select
                className='input w-full'
                value={csvSemester}
                onChange={(e) => setCsvSemester(e.target.value)}
              >
                <option value='first'>First Semester</option>
                <option value='second'>Second Semester</option>
                <option value='third'>Third Semester</option>
              </select>
            </div>
          </div>

          <div className='border-dashed border-2 border-slate-200 rounded-xl p-8 text-center'>
            <form onSubmit={handleUpload} className='space-y-4'>
              <div className='flex flex-col items-center gap-3'>
                <div className='p-4 bg-esut-green/10 rounded-full text-esut-green'>
                  <Upload size={32} />
                </div>
                <div>
                  <p className='text-sm font-semibold text-slate-700'>
                    Click to select or drag and drop
                  </p>
                  <p className='text-xs text-slate-400 mt-1'>
                    CSV file with columns: matric_number, score
                  </p>
                </div>
                <input
                  type='file'
                  accept='.csv,.xlsx,.xls'
                  className='hidden'
                  id='file-upload'
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor='file-upload'
                  className='btn bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                >
                  Select File
                </label>
                {file && (
                  <div className='flex items-center gap-2 text-esut-green text-sm font-medium'>
                    <FileText size={16} />
                    {file.name}
                  </div>
                )}
              </div>
              <button
                type='submit'
                disabled={!file || isUploading || !csvCourseCode}
                className='btn btn-primary w-full mt-4'
              >
                {isUploading ? 'Uploading...' : 'Confirm and Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
