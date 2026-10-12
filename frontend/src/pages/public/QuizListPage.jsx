import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award, Clock, HelpCircle, ListChecks, Play, Target, Trophy } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { quizService } from '../../services/quizService'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../utils/format'

export default function QuizListPage() {
  const { t } = useTranslation()
  const { data: quizzes, loading, error, reload } = useApi(() => quizService.list(), [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          {t('quiz.title')}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t('quiz.subtitle')}</p>
      </header>

      {loading ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : (quizzes || []).length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={t('quiz.noQuizzes')}
          description={t('quiz.noQuizzesDesc')}
          className="mt-8"
        />
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(quizzes || []).map((quiz) => (
            <Card key={quiz.id} hover className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="gradient-brand flex size-12 items-center justify-center rounded-2xl text-white shadow-md">
                  <HelpCircle className="size-6" />
                </div>
                {quiz.my_best_score !== null && quiz.my_best_score !== undefined && (
                  <Badge tone={quiz.my_best_score >= (quiz.passing_score || 50) ? 'green' : 'amber'}>
                    <Trophy className="size-3" />
                    {quiz.my_best_score}%
                  </Badge>
                )}
              </div>

              <h2 className="font-display mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {quiz.title}
              </h2>
              {quiz.description && (
                <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {quiz.module && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                    {quiz.module.code ? `${quiz.module.code} · ` : ''}
                    {quiz.module.name}
                  </span>
                )}
                {quiz.filiere && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                    {quiz.filiere.code}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ListChecks className="size-4" />
                  {t('quiz.questionsCount', { count: quiz.questions_count ?? 0 })}
                </span>
                {quiz.duration_minutes > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {t('quiz.durationMinutes', { minutes: quiz.duration_minutes })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Target className="size-4" />
                  {quiz.passing_score}%
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {t('quiz.attemptsCount', { count: quiz.my_attempts_count ?? 0 })}
                </span>
                <Button as={Link} to={`/quiz/${quiz.id}`} size="sm" icon={Play}>
                  {t('quiz.start')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && (quizzes || []).length > 0 && (
        <Card className="mt-10 p-6">
          <h2 className="font-display flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
            <Award className="size-4.5 text-amber-500" />
            {t('quiz.attemptsHistory')}
          </h2>
          <RecentAttempts />
        </Card>
      )}
    </div>
  )
}

function RecentAttempts() {
  const { t, i18n } = useTranslation()
  const { data: attempts } = useApi(() => quizService.myAttempts(), [])

  if (!attempts || attempts.length === 0) {
    return <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">—</p>
  }

  return (
    <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-700/60">
      {attempts.slice(0, 5).map((attempt) => (
        <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-700 dark:text-slate-200">
              {attempt.quiz?.title || `Quiz #${attempt.quiz_id}`}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {formatDate(attempt.completed_at || attempt.created_at, i18n.language)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-slate-900 dark:text-slate-50">{attempt.score}%</span>
            <Badge tone={attempt.passed ? 'green' : 'red'}>
              {attempt.passed ? t('quiz.passedShort') : t('quiz.failedShort')}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  )
}
