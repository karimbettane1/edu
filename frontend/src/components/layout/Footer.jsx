import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, MessageCircle } from 'lucide-react'
import Logo from './Logo'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t('footer.about')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="mailto:contact@digital-academy.ma"
                aria-label={t('contact.emailLabel')}
                title={t('contact.emailLabel')}
                className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-primary-600/15 dark:hover:text-primary-400"
              >
                <Mail className="size-4" />
              </a>
              <Link
                to="/contact"
                aria-label={t('nav.contact')}
                title={t('nav.contact')}
                className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-primary-600/15 dark:hover:text-primary-400"
              >
                <MessageCircle className="size-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-slate-900 uppercase dark:text-slate-100">
              {t('footer.quickLinks')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { to: '/filieres', label: t('nav.filieres') },
                { to: '/ressources', label: t('nav.resources') },
                { to: '/quiz', label: t('nav.quizzes') },
                { to: '/projets', label: t('nav.projects') },
                { to: '/a-propos', label: t('nav.about') },
                { to: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-slate-900 uppercase dark:text-slate-100">
              {t('footer.filieresLinks')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/filieres/developpement-digital"
                  className="text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                >
                  {t('filieres.ddName')}
                </Link>
              </li>
              <li>
                <Link
                  to="/filieres/infrastructure-digitale"
                  className="text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                >
                  {t('filieres.idName')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-slate-900 uppercase dark:text-slate-100">
              {t('footer.followUs')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:contact@digital-academy.ma"
                  className="flex items-center gap-2 text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                >
                  <Mail className="size-4" />
                  contact@digital-academy.ma
                </a>
              </li>
              <li>
                <Link
                  to="/inscription"
                  className="text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                >
                  {t('home.ctaButton')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row dark:border-slate-700/60 dark:text-slate-500">
          <p>
            © {CURRENT_YEAR} {t('common.appName')} — {t('footer.rights')}
          </p>
          <p>{t('common.tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
