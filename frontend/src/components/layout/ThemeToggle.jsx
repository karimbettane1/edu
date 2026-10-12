import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const label = isDark ? t('common.lightMode') : t('common.darkMode')

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={`flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200 ${className}`}
    >
      {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  )
}
