export default function Footer() {
  return (
    <footer id="contato" className="mt-16 border-t border-gray-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="font-semibold mb-2">Sorteio</h4>
          <p className="text-gray-600 dark:text-slate-400">
            Sorteador de números rápido e prático. Não use para fins legais ou jogos de azar.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Links</h4>
          <ul className="space-y-1">
            <li><a href="#gerador" className="hover:text-brand-500">Gerador</a></li>
            <li><a href="#como-funciona" className="hover:text-brand-500">Como funciona</a></li>
            <li><a href="#faq" className="hover:text-brand-500">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contato</h4>
          <p className="text-gray-600 dark:text-slate-400">
            Este é um projeto open-source educativo. Sugestões são bem-vindas.
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 dark:text-slate-500 pb-8">
        © {new Date().getFullYear()} <strong>S</strong> de Sorteio
      </div>
    </footer>
  )
}
