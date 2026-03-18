import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

/** Applies/removes the 'light' class on <html> whenever the theme store changes. */
export default function ThemeSync() {
  const { theme } = useThemeStore()
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])
  return null
}
