import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationBell from '../notifications/NotificationBell'
import Button from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { successToast } from '../../utils/alerts'

const NAV_LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/filieres', key: 'nav.filieres' },
  { to: '/ressources', key: 'nav.resources' },
  { to: '/quiz', key: 'nav.quizzes' },
  { to: '/projets', key: 'nav.projects' },
  { to: '/a-propos', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
]

function dashboardPath(user) {
  if (user?.role === 'admin') return '/admin'
  if (user?.role === 'contributor') return '/contributeur'
  return '/etudiant'
}

export default function Navbar() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!userRef.current?.contains(event.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleLogout = async () => {
    setUserOpen(false)
    setMobileOpen(false)
    await logout()
    successToast(t('auth.logoutSuccess'))
    navigate('/')
  }

  const linkClasses = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-700/60 dark:bg-surface-dark/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-1.5 sm:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
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
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
              </button>

              {userOpen && (
                <div className="absolute end-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <Link
                    to={dashboardPath(user)}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
                  >
                    <LayoutDashboard className="size-4" />
                    {t('common.dashboard')}
                  </Link>
                  <Link
                    to="/profil"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
                  >
                    <User className="size-4" />
                    {t('student.profile')}
                  </Link>
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
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button as={Link} to="/connexion" variant="ghost" size="sm">
                {t('common.login')}
              </Button>
              <Button as={Link} to="/inscription" size="sm">
                {t('common.register')}
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-700/60"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-700/60 dark:bg-surface-dark" aria-label="Navigation mobile">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60'
                  }`
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-3 sm:hidden dark:border-slate-700/60">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {!isAuthenticated && (
              <div className="mt-2 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-700/60">
                <Button as={Link} to="/connexion" variant="outline" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  {t('common.login')}
                </Button>
                <Button as={Link} to="/inscription" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  {t('common.register')}
                </Button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
