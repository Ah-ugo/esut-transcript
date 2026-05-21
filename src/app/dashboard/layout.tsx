/** @format */

'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Upload,
  BarChart3,
  ClipboardList,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  Bell,
  Search,
  Menu,
  X,
  Award,
  UserCog,
  FolderOpen,
  FileBadge,
  ScrollText,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../lib/api';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  // Admin
  {
    label: 'Overview',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    label: 'Students',
    href: '/dashboard/admin/students',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Courses',
    href: '/dashboard/admin/courses',
    icon: BookOpen,
    roles: ['admin'],
  },
  {
    label: 'Programmes',
    href: '/dashboard/admin/programmes',
    icon: FolderOpen,
    roles: ['admin'],
  },
  {
    label: 'Approve Results',
    href: '/dashboard/admin/approve-results',
    icon: ClipboardList,
    roles: ['admin'],
  },
  {
    label: 'Users',
    href: '/dashboard/admin/users',
    icon: UserCog,
    roles: ['admin'],
  },
  {
    label: 'Audit Logs',
    href: '/dashboard/admin/audit',
    icon: ScrollText,
    roles: ['admin'],
  },
  // Lecturer
  {
    label: 'Dashboard',
    href: '/dashboard/lecturer',
    icon: LayoutDashboard,
    roles: ['lecturer'],
  },
  {
    label: 'My Courses',
    href: '/dashboard/lecturer/courses',
    icon: BookOpen,
    roles: ['lecturer'],
  },
  {
    label: 'Upload Results',
    href: '/dashboard/lecturer/upload',
    icon: Upload,
    roles: ['lecturer'],
  },
  {
    label: 'Submissions',
    href: '/dashboard/lecturer/submissions',
    icon: FileText,
    roles: ['lecturer'],
  },
  // Student
  {
    label: 'Dashboard',
    href: '/dashboard/student',
    icon: LayoutDashboard,
    roles: ['student'],
  },
  {
    label: 'My Results',
    href: '/dashboard/student/results',
    icon: BarChart3,
    roles: ['student'],
  },
  {
    label: 'GPA Analytics',
    href: '/dashboard/student/analytics',
    icon: Award,
    roles: ['student'],
  },
  {
    label: 'Transcript',
    href: '/dashboard/student/transcript',
    icon: FileBadge,
    roles: ['student'],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-10 h-10 border-3 border-esut-green/30 border-t-esut-green rounded-full animate-spin' />
      </div>
    );
  }

  const userNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    lecturer: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
  };

  const SidebarContent = () => (
    <div className='flex flex-col h-full'>
      {/* Brand */}
      <div className='px-4 py-5 flex items-center gap-3 border-b border-white/10'>
        <div className='w-9 h-9 bg-esut-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-gold'>
          <GraduationCap size={18} className='text-white' />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className='overflow-hidden'
            >
              <p className='text-white font-bold text-sm leading-tight whitespace-nowrap'>
                ESUT
              </p>
              <p className='text-white/50 text-xs whitespace-nowrap'>
                Result System
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
        {userNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon size={18} className='flex-shrink-0' />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className='overflow-hidden whitespace-nowrap'
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div
        className={`px-3 py-4 border-t border-white/10 ${collapsed ? 'items-center' : ''}`}
      >
        <div
          className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <div className='w-8 h-8 rounded-lg bg-esut-gold flex items-center justify-center text-white text-xs font-bold flex-shrink-0'>
            {initials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex-1 min-w-0'
              >
                <p className='text-white text-xs font-semibold truncate'>
                  {user.full_name}
                </p>
                <p className='text-white/50 text-xs truncate capitalize'>
                  {user.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={logout}
          className={`sidebar-item w-full mt-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={16} className='flex-shrink-0' />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className='overflow-hidden whitespace-nowrap'
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className='hidden lg:flex flex-col bg-esut-green-dark relative z-30 flex-shrink-0 overflow-hidden'
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className='absolute -right-3 top-20 w-6 h-6 bg-esut-green rounded-full border-2 border-esut-green-dark flex items-center justify-center shadow-md hover:bg-esut-green-light transition-colors z-10'
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={12} className='text-white' />
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='lg:hidden fixed inset-0 bg-black/50 z-40'
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className='lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-esut-green-dark z-50 flex flex-col'
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Topbar */}
        <header className='h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setMobileOpen(true)}
              className='lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600'
            >
              <Menu size={20} />
            </button>
            <div className='relative hidden sm:block'>
              <Search
                size={15}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
              />
              <input
                type='text'
                placeholder='Search students, courses...'
                className='pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-esut-green/20 focus:border-esut-green focus:w-72 transition-all duration-300'
              />
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <button className='relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors'>
              <Bell size={18} />
              <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full' />
            </button>
            <div className='flex items-center gap-2.5 pl-3 border-l border-slate-100'>
              <div className='w-8 h-8 rounded-lg bg-esut-green flex items-center justify-center text-white text-xs font-bold'>
                {initials}
              </div>
              <div className='hidden sm:block'>
                <p className='text-sm font-semibold text-slate-800 leading-tight'>
                  {user.full_name.split(' ')[0]}
                </p>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md capitalize font-medium ${roleColors[user.role]}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto p-4 lg:p-6'>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
