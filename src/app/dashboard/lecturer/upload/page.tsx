/** @format */

'use client';
import { useState } from 'react';
import { Upload, FileText, Plus } from 'lucide-react';
import { resultsApi } from '../../../../lib/api';
import toast from 'react-hot-toast';

export default function UploadResultsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'csv' | 'single'>('single');
  // Form state for single result
  const [singleResult, setSingleResult] = useState({
    matric_number: '', // Changed from student_id
    course_code: '', // Changed from course_id
    score: 0,
    session: '2023/2024',
    semester: 'first',
  });

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

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await resultsApi.add(singleResult);
      toast.success('Result added successfully');
      setSingleResult({
        ...singleResult,
        matric_number: '',
        course_code: '',
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

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await resultsApi.uploadCsv(formData);
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
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Student Matric Number
              </label>
              <input
                type='text'
                required
                className='input w-full'
                placeholder='e.g. ESUT/20/0001'
                value={singleResult.matric_number} // Bind to matric_number
                onChange={(e) =>
                  setSingleResult({
                    ...singleResult,
                    matric_number: e.target.value, // Update matric_number
                  })
                }
              />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Course Code
              </label>
              <input
                type='text'
                required
                className='input w-full'
                placeholder='e.g. CSC 101'
                value={singleResult.course_code} // Bind to course_code
                onChange={(e) =>
                  setSingleResult({
                    ...singleResult,
                    course_code: e.target.value, // Update course_code
                  })
                }
              />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Score (0-100)
              </label>
              <input
                type='number'
                min='0'
                max='100'
                required
                className='input w-full'
                value={singleResult.score}
                onChange={(e) =>
                  setSingleResult({
                    ...singleResult,
                    score: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-bold text-slate-500 uppercase'>
                Session
              </label>
              <select
                className='input w-full'
                value={singleResult.session}
                onChange={(e) =>
                  setSingleResult({ ...singleResult, session: e.target.value })
                }
              >
                <option value='2023/2024'>2023/2024</option>
                <option value='2022/2023'>2022/2023</option>
              </select>
            </div>
            <div className='md:col-span-2 pt-4'>
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
        <div className='card p-8 text-center border-dashed border-2'>
          <form onSubmit={handleUpload} className='space-y-4'>
            <div className='flex flex-col items-center gap-4'>
              <div className='p-4 bg-esut-green/10 rounded-full text-esut-green'>
                <Upload size={32} />
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-700'>
                  Click to select or drag and drop
                </p>
                <p className='text-xs text-slate-400 mt-1'>
                  Excel or CSV files only (Max. 10MB)
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
              disabled={!file || isUploading}
              className='btn btn-primary w-full mt-4'
            >
              {isUploading ? 'Uploading...' : 'Confirm and Upload'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
