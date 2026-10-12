import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ChartColumn, GraduationCap, Heart, Layers, ShieldCheck, Users } from 'lucide-react'
import Logo from '../components/layout/Logo'
import ThemeToggle from '../components/layout/ThemeToggle'
import LanguageSwitcher from '../components/layout/LanguageSwitcher'

const HIGHLIGHTS = [
  { icon: BookOpen, key: 'home.howStep1Title', descKey: 'home.howStep1Desc' },
  { icon: Layers, key: 'home.howStep2Title', descKey: 'home.howStep2Desc' },
  { icon: ChartColumn, key: 'home.howStep3Title', descKey: 'home.howStep3Desc' },
]

export default function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="gradient-brand relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div className="absolute -top-24 -end-24 size-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -start-16 size-80 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="size-5.5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">Digital Academy</span>
        </Link>

        <div className="relative">
          <h1 className="font-display max-w-md text-3xl leading-tight font-bold">
            {t('home.heroTitle')}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">{t('home.heroSubtitle')}</p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, key, descKey }) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{t(key)}</p>
                  <p className="text-xs leading-relaxed text-white/70">{t(descKey)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-4 text-xs text-white/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" /> {t('footer.rights')}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" /> {t('home.statStudents')}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="size-4" /> {t('common.appName')}
          </span>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between p-5 lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-md animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
