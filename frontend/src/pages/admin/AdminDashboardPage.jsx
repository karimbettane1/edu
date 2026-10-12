import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CircleCheck,
  Download,
  Eye,
  FileText,
  Flag,
  GraduationCap,
  MessageSquare,
  ScrollText,
  Users,
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { adminService } from '../../services/adminService'
import PageHeader from '../../components/dashboard/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ResourceStatusBadge from '../../components/dashboard/ResourceStatusBadge'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { successToast, errorToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { formatDate, formatNumber, timeAgo } from '../../utils/format'
import { resourceTypeLabel, STATUS_TONES } from '../../utils/resourceMeta'

const CHART_COLORS = ['#2563eb', '#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444']

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation()
  const { data, loading, error, reload } = useApi(() => adminService.dashboard(), [])
  const [approvingId, setApprovingId] = useState(null)

  const stats = data?.stats
  const charts = data?.charts
  const latest = data?.latest

  const toSeries = (record) =>
    Object.entries(record || {}).map(([name, value]) => ({
      name: String(name).split(' ')[0] + ' ' + String(name).split(' ')[1],
      value: Number(value),
    }))

  const registrations = toSeries(charts?.registrations_by_month)
  const downloads = toSeries(charts?.downloads_by_month)
  const byFiliere = Object.entries(charts?.resources_by_filiere || {}).map(([name, value]) => ({
    name,
    value: Number(value),
  }))
  const byType = Object.entries(charts?.resources_by_type || {}).map(([type, value]) => ({
    name: resourceTypeLabel(type, t),
    value: Number(value),
  }))

  const handleApprove = async (resource) => {
    setApprovingId(resource.id)
    try {
      const formData = new FormData()
      formData.append('status', 'published')
      const result = await adminService.updateResource(resource.id, formData)
      successToast(result.message || t('admin.resourceApproved'))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setApprovingId(null)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title={t('admin.dashboardTitle')} description={t('admin.dashboardSubtitle')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader title={t('admin.dashboardTitle')} description={t('admin.dashboardSubtitle')} />
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={t('admin.dashboardTitle')} description={t('admin.dashboardSubtitle')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label={t('admin.totalUsers')}
          value={formatNumber(stats?.users_count, i18n.language)}
          tone="primary"
          hint={t('admin.studentsContributors', { students: stats?.students_count ?? 0, contributors: stats?.contributors_count ?? 0 })}
        />
        <StatCard
          icon={FileText}
          label={t('admin.totalResources')}
          value={formatNumber(stats?.resources_count, i18n.language)}
          tone="secondary"
          hint={t('admin.publishedHint', { count: stats?.published_resources_count ?? 0 })}
        />
        <StatCard
          icon={Download}
          label={t('admin.totalDownloads')}
          value={formatNumber(stats?.downloads_total, i18n.language)}
          tone="green"
          hint={t('admin.viewsHint', { count: formatNumber(stats?.views_total, i18n.language) })}
        />
        <StatCard
          icon={CircleCheck}
          label={t('common.pendingReview')}
          value={stats?.pending_resources_count ?? 0}
          tone="amber"
          hint={t('admin.draftHint', { count: stats?.draft_resources_count ?? 0 })}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GraduationCap} label={t('admin.totalQuizzes')} value={stats?.quizzes_count ?? 0} tone="sky" />
        <StatCard icon={Eye} label={t('admin.totalProjects')} value={stats?.projects_count ?? 0} tone="primary" />
        <StatCard
          icon={Flag}
          label={t('admin.reports')}
          value={stats?.pending_reports_count ?? 0}
          tone="red"
          hint={t('admin.pendingHint')}
        />
        <StatCard
          icon={MessageSquare}
          label={t('comments.title')}
          value={stats?.pending_comments_count ?? 0}
          tone="amber"
          hint={t('admin.pendingHint')}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display mb-4 text-base font-semibold text-slate-900 dark:text-slate-50">
            {t('admin.registrationsChart')}
          </h2>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrations} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.3)', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={t('admin.registrationsChart')}
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#regGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display mb-4 text-base font-semibold text-slate-900 dark:text-slate-50">
            {t('admin.downloadsChart')}
          </h2>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downloads} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.3)', fontSize: 12 }}
                />
                <Bar dataKey="value" name={t('admin.downloadsChart')} fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display mb-4 text-base font-semibold text-slate-900 dark:text-slate-50">
            {t('admin.byFiliere')}
          </h2>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byFiliere}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {byFiliere.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.3)', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display mb-4 text-base font-semibold text-slate-900 dark:text-slate-50">
            {t('admin.byType')}
          </h2>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.3)', fontSize: 12 }}
                />
                <Bar dataKey="value" name={t('admin.byType')} fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {t('admin.pendingValidations')}
            </h2>
            <Link to="/admin/ressources?status=pending_review" className="link text-sm font-medium">
              {t('common.viewAll')}
            </Link>
          </div>

          {!latest?.pending_resources?.length ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('admin.noPendingResources')}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {latest.pending_resources.map((resource) => (
                <li key={resource.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {resource.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {resource.author?.name}
                      {resource.filiere?.code && ` · ${resource.filiere.code}`}
                      {' · '}
                      {formatDate(resource.created_at, i18n.language)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={CircleCheck}
                    loading={approvingId === resource.id}
                    onClick={() => handleApprove(resource)}
                  >
                    {t('admin.approve')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {t('admin.latestReports')}
            </h2>
            <Link to="/admin/signalements" className="link text-sm font-medium">
              {t('common.viewAll')}
            </Link>
          </div>

          {!latest?.reports?.length ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('admin.noReports')}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {latest.reports.map((report) => (
                <li key={report.id} className="py-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{report.reason}</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {report.user?.name}
                    {report.resource?.title && ` · ${report.resource.title}`}
                    {' · '}
                    {timeAgo(report.created_at, i18n.language)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {t('admin.latestResources')}
            </h2>
            <Link to="/admin/ressources" className="link text-sm font-medium">
              {t('common.viewAll')}
            </Link>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {(latest?.resources?.data ?? latest?.resources ?? []).map((resource) => (
              <li key={resource.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{resource.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {resource.author?.name} · {formatDate(resource.created_at, i18n.language)}
                  </p>
                </div>
                <ResourceStatusBadge status={resource.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
              <ScrollText className="size-4.5" />
              {t('admin.recentActivity')}
            </h2>
            <Link to="/admin/journal" className="link text-sm font-medium">
              {t('common.viewAll')}
            </Link>
          </div>

          <ul className="space-y-2.5">
            {(latest?.audit_logs?.data ?? latest?.audit_logs ?? []).map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <Badge tone={STATUS_TONES[log.action?.split('.')[0]] || 'slate'} className="mt-0.5 shrink-0">
                  {log.action}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-700 dark:text-slate-200">{log.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {log.user?.name || t('admin.system')} · {timeAgo(log.created_at, i18n.language)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
