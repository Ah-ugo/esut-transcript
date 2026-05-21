/** @format */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, Shield, Lock } from 'lucide-react';
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(data);
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
          <div className='w-12 h-12 bg-esut-gold rounded-xl flex items-center justify-center shadow-gold'>
            <GraduationCap size={24} className='text-white' />
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
            <div className='w-9 h-9 bg-esut-green rounded-lg flex items-center justify-center'>
              <GraduationCap size={18} className='text-white' />
            </div>
            <span className='font-bold text-esut-green'>
              ESUT Result System
            </span>
          </div>

          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-slate-800 mb-2 font-display'>
              Sign in
            </h2>
            <p className='text-slate-500 text-sm'>
              Enter your credentials to access the portal.
            </p>
          </div>

          {/* Demo credentials notice */}
          <div className='bg-esut-green/5 border border-esut-green/20 rounded-xl p-4 mb-6'>
            <p className='text-xs font-semibold text-esut-green mb-2 flex items-center gap-1.5'>
              <Shield size={13} /> Demo Credentials
            </p>
            <div className='space-y-0.5 text-xs text-slate-600'>
              <p>
                <span className='font-medium'>Admin:</span> admin@esut.edu.ng /
                admin123
              </p>
              <p>
                <span className='font-medium'>Lecturer:</span>{' '}
                dr.okafor@esut.edu.ng / lecturer123
              </p>
              <p>
                <span className='font-medium'>Student:</span>{' '}
                emeka.obiora@student.esut.edu.ng / ESUT/2021/CS/001
              </p>
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
              className='btn-primary w-full py-3 flex items-center justify-center gap-2'
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

          <p className='text-center text-xs text-slate-400 mt-8'>
            Protected by 256-bit SSL encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}
