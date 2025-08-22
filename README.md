# Sorteador de Números — React + Tailwind

Projeto de sorteio de números com layout completo (Header, Footer, seções, histórico) em React (Vite + TypeScript) e TailwindCSS.

## Como rodar
```bash
npm install
npm run dev
```

## Funcionalidades
- Quantidade, mínimo e máximo
- **Exclusões** (remova números do intervalo)
- **Seed opcional** para resultados reproduzíveis (não-criptográfico)
- **Sem repetição** (amostragem sem reposição)
- **Ordenação crescente**
- **Contagem regressiva** (3s)
- **Histórico** persistente (localStorage), **Exportar CSV**, **Limpar histórico**
- **Compartilhar** resultados (Web Share API quando disponível)
- **Tema claro/escuro** (toggle, salva preferência)

## Observações
- Este app não é voltado para uso legal ou jogos de azar.
- O PRNG não é criptograficamente seguro.
