import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Download,
  Flag,
  FolderOpen,
  Heart,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  ScrollText,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react'
import Logo from '../components/layout/Logo'
import ThemeToggle from '../components/layout/ThemeToggle'
import LanguageSwitcher from '../components/layout/LanguageSwitcher'
import NotificationBell from '../components/notifications/NotificationBell'
import { useAuth } from '../contexts/AuthContext'
import { successToast } from '../utils/alerts'

function navForRole(role) {
  if (role === 'admin') {
    return [
      { to: '/admin', end: true, icon: LayoutDashboard, key: 'common.dashboard' },
      { to: '/admin/ressources', icon: FolderOpen, key: 'admin.manageResources' },
      { to: '/admin/pedagogie', icon: Layers, key: 'admin.managePedagogy' },
      { to: '/admin/utilisateurs', icon: Users, key: 'admin.manageUsers' },
      { to: '/admin/commentaires', icon: MessageSquare, key: 'comments.title' },
      { to: '/admin/signalements', icon: Flag, key: 'admin.reports' },
      { to: '/admin/parametres', icon: Settings, key: 'admin.settings' },
      { to: '/admin/journal', icon: ScrollText, key: 'admin.auditLogs' },
      { to: '/profil', icon: User, key: 'student.profile' },
    ]
  }

  if (role === 'contributor') {
    return [
      { to: '/contributeur', end: true, icon: LayoutDashboard, key: 'common.dashboard' },
      { to: '/contributeur/ressources', end: true, icon: FolderOpen, key: 'contributor.myResources' },
      { to: '/contributeur/ressources/nouvelle', icon: PlusCircle, key: 'contributor.addResource' },
      { to: '/profil', icon: User, key: 'student.profile' },
    ]
  }

  return [
    { to: '/etudiant', end: true, icon: LayoutDashboard, key: 'common.dashboard' },
    { to: '/etudiant/favoris', icon: Heart, key: 'student.myFavorites' },
    { to: '/etudiant/telechargements', icon: Download, key: 'student.downloadedHistory' },
    { to: '/etudiant/notifications', icon: Bell, key: 'student.notifications' },
    { to: '/profil', icon: User, key: 'student.profile' },
  ]
}

export default function DashboardLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef(null)

  const links = navForRole(user?.role)

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!userRef.current?.contains(event.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    successToast(t('auth.logoutSuccess'))
    navigate('/')
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'gradient-brand text-white shadow-sm shadow-primary-600/25'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60'
    }`

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label={t('common.dashboard')}>
        {links.map(({ to, end, icon: Icon, key }) => (
          <NavLink key={to} to={to} end={end} className={linkClasses}>
            <Icon className="size-4.5 shrink-0" />
            {t(key)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 dark:border-slate-700/60">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/60"
        >
          <ArrowLeft className="size-4.5 flip-rtl" />
          <span>{t('nav.home')}</span>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-slate-200 bg-white lg:block dark:border-slate-700/60 dark:bg-slate-900/60">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 start-0 w-72 animate-slide-up bg-white shadow-xl dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label={t('common.close')}
              className="absolute end-3 top-4 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ps-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6 dark:border-slate-700/60 dark:bg-surface-dark/85">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('nav.openMenu')}
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-700/60"
          >
            <Menu className="size-5" />
          </button>

          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {t('student.welcome', { name: user?.name?.split(' ')[0] || '' })}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />

            <div ref={userRef} className="relative">
              <button
                type="button"
                onClick={() => setUserOpen((value) => !value)}
                aria-expanded={userOpen}
                className="flex cursor-pointer items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/60"
              >
                <span className="gradient-brand flex size-8 items-center justify-center rounded-lg text-sm font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium text-slate-700 sm:block dark:text-slate-200">
                  {user?.name}
                </span>
                <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
              </button>

              {userOpen && (
                <div className="absolute end-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <NavLink
                    to="/profil"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
                  >
                    <User className="size-4" />
                    {t('student.profile')}
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/15"
                  >
                    <LogOut className="size-4" />
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
