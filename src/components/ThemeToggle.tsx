import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-olive-500 hover:text-olive-700 dark:text-olive-400 dark:hover:text-olive-200 bg-white dark:bg-olive-800 border border-beige-200 dark:border-olive-700 hover:shadow-md active:scale-[0.98] transition-all"
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}
