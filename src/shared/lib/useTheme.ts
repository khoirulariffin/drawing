import { ref, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

// Shared state
const isDark = ref(false)

export const useTheme = () => {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Initialize theme if not already set
  if (typeof window !== 'undefined' && !document.documentElement.dataset.themeInitialized) {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      isDark.value = true
    } else {
      isDark.value = false
    }
    applyTheme()
    document.documentElement.dataset.themeInitialized = 'true'
  }

  return {
    isDark,
    toggleTheme,
  }
}
