import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck, Circle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { studentService } from '../../services/studentService'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { timeAgo } from '../../utils/format'
import { successToast, errorToast } from '../../utils/alerts'

const PER_PAGE = 15

export default function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useApi(
    () => studentService.notifications({ per_page: PER_PAGE, page }),
    [page],
  )

  const notifications = data?.data || []
  const meta = data?.meta || {}
  const unread = notifications.filter((item) => !item.is_read).length

  const handleOpen = async (notification) => {
    try {
      if (!notification.is_read) {
        await studentService.markNotificationRead(notification.id)
      }
      if (notification.url) {
        navigate(notification.url)
      } else {
        await reload()
      }
    } catch {
      errorToast(t('common.error'))
    }
  }

  const handleMarkAll = async () => {
    try {
      await studentService.markAllNotificationsRead()
      successToast(t('student.notificationsMarkedRead'))
      await reload()
    } catch {
      errorToast(t('common.error'))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('student.notifications')}
        description={
          unread > 0 ? t('student.unreadCount', { count: unread }) : t('student.allCaughtUp')
        }
        actions={
          notifications.length > 0 && (
            <Button size="sm" variant="outline" icon={CheckCheck} onClick={handleMarkAll}>
              {t('student.markAllRead')}
            </Button>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t('student.emptyNotifications')}
          description={t('student.emptyNotificationsDesc')}
        />
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                hover
                className={`p-4 ${notification.is_read ? '' : 'border-primary-200 bg-primary-50/40 dark:border-primary-600/30 dark:bg-primary-600/5'}`}
              >
                <button
                  type="button"
                  onClick={() => handleOpen(notification)}
                  className="flex w-full cursor-pointer items-start gap-3.5 text-start"
                >
                  <span
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      notification.is_read
                        ? 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
                        : 'bg-primary-100 text-primary-600 dark:bg-primary-600/20 dark:text-primary-300'
                    }`}
                  >
                    <Bell className="size-4.5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{notification.title}</span>
                      {!notification.is_read && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                          <Circle className="size-1.5 fill-current" />
                          {t('student.newBadge')}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                      {notification.message}
                    </span>
                    <span className="mt-1.5 block text-xs text-slate-400 dark:text-slate-500">
                      {timeAgo(notification.created_at, i18n.language)}
                    </span>
                  </span>
                </button>
              </Card>
            ))}
          </div>

          {meta.last_page > 1 && (
            <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onChange={setPage} className="mt-8" />
          )}
        </>
      )}
    </div>
  )
}
