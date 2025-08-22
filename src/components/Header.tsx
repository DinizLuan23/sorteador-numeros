import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-gray-200 dark:bg-slate-900/60 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-bold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white">S</span>
          <span>Sorteio</span>
        </a>
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <a href="#gerador" className="hover:text-brand-500">Gerador</a>
          <a href="#como-funciona" className="hover:text-brand-500">Como funciona</a>
          <a href="#faq" className="hover:text-brand-500">FAQ</a>
          <a href="#contato" className="hover:text-brand-500">Contato</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="https://github.com/"
            target="_blank"
            className="rounded-xl px-3 py-2 text-sm bg-brand-500 text-white hover:bg-brand-600"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}
