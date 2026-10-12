import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck } from 'lucide-react'
import { studentService } from '../../services/studentService'
import { useAuth } from '../../contexts/AuthContext'
import { timeAgo } from '../../utils/format'
import { errorToast } from '../../utils/alerts'

const POLL_MS = 60000
const PREVIEW_COUNT = 6

export default function NotificationBell() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  const refreshCount = useCallback(async () => {
    try {
      setUnread(await studentService.unreadCount())
    } catch {
      /* silencieux : le badge n'est pas critique */
    }
  }, [])

  useEffect(() => {
    refreshCount()
    const timer = setInterval(refreshCount, POLL_MS)
    return () => clearInterval(timer)
  }, [refreshCount])

  useEffect(() => {
    refreshCount()
  }, [pathname, refreshCount])

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!panelRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      try {
        const data = await studentService.notifications({ per_page: PREVIEW_COUNT, page: 1 })
        setItems(data?.data || [])
        setUnread((data?.data || []).filter((item) => !item.is_read).length)
      } catch {
        errorToast(t('common.error'))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleOpen = async (notification) => {
    setOpen(false)
    try {
      if (!notification.is_read) {
        await studentService.markNotificationRead(notification.id)
        refreshCount()
      }
    } catch {
      /* on navigue quand même */
    }
    if (notification.url) navigate(notification.url)
  }

  const handleMarkAll = async () => {
    try {
      await studentService.markAllNotificationsRead()
      setItems((current) => current.map((item) => ({ ...item, is_read: true })))
      setUnread(0)
    } catch {
      errorToast(t('common.error'))
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={t('student.notifications')}
        className="relative flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/60"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4.5 text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('student.notifications')}
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                <CheckCheck className="size-3.5" />
                {t('student.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/50" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto size-6 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {t('student.emptyNotifications')}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {t('student.emptyNotificationsDesc')}
                </p>
              </div>
            ) : (
              items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleOpen(notification)}
                  className={`flex w-full cursor-pointer items-start gap-3 border-b border-slate-100 px-4 py-3 text-start transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/40 ${
                    notification.is_read ? '' : 'bg-primary-50/40 dark:bg-primary-600/5'
                  }`}
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      notification.is_read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-primary-500'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm ${
                        notification.is_read
                          ? 'text-slate-600 dark:text-slate-300'
                          : 'font-semibold text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {notification.title}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
                      {timeAgo(notification.created_at, i18n.language)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {user?.role === 'student' && (
            <Link
              to="/etudiant/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-slate-100 px-4 py-2.5 text-center text-sm font-medium text-primary-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-primary-400 dark:hover:bg-slate-700/40"
            >
              {t('common.viewAll')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
