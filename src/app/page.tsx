/** @format */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Lock,
  FileText,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [verifyMatric, setVerifyMatric] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyMatric.trim()) return;
    router.push(`/verify/${encodeURIComponent(verifyMatric.trim())}`);
  };

  const defenceCandidates = [
    { name: 'Akpata Adaeze Florence', reg: '2024070000978', cgpa: '5.00' },
    { name: 'Ogbonna Emmanuel', reg: '2024070001017', cgpa: '5.00' },
    { name: 'Okorie Godwin Ikechukwu', reg: '2024070001412', cgpa: '5.00' },
    { name: 'Eneota Remigius Obinna', reg: '2024070000592', cgpa: '4.67' },
  ];

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col'>
      {/* Top Navigation */}
      <header className='bg-white/90 backdrop-blur sticky top-0 z-50 border-b border-slate-200'>
        <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 p-0.5'>
              <Image src='/esut-logo.png' alt='ESUT Logo' width={36} height={36} className='object-contain' />
            </div>
            <div>
              <span className='font-bold text-slate-900 text-base tracking-tight'>
                ESUT Portal
              </span>
              <p className='text-xs text-slate-500'>
                Enugu State University of Science and Technology
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              href='/verify'
              className='text-xs font-semibold text-slate-600 hover:text-esut-green px-3 py-2 rounded-lg transition-colors hidden sm:inline-flex items-center gap-1.5'
            >
              <ShieldCheck size={15} /> Verify Transcript
            </Link>
            <Link
              href='/auth/login'
              className='btn-primary text-xs py-2 px-4 flex items-center gap-1.5'
            >
              <Lock size={13} /> Sign In to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='bg-gradient-to-b from-esut-green via-[#541000] to-[#360b00] text-white py-16 px-4 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10 pointer-events-none'>
          <div className='absolute -top-32 -left-32 w-96 h-96 bg-white rounded-full' />
          <div className='absolute bottom-0 right-0 w-80 h-80 bg-esut-gold rounded-full' />
        </div>

        <div className='max-w-4xl mx-auto text-center relative z-10'>
          {/* ESUT Logo in hero */}
          <div className='flex justify-center mb-5'>
            <div className='w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl p-1'>
              <Image src='/esut-logo.png' alt='ESUT Logo' width={72} height={72} className='object-contain' />
            </div>
          </div>
          <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-esut-gold mb-6'>
            <Sparkles size={14} /> Official Academic Result & Transcript System
          </div>

          <h1 className='text-3xl sm:text-5xl font-display font-bold leading-tight mb-4'>
            Transparent Grading. Instant CGPA.
            <br />
            <span className='text-esut-gold'>Tamper-Proof Transcripts.</span>
          </h1>

          <p className='text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8'>
            Designed for ESUT students, faculty lecturers, external defence panels,
            and employers. Easily view grades, track academic progress, and verify
            official university credentials in real time.
          </p>

          {/* Quick Search Verification Widget */}
          <div className='max-w-xl mx-auto bg-white rounded-2xl p-2.5 shadow-xl border border-white/10 flex flex-col sm:flex-row gap-2'>
            <div className='relative flex-1'>
              <Search
                size={18}
                className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
              />
              <input
                type='text'
                value={verifyMatric}
                onChange={(e) => setVerifyMatric(e.target.value)}
                placeholder='Enter Reg / Matric No (e.g. 2024070000978)'
                className='w-full pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none rounded-xl'
              />
            </div>
            <button
              onClick={handleVerifySubmit}
              disabled={!verifyMatric.trim()}
              className='btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-1.5 font-semibold shrink-0'
            >
              Verify Transcript <ArrowRight size={14} />
            </button>
          </div>

          {/* Quick Defence Candidates Chips */}
          <div className='mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-white/70'>
            <span>Quick test defence candidates:</span>
            {defenceCandidates.map((c) => (
              <button
                key={c.reg}
                onClick={() => router.push(`/verify/${c.reg}`)}
                className='px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[11px] text-white border border-white/15 transition-all'
              >
                {c.name.split(' ')[0]} ({c.cgpa} CGPA)
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portals Overview Grid */}
      <section className='max-w-6xl mx-auto px-4 -mt-8 relative z-20 w-full mb-16'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Card 1: Students */}
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow'>
            <div>
              <div className='w-12 h-12 rounded-xl bg-esut-green/10 text-esut-green flex items-center justify-center mb-4'>
                <GraduationCap size={24} />
              </div>
              <h3 className='text-lg font-bold text-slate-900 mb-1.5'>
                Student & Defence Portal
              </h3>
              <p className='text-xs text-slate-600 leading-relaxed mb-4'>
                View verified semester course results, calculate dynamic CGPA
                under NUC/ESUT 5.0 standard, and download official PDF transcripts
                with cryptographic QR verification.
              </p>
              <ul className='space-y-1.5 text-xs text-slate-500 mb-6'>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-esut-green' /> Complete 3-semester M.Eng records
                </li>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-esut-green' /> GPA & CGPA progress charts
                </li>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-esut-green' /> Ready for 2024/2025 External Defence
                </li>
              </ul>
            </div>
            <Link
              href='/auth/login'
              className='text-xs font-bold text-esut-green flex items-center gap-1 hover:underline'
            >
              Sign In as Student <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 2: Lecturers */}
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow'>
            <div>
              <div className='w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4'>
                <BookOpen size={24} />
              </div>
              <h3 className='text-lg font-bold text-slate-900 mb-1.5'>
                Lecturer Portal
              </h3>
              <p className='text-xs text-slate-600 leading-relaxed mb-4'>
                Faculty members can view assigned courses, upload scores via single
                entry or bulk CSV, preview student grades before submission, and
                monitor administrative approval.
              </p>
              <ul className='space-y-1.5 text-xs text-slate-500 mb-6'>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-amber-700' /> Assigned course allocations
                </li>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-amber-700' /> Single or bulk CSV result uploads
                </li>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-amber-700' /> Dr. Gide, Dr. Oleka, Dr. Chagunye, etc.
                </li>
              </ul>
            </div>
            <Link
              href='/auth/login'
              className='text-xs font-bold text-amber-800 flex items-center gap-1 hover:underline'
            >
              Sign In as Lecturer <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 3: Registry & Admin */}
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow'>
            <div>
              <div className='w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4'>
                <Building2 size={24} />
              </div>
              <h3 className='text-lg font-bold text-slate-900 mb-1.5'>
                Registry & Admin
              </h3>
              <p className='text-xs text-slate-600 leading-relaxed mb-4'>
                Full university oversight: approve or reject submitted scores,
                manage faculties, departments, programmes, courses, and review
                complete audit trails.
              </p>
              <ul className='space-y-1.5 text-xs text-slate-500 mb-6'>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-blue-700' /> Grade moderation & approval
                </li>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-blue-700' /> Programme & course configuration
                </li>
                <li className='flex items-center gap-1.5'>
                  <CheckCircle2 size={13} className='text-blue-700' /> Tamper-evident audit logs
                </li>
              </ul>
            </div>
            <Link
              href='/auth/login'
              className='text-xs font-bold text-blue-800 flex items-center gap-1 hover:underline'
            >
              Sign In as Admin <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='bg-white py-16 border-y border-slate-200'>
        <div className='max-w-4xl mx-auto px-4 text-center'>
          <h2 className='text-2xl font-display font-bold text-slate-900 mb-2'>
            How the System Works in 3 Simple Steps
          </h2>
          <p className='text-slate-500 text-xs sm:text-sm max-w-xl mx-auto mb-12'>
            From continuous assessment and exam marking to official verified transcripts:
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-left'>
            <div className='p-5 rounded-2xl bg-slate-50 border border-slate-100'>
              <div className='w-9 h-9 rounded-xl bg-esut-green text-white font-bold text-sm flex items-center justify-center mb-3'>
                1
              </div>
              <h4 className='font-bold text-slate-900 text-sm mb-1'>Grade Entry</h4>
              <p className='text-xs text-slate-600 leading-relaxed'>
                Assigned lecturers submit exam scores for their courses. Scores are
                validated against registered student matric numbers and marked as pending.
              </p>
            </div>

            <div className='p-5 rounded-2xl bg-slate-50 border border-slate-100'>
              <div className='w-9 h-9 rounded-xl bg-esut-green text-white font-bold text-sm flex items-center justify-center mb-3'>
                2
              </div>
              <h4 className='font-bold text-slate-900 text-sm mb-1'>Audit & Approval</h4>
              <p className='text-xs text-slate-600 leading-relaxed'>
                Departmental Heads and University Administrators inspect score
                distributions, verify grading policies, and officially approve the results.
              </p>
            </div>

            <div className='p-5 rounded-2xl bg-slate-50 border border-slate-100'>
              <div className='w-9 h-9 rounded-xl bg-esut-green text-white font-bold text-sm flex items-center justify-center mb-3'>
                3
              </div>
              <h4 className='font-bold text-slate-900 text-sm mb-1'>Instant Verification</h4>
              <p className='text-xs text-slate-600 leading-relaxed'>
                Students generate signed PDF transcripts with embedded dynamic QR
                codes that any employer or university can verify in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='mt-auto bg-slate-900 text-white/70 py-10 px-4'>
        <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 bg-esut-green rounded-lg flex items-center justify-center text-white'>
              <GraduationCap size={16} />
            </div>
            <span>Enugu State University of Science and Technology (ESUT)</span>
          </div>

          <div className='flex items-center gap-4 text-white/50'>
            <Link href='/verify' className='hover:text-white'>
              Public Verifier
            </Link>
            <Link href='/auth/login' className='hover:text-white'>
              Portal Login
            </Link>
          </div>

          <p className='text-white/40'>
            © {new Date().getFullYear()} ESUT Registry. Agbani, Enugu State, Nigeria.
          </p>
        </div>
      </footer>
    </div>
  );
}
