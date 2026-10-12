import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Award,
  CircleCheck,
  Clock,
  HelpCircle,
  ListChecks,
  RotateCcw,
  Target,
  Timer,
  XCircle,
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { quizService } from '../../services/quizService'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Loader from '../../components/ui/Loader'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { formatDuration } from '../../utils/format'
import { errorToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function QuizPlayPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { data: quiz, loading, error, reload } = useApi(() => quizService.detail(id), [id])

  const [phase, setPhase] = useState('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [remaining, setRemaining] = useState(null)
  const [result, setResult] = useState(null)
  const [submitBusy, setSubmitBusy] = useState(false)
  const answersRef = useRef({})
  const startedAtRef = useRef(null)
  const submittedRef = useRef(false)

  const questions = useMemo(() => quiz?.questions || [], [quiz])
  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const submit = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitBusy(true)
    try {
      const payload = {
        answers: questions.map((question) => ({
          question_id: question.id,
          answer_id: answersRef.current[question.id] ?? null,
        })),
        duration_seconds: startedAtRef.current
          ? Math.round((Date.now() - startedAtRef.current) / 1000)
          : null,
      }
      const response = await quizService.submitAttempt(id, payload)
      setResult(response.data)
      setPhase('result')
    } catch (err) {
      submittedRef.current = false
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setSubmitBusy(false)
    }
  }, [id, questions, t])

  const timerActive = phase === 'playing' && remaining !== null

  useEffect(() => {
    if (!timerActive) return undefined
    const timer = setInterval(() => {
      setRemaining((value) => (value === null ? value : Math.max(0, value - 1)))
    }, 1000)
    return () => clearInterval(timer)
  }, [timerActive])

  useEffect(() => {
    if (phase === 'playing' && remaining === 0) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase])

  const start = () => {
    setAnswers({})
    setCurrentIndex(0)
    setResult(null)
    submittedRef.current = false
    startedAtRef.current = Date.now()
    setRemaining(quiz.duration_minutes > 0 ? quiz.duration_minutes * 60 : null)
    setPhase('playing')
  }

  const selectAnswer = (questionId, answerId) => {
    setAnswers((current) => ({ ...current, [questionId]: answerId }))
  }

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((index) => index + 1)
    else submit()
  }

  if (loading) return <Loader className="py-24" />
  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorMessage title={t('common.notFound')} message={t('errors.404Text')} onRetry={reload} />
        <div className="text-center">
          <Button as={Link} to="/quiz" variant="outline" size="sm" icon={ArrowLeft}>
            {t('quiz.backToQuizzes')}
          </Button>
        </div>
      </div>
    )
  }

  /* ---- Intro ---- */
  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          to="/quiz"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="size-4 flip-rtl" />
          {t('quiz.backToQuizzes')}
        </Link>

        <Card className="mt-6 p-7">
          <div className="flex items-start gap-4">
            <div className="gradient-brand flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md">
              <HelpCircle className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">{quiz.title}</h1>
              {quiz.description && (
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {quiz.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
              <ListChecks className="mx-auto size-5 text-primary-600 dark:text-primary-400" />
              <p className="font-display mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {questions.length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('quiz.title')}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
              <Clock className="mx-auto size-5 text-secondary-600 dark:text-secondary-400" />
              <p className="font-display mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {quiz.duration_minutes > 0 ? quiz.duration_minutes : '—'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">min</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
              <Target className="mx-auto size-5 text-emerald-600 dark:text-emerald-400" />
              <p className="font-display mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {quiz.passing_score}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('quiz.score')}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
              <Award className="mx-auto size-5 text-amber-500" />
              <p className="font-display mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                {quiz.my_best_score !== null && quiz.my_best_score !== undefined ? `${quiz.my_best_score}%` : '—'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('quiz.result')}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('quiz.attemptsCount', { count: quiz.my_attempts_count ?? 0 })}
            </span>
            <Button onClick={start} icon={Target} size="lg" disabled={questions.length === 0}>
              {t('quiz.start')}
            </Button>
          </div>
        </Card>

        <QuizHistory quizId={id} />
      </div>
    )
  }

  /* ---- Playing ---- */
  if (phase === 'playing' && currentQuestion) {
    const selected = answers[currentQuestion.id]
    const progress = ((currentIndex + 1) / questions.length) * 100
    const isLast = currentIndex === questions.length - 1

    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('quiz.questionN', { current: currentIndex + 1, total: questions.length })}
          </p>
          {remaining !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                remaining <= 30
                  ? 'bg-red-50 text-red-600 dark:bg-red-600/15 dark:text-red-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300'
              }`}
            >
              <Timer className="size-4" />
              {formatClock(remaining)}
            </span>
          )}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/60">
          <div className="gradient-brand h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <Card className="mt-6 p-6 sm:p-7">
          <Badge tone={currentQuestion.type === 'true_false' ? 'sky' : 'primary'}>
            {currentQuestion.type === 'true_false' ? t('quiz.trueFalse') : t('quiz.multipleChoice')}
          </Badge>
          <h2 className="font-display mt-4 text-lg leading-snug font-semibold text-slate-900 sm:text-xl dark:text-slate-50">
            {currentQuestion.text}
          </h2>

          <div className="mt-6 space-y-2.5">
            {currentQuestion.answers.map((answer, index) => {
              const isSelected = selected === answer.id
              return (
                <button
                  key={answer.id}
                  type="button"
                  onClick={() => selectAnswer(currentQuestion.id, answer.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-start text-sm transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-sm dark:border-primary-400 dark:bg-primary-600/15 dark:text-primary-200'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-primary-600/50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isSelected
                        ? 'gradient-brand text-white'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">{answer.text}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-7 flex justify-end">
            <Button onClick={next} loading={submitBusy} disabled={selected == null}>
              {isLast ? t('quiz.finishQuiz') : t('quiz.nextQuestion')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ---- Result ---- */
  if (phase === 'result' && result) {
    const { attempt, review } = result
    const passed = attempt?.passed

    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Card className="overflow-hidden">
          <div className={`h-1.5 ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <div className="p-7 text-center">
            <div
              className={`mx-auto flex size-24 items-center justify-center rounded-full text-3xl font-bold ${
                passed
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-600/15 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-600/15 dark:text-red-400'
              }`}
            >
              {attempt?.score}%
            </div>
            <h1 className="font-display mt-5 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {t('quiz.yourScore')}
            </h1>
            <p className={`mt-2 text-sm font-medium ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {passed ? t('quiz.passed') : t('quiz.failed')}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {attempt?.correct_count}/{attempt?.total_questions} · {formatDuration(attempt?.duration_seconds)}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button onClick={start} icon={RotateCcw} variant="outline">
                {t('quiz.retry')}
              </Button>
              <Button as={Link} to="/quiz" icon={ArrowLeft}>
                {t('quiz.backToQuizzes')}
              </Button>
            </div>
          </div>
        </Card>

        <h2 className="font-display mt-10 text-lg font-bold text-slate-900 dark:text-slate-50">
          {t('quiz.reviewAnswers')}
        </h2>
        <div className="mt-4 space-y-4">
          {(review || []).map((item, index) => (
            <Card key={item.question_id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  <span className="text-slate-400">{index + 1}.</span> {item.question}
                </p>
                {item.is_correct ? (
                  <Badge tone="green">
                    <CircleCheck className="size-3.5" />
                    {t('quiz.correct')}
                  </Badge>
                ) : (
                  <Badge tone="red">
                    <XCircle className="size-3.5" />
                    {t('quiz.incorrect')}
                  </Badge>
                )}
              </div>

              <ul className="mt-4 space-y-2">
                {(item.answers || []).map((answer) => {
                  const isSelected = answer.id === item.selected_answer_id
                  const isCorrect = answer.is_correct
                  return (
                    <li
                      key={answer.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-600/40 dark:bg-emerald-600/10'
                          : isSelected
                            ? 'border-red-200 bg-red-50/70 dark:border-red-600/40 dark:bg-red-600/10'
                            : 'border-slate-100 dark:border-slate-700/60'
                      }`}
                    >
                      <span className="text-slate-700 dark:text-slate-200">{answer.text}</span>
                      <span className="flex items-center gap-2 text-xs">
                        {isSelected && (
                          <span className="text-slate-400 dark:text-slate-500">{t('quiz.yourAnswer')}</span>
                        )}
                        {isCorrect && <CircleCheck className="size-4 text-emerald-500" />}
                        {isSelected && !isCorrect && <XCircle className="size-4 text-red-500" />}
                      </span>
                    </li>
                  )
                })}
              </ul>

              {item.explanation && (
                <p className="mt-4 rounded-xl bg-primary-50/70 px-4 py-3 text-sm leading-relaxed text-primary-900 dark:bg-primary-600/10 dark:text-primary-200">
                  <span className="font-semibold">{t('quiz.explanation')} : </span>
                  {item.explanation}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return <Loader className="py-24" />
}

function QuizHistory({ quizId }) {
  const { t, i18n } = useTranslation()
  const { data: attempts } = useApi(() => quizService.attempts(quizId), [quizId])

  if (!attempts || attempts.length === 0) return null

  return (
    <Card className="mt-6 p-6">
      <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
        {t('quiz.attemptsHistory')}
      </h2>
      <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-700/60">
        {attempts.slice(0, 5).map((attempt) => (
          <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-300">
                {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'en' ? 'en-US' : 'fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(attempt.completed_at || attempt.created_at))}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {formatDuration(attempt.duration_seconds)}
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
    </Card>
  )
}
