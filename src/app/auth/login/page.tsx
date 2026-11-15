/** @format */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, Shield, Lock, ArrowRight, UserCheck, BookOpen, Search } from 'lucide-react';
import Image from 'next/image';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleQuickFill = (email: string, pass: string, roleName: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.success(`Filled ${roleName} credentials! Click Sign In.`);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      });
      const { access_token, refresh_token, user } = res.data;
      setTokens(access_token, refresh_token);
      setUser(user);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      const routes: Record<string, string> = {
        admin: '/dashboard/admin',
        lecturer: '/dashboard/lecturer',
        student: '/dashboard/student',
      };
      router.push(routes[user.role] || '/dashboard');
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || 'Login failed. Check your credentials.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex'>
      {/* Left Panel */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='hidden lg:flex lg:w-[52%] bg-esut-green relative overflow-hidden flex-col justify-between p-12'
      >
        {/* Background pattern */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full' />
          <div className='absolute top-1/4 -right-24 w-72 h-72 bg-esut-gold/10 rounded-full' />
          <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-esut-gold to-transparent opacity-40' />
          <svg
            className='absolute bottom-0 left-0 w-full opacity-5'
            viewBox='0 0 800 200'
            fill='none'
          >
            <path
              d='M0 200 Q200 100 400 150 Q600 200 800 80 L800 200 Z'
              fill='white'
            />
          </svg>
        </div>

        {/* Logo */}
        <div className='relative z-10 flex items-center gap-3'>
          <div className='w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-gold p-1 flex-shrink-0'>
            <Image src='/esut-logo.png' alt='ESUT Logo' width={56} height={56} className='object-contain' />
          </div>
          <div>
            <p className='text-white font-bold text-lg leading-tight'>ESUT</p>
            <p className='text-white/60 text-xs'>Result System</p>
          </div>
        </div>

        {/* Center text */}
        <div className='relative z-10'>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className='font-display text-5xl font-bold text-white leading-tight mb-4'
          >
            Academic
            <br />
            <span className='text-esut-gold'>Excellence</span>
            <br />
            Starts Here.
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className='text-white/70 text-base leading-relaxed max-w-sm'
          >
            Enugu State University of Science and Technology's official result
            processing and transcript generation portal.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className='flex flex-wrap gap-2 mt-8'
          >
            {[
              'Instant GPA Calculation',
              'PDF Transcripts',
              'QR Verification',
              'Secure Access',
            ].map((f) => (
              <span
                key={f}
                className='px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white/80 font-medium'
              >
                {f}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className='relative z-10 text-white/40 text-xs'>
          © {new Date().getFullYear()} Enugu State University of Science and
          Technology. All rights reserved.
        </div>
      </motion.div>

      {/* Right Panel — Login Form */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='flex-1 flex items-center justify-center p-6 lg:p-16 bg-surface-50'
      >
        <div className='w-full max-w-md'>
          {/* Mobile logo */}
          <div className='lg:hidden flex items-center gap-2 mb-8'>
            <div className='w-9 h-9 bg-white rounded-lg flex items-center justify-center p-0.5 shadow-sm'>
              <Image src='/esut-logo.png' alt='ESUT Logo' width={32} height={32} className='object-contain' />
            </div>
            <span className='font-bold text-esut-green'>
              ESUT Result System
            </span>
          </div>

          <div className='mb-6'>
            <h2 className='text-3xl font-bold text-slate-800 mb-2 font-display'>
              Sign in to Portal
            </h2>
            <p className='text-slate-500 text-sm'>
              Select your role below to auto-fill demo credentials, or type your login details manually.
            </p>
          </div>

          {/* Quick-Fill Role Selector */}
          <div className='bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-sm'>
            <div className='flex items-center justify-between mb-2.5'>
              <span className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                <UserCheck size={14} className='text-esut-green' /> 1-Click Demo Login
              </span>
              <span className='text-[10px] uppercase font-bold text-esut-green bg-esut-green/10 px-2 py-0.5 rounded-full'>
                Click to Auto-Fill
              </span>
            </div>

            <div className='grid grid-cols-2 gap-2 text-xs'>
              <button
                type='button'
                onClick={() => handleQuickFill('adaeze.akpata@pg.esut.edu.ng', '2024070000978', 'M.Eng Candidate')}
                className='text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-esut-green hover:bg-esut-green/5 transition-all'
              >
                <div className='font-bold text-slate-800 flex items-center gap-1'>
                  🎓 M.Eng Defence
                </div>
                <div className='text-[11px] text-slate-500 truncate'>Adaeze Akpata (5.0 CGPA)</div>
              </button>

              <button
                type='button'
                onClick={() => handleQuickFill('dr.gide@esut.edu.ng', 'lecturer123', 'M.Eng Lecturer')}
                className='text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-esut-green hover:bg-esut-green/5 transition-all'
              >
                <div className='font-bold text-slate-800 flex items-center gap-1'>
                  👨‍🏫 M.Eng Lecturer
                </div>
                <div className='text-[11px] text-slate-500 truncate'>Dr. Gide (CEE 810/831/818)</div>
              </button>

              <button
                type='button'
                onClick={() => handleQuickFill('admin@esut.edu.ng', 'admin123', 'System Admin')}
                className='text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-esut-green hover:bg-esut-green/5 transition-all'
              >
                <div className='font-bold text-slate-800 flex items-center gap-1'>
                  🛡️ System Admin
                </div>
                <div className='text-[11px] text-slate-500 truncate'>Registry / Full Access</div>
              </button>

              <button
                type='button'
                onClick={() => handleQuickFill('chukwuemeka.nnamani@student.esut.edu.ng', 'ESUT/2021/COE/012', 'Undergrad Student')}
                className='text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-esut-green hover:bg-esut-green/5 transition-all'
              >
                <div className='font-bold text-slate-800 flex items-center gap-1'>
                  📚 Undergrad Student
                </div>
                <div className='text-[11px] text-slate-500 truncate'>Computer Eng (400L)</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div>
              <label className='label'>Email Address</label>
              <input
                {...register('email')}
                type='email'
                className='input'
                placeholder='you@esut.edu.ng'
                autoComplete='email'
              />
              {errors.email && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className='label'>Password</label>
              <div className='relative'>
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  className='input pr-11'
                  placeholder='••••••••'
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  onClick={() => setShowPwd(!showPwd)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type='submit'
              disabled={isLoading}
              className='btn-primary w-full py-3 flex items-center justify-center gap-2 font-semibold'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Sign In Securely
                </>
              )}
            </motion.button>
          </form>

          {/* Public Verification Shortcut */}
          <div className='mt-6 pt-5 border-t border-slate-200/80 text-center'>
            <p className='text-xs text-slate-500 mb-2'>
              Employer, Embassy, or External Institution?
            </p>
            <Link
              href='/verify'
              className='inline-flex items-center gap-1.5 text-xs font-semibold text-esut-green hover:underline'
            >
              <Search size={13} /> Verify Official Student Transcript (No Login Required) →
            </Link>
          </div>

          <p className='text-center text-xs text-slate-400 mt-6'>
            Enugu State University of Science and Technology · Result Processing System
          </p>
        </div>
      </motion.div>
    </div>
  );
}
