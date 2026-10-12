import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Bell,
  Clock,
  Download,
  Eye,
  Heart,
  History,
  Trophy,
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { studentService } from '../../services/studentService'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ResourceCard from '../../components/resources/ResourceCard'
import { ResourceGridSkeleton, Skeleton } from '../../components/ui/Skeleton'
import ErrorMessage from '../../components/ui/ErrorMessage'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/format'

export default function StudentDashboardPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { data, loading, error, reload } = useApi(() => studentService.dashboard(), [])

  const stats = data?.stats
  const continueLearning = data?.continue_learning?.data ?? data?.continue_learning ?? []
  const recentDownloads = data?.recent_downloads?.data ?? data?.recent_downloads ?? []
  const suggestedResources = data?.suggested_resources?.data ?? data?.suggested_resources ?? []
  const suggestedQuizzes = data?.suggested_quizzes?.data ?? data?.suggested_quizzes ?? []

  return (
    <div>
      <PageHeader
        title={t('student.welcome', { name: user?.name?.split(' ')[0] || '' })}
        description={t('student.welcomeSubtitle')}
        actions={
          <Button as={Link} to="/ressources" size="sm" icon={History}>
            {t('student.quickSearch')}
          </Button>
        }
      />

      {data?.unread_notifications > 0 && (
        <Link
          to="/etudiant/notifications"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50/70 px-4 py-3 text-sm text-primary-800 transition-colors hover:bg-primary-50 dark:border-primary-600/30 dark:bg-primary-600/10 dark:text-primary-200"
        >
          <Bell className="size-4.5 shrink-0" />
          <span className="flex-1">{t('student.unreadCount', { count: data.unread_notifications })}</span>
          <ArrowRight className="size-4 shrink-0 flip-rtl" />
        </Link>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Heart} label={t('student.myFavorites')} value={stats?.favorites_count ?? 0} tone="red" />
            <StatCard icon={Download} label={t('student.downloadedHistory')} value={stats?.downloads_count ?? 0} tone="green" />
            <StatCard icon={Eye} label={t('student.consultedRecently')} value={stats?.views_count ?? 0} tone="sky" />
            <StatCard
              icon={Trophy}
              label={t('student.quizAttempts')}
              value={stats?.quiz_attempts_count ?? 0}
              tone="amber"
              hint={
                stats?.quiz_best_score != null
                  ? t('student.bestScoreHint', { score: stats.quiz_best_score })
                  : undefined
              }
            />
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {t('student.continueLearning')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('student.continueLearningSubtitle')}</p>
              </div>
              <Link to="/etudiant/telechargements" className="link text-sm font-medium">
                {t('common.viewAll')}
              </Link>
            </div>

            {continueLearning.length === 0 ? (
              <EmptyState
                icon={History}
                title={t('student.emptyContinue')}
                description={t('student.emptyContinueDesc')}
                action={
                  <Button as={Link} to="/ressources" size="sm" variant="outline">
                    {t('nav.resources')}
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {continueLearning.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {t('student.downloadedHistory')}
                </h2>
                <Link to="/etudiant/telechargements" className="link text-sm font-medium">
                  {t('common.viewAll')}
                </Link>
              </div>

              {recentDownloads.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('student.emptyHistoryDesc')}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {recentDownloads.map((download) => (
                    <li key={download.id} className="flex items-center gap-3 py-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-600/15 dark:text-emerald-400">
                        <Download className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {download.resource_id ? (
                          <Link
                            to={`/ressources/${download.resource_id}`}
                            className="block truncate text-sm font-medium text-slate-800 hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-400"
                          >
                            {download.resource_title}
                          </Link>
                        ) : (
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                            {download.resource_title}
                          </span>
                        )}
                        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                          <Clock className="size-3.5" />
                          {formatDate(download.created_at, i18n.language)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {t('quiz.title')}
                </h2>
                <Link to="/quiz" className="link text-sm font-medium">
                  {t('common.viewAll')}
                </Link>
              </div>

              {suggestedQuizzes.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('quiz.noQuizzesDesc')}
                </p>
              ) : (
                <ul className="space-y-3">
                  {suggestedQuizzes.map((quiz) => (
                    <li key={quiz.id}>
                      <Link
                        to={`/quiz/${quiz.id}`}
                        className="block rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-slate-700 dark:hover:border-primary-600/40 dark:hover:bg-primary-600/5"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {quiz.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {quiz.questions_count != null && (
                            <Badge tone="primary">{t('quiz.questionsCount', { count: quiz.questions_count })}</Badge>
                          )}
                          {quiz.duration_minutes && (
                            <Badge tone="slate">{t('quiz.durationMinutes', { minutes: quiz.duration_minutes })}</Badge>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {t('student.recentResources')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('student.recentResourcesSubtitle')}</p>
              </div>
            </div>

            {suggestedResources.length === 0 ? (
              <ResourceGridSkeleton count={3} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {suggestedResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
