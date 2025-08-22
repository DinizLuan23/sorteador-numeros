import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof localStorage === 'undefined') return false
    const saved = localStorage.getItem('theme:dark')
    if (saved != null) return saved === '1'
    // Preferência do SO
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme:dark', '1')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme:dark', '0')
    }
  }, [dark])

  return (
    <button
      className="rounded-xl px-3 py-2 text-sm border border-gray-300/60 hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800"
      onClick={() => setDark(v => !v)}
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {dark ? '🌙 Escuro' : '☀️ Claro'}
    </button>
  )
}
