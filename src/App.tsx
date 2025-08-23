import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toggle from "./components/Toggle";
import { mulberry32, xmur3 } from "./rng";

type DrawOptions = {
   count: number;
   min: number;
   max: number;
   unique: boolean;
   sortAsc: boolean;
   exclude: Set<number>;
   seed?: string | null;
};

type HistoryItem = {
   at: number;
   params: Omit<DrawOptions, "exclude"> & { exclude: number[] };
   results: number[];
};

function drawNumbers({
   count,
   min,
   max,
   unique,
   sortAsc,
   exclude,
   seed,
}: DrawOptions) {
   if (min > max) throw new Error("O mínimo não pode ser maior que o máximo.");
   const range = max - min + 1;
   if (count <= 0) throw new Error("A quantidade deve ser maior que 0.");

   // Cria gerador aleatório (seed opcional)
   let rand = Math.random;
   if (seed && seed.trim()) {
      const seedFn = xmur3(seed.trim());
      rand = mulberry32(seedFn());
   }

   const pool: number[] = [];
   for (let v = min; v <= max; v++) {
      if (!exclude.has(v)) pool.push(v);
   }
   if (pool.length === 0)
      throw new Error("Intervalo esgotado pelos números excluídos.");
   if (unique && count > pool.length)
      throw new Error(
         "Quantidade maior que o intervalo disponível sem repetição."
      );

   const out: number[] = [];
   if (unique) {
      // Fisher–Yates com exclusões já aplicadas
      for (let i = 0; i < count; i++) {
         const j = Math.floor(rand() * (pool.length - i)) + i;
         [pool[i], pool[j]] = [pool[j], pool[i]];
         out.push(pool[i]);
      }
   } else {
      for (let i = 0; i < count; i++) {
         const j = Math.floor(rand() * pool.length);
         out.push(pool[j]);
      }
   }
   if (sortAsc) out.sort((a, b) => a - b);
   return out;
}

function toCSV(items: HistoryItem[]) {
   const header =
      "data,quantidade,min,max,unico,ordenado,excluir,seed,resultado\n";
   const rows = items
      .map((i) => {
         const d = new Date(i.at).toISOString();
         const excl = i.params.exclude.join(" ");
         return [
            d,
            i.params.count,
            i.params.min,
            i.params.max,
            i.params.unique,
            i.params.sortAsc,
            excl,
            i.params.seed ?? "",
            i.results.join(" "),
         ].join(",");
      })
      .join("\n");
   return header + rows;
}

export default function App() {
   const [count, setCount] = useState(6);
   const [min, setMin] = useState(1);
   const [max, setMax] = useState(60);
   const [min2, setMin2] = useState(null);
   const [max2, setMax2] = useState(null);
   const [unique, setUnique] = useState(true);
   const [sortAsc, setSortAsc] = useState(true);
   const [countdown, setCountdown] = useState(false);
   const [countCountDown, setCountCountDown] = useState(0);
   const [excludeInput, setExcludeInput] = useState("");
   const [seed, setSeed] = useState<string>("");
   const [loading, setLoading] = useState(false);
   const [cdLeft, setCdLeft] = useState(3);
   const [results, setResults] = useState<number[]>([]);
   const [error, setError] = useState<string | null>(null);
   const [history, setHistory] = useState<HistoryItem[]>(() => {
      try {
         const raw = localStorage.getItem("sorteio:history");
         return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
      } catch {
         return [];
      }
   });

   const timer = useRef<number | null>(null);

   useEffect(() => {
      localStorage.setItem(
         "sorteio:history",
         JSON.stringify(history.slice(0, 100))
      );
   }, [history]);

   function reset() {
      setResults([]);
      setError(null);
      setLoading(false);
      setCdLeft(3);
      if (timer.current) {
         window.clearInterval(timer.current);
         timer.current = null;
      }
   }

   function parseExclude(): Set<number> {
      const s = new Set<number>();
      const parts = excludeInput
         .split(/[\s,;]+/)
         .map((p) => p.trim())
         .filter(Boolean);
      for (const p of parts) {
         const n = Number(p);
         if (!Number.isNaN(n)) s.add(n);
      }
      return s;
   }

   async function handleDraw() {
      try {
         setError(null);
         setResults([]);

         if (countdown) {
            setLoading(true);
            setCdLeft(3);
            timer.current = window.setInterval(() => {
               setCdLeft((prev) => {
                  if (prev <= 1) {
                     if (timer.current) {
                        window.clearInterval(timer.current);
                        timer.current = null;
                     }
                  }
                  return prev - 1;
               });
            }, 1000);
            await new Promise((res) => setTimeout(res, 3000));
         }

         const exclude = parseExclude();

         let auxMin = min2 && count == 1 ? min2 : min;
         let auxMax = max2 && count == 1 ? max2 : max;

         const nums = drawNumbers({
            count,
            min: auxMin,
            max: auxMax,
            unique,
            sortAsc,
            exclude,
            seed: seed || null,
         });
         setResults(nums);

         const item: HistoryItem = {
            at: Date.now(),
            params: {
               count,
               min,
               max,
               unique,
               sortAsc,
               exclude: Array.from(exclude),
               seed: seed || null,
            },
            results: nums,
         };
         setHistory((h) => [item, ...h].slice(0, 50));
      } catch (e: any) {
         setError(e?.message || "Erro ao sortear.");
      } finally {
         setLoading(false);
      }
   }

   function copyToClipboard() {
      const text = results.join(", ");
      navigator.clipboard?.writeText(text).catch(() => {});
   }

   function shareResults() {
      const text = `Resultados do sorteio: ${results.join(
         ", "
      )} (entre ${min} e ${max}, ${
         unique ? "sem repetição" : "com repetição"
      })`;
      if (navigator.share) {
         navigator.share({ title: "Sorteio", text }).catch(() => {});
      } else {
         copyToClipboard();
         alert("Resultados copiados!");
      }
   }

   function clearHistory() {
      setHistory([]);
   }

   function downloadCSV() {
      const csv = toCSV(history);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "historico_sorteios.csv";
      a.click();
      URL.revokeObjectURL(url);
   }

   const headerHero = useMemo(
      () => (
         <section
            className="py-10 md:py-14 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900"
            id="gerador"
         >
            <div className="max-w-6xl mx-auto px-4 text-center">
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  Sorteador de números
               </h1>
               <p className="text-gray-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
                  Defina quantidade e intervalo. Personalize com exclusões, modo
                  sem repetição, ordenação e contagem regressiva.
               </p>
            </div>
         </section>
      ),
      []
   );

   return (
      <div className="min-h-full">
         <Header history={history} setMin2={setMin2} setMax2={setMax2} />

         {headerHero}

         <main className="max-w-6xl mx-auto px-4 pb-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="card p-6 bg-white dark:bg-slate-950 dark:border-slate-800 shadow-soft">
                  <div className="grid sm:grid-cols-3 gap-4">
                     <div>
                        <label className="label">Quantidade</label>
                        <input
                           className="input"
                           type="number"
                           min={1}
                           value={count}
                           onChange={(e) =>
                              setCount(Math.max(0, Number(e.target.value)))
                           }
                           placeholder="QTD"
                        />
                     </div>
                     <div>
                        <label className="label">Número entre (mínimo)</label>
                        <input
                           className="input"
                           type="number"
                           value={min}
                           onChange={(e) => setMin(Number(e.target.value))}
                           placeholder="Mínimo"
                        />
                     </div>
                     <div>
                        <label className="label">e (máximo)</label>
                        <input
                           className="input"
                           type="number"
                           value={max}
                           onChange={(e) => setMax(Number(e.target.value))}
                           placeholder="Máximo"
                        />
                     </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                     <div>
                        <label className="label">
                           Excluir números (separados por vírgula ou espaço)
                        </label>
                        <input
                           className="input"
                           type="text"
                           value={excludeInput}
                           onChange={(e) => setExcludeInput(e.target.value)}
                           placeholder="Ex.: 7, 13, 42"
                        />
                     </div>
                     <div>
                        <label className="label">
                           Seed (opcional, para resultados reproduzíveis)
                        </label>
                        <input
                           className="input"
                           type="text"
                           value={seed}
                           onChange={(e) => setSeed(e.target.value)}
                           placeholder="Ex.: meu-seed-123"
                        />
                     </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                     <Toggle
                        checked={countdown}
                        onChange={(v) => {
                           setCountdown(!countdown);
                           if (v) setCountCountDown(countCountDown + 1);
                        }}
                        label="Animação contagem regressiva"
                     />
                     <Toggle
                        checked={unique}
                        onChange={setUnique}
                        label="Não repetir número"
                     />
                     <Toggle
                        checked={sortAsc}
                        onChange={setSortAsc}
                        label="Ordenar números em ordem crescente"
                     />
                  </div>

                  {error && (
                     <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-red-700 dark:text-red-300 text-sm">
                        {error}
                     </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                     <button
                        onClick={handleDraw}
                        className="btn-primary disabled:opacity-60"
                        disabled={loading}
                     >
                        {loading && countdown
                           ? `Sorteando em ${cdLeft}s...`
                           : "Sortear"}
                     </button>
                     <button onClick={reset} className="btn-ghost">
                        Limpar
                     </button>
                     <button
                        onClick={shareResults}
                        className="btn-ghost"
                        disabled={results.length === 0}
                     >
                        Compartilhar
                     </button>
                  </div>
               </div>

               <div className="card p-6 bg-white dark:bg-slate-950 dark:border-slate-800">
                  <h2 className="text-lg font-semibold">Resultados</h2>
                  {results.length === 0 ? (
                     <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                        Nada por aqui ainda. Faça um sorteio!
                     </p>
                  ) : (
                     <>
                        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                           {results.map((n, idx) => (
                              <li
                                 key={idx}
                                 className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-3 text-center text-xl font-semibold"
                              >
                                 {n}
                              </li>
                           ))}
                        </ul>
                        <div className="mt-4 flex gap-3">
                           <button
                              onClick={() =>
                                 navigator.clipboard.writeText(
                                    results.join(", ")
                                 )
                              }
                              className="btn-ghost"
                           >
                              Copiar resultados
                           </button>
                        </div>
                     </>
                  )}
               </div>
            </div>

            <aside className="space-y-6">
               <div className="card p-6 bg-white dark:bg-slate-950 dark:border-slate-800">
                  <h3 className="font-semibold">Histórico</h3>
                  {history.length === 0 ? (
                     <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                        Sem sorteios ainda.
                     </p>
                  ) : (
                     <ul className="mt-3 space-y-3 max-h-[420px] overflow-auto pr-1">
                        {history.map((h, i) => (
                           <li
                              key={i}
                              className="text-sm rounded-xl border border-gray-200 dark:border-slate-800 p-3"
                           >
                              <div className="flex items-center justify-between">
                                 <span className="text-gray-500 dark:text-slate-400">
                                    {new Date(h.at).toLocaleString()}
                                 </span>
                                 <button
                                    className="text-xs text-brand-600 hover:underline"
                                    onClick={() =>
                                       navigator.clipboard.writeText(
                                          h.results.join(", ")
                                       )
                                    }
                                 >
                                    Copiar
                                 </button>
                              </div>
                              <div className="mt-1">
                                 Resultado:{" "}
                                 <strong>{h.results.join(", ")}</strong>
                              </div>
                              <div className="mt-1 text-gray-600 dark:text-slate-400">
                                 {h.params.count} nºs, {h.params.min}–
                                 {h.params.max},{" "}
                                 {h.params.unique
                                    ? "sem repetição"
                                    : "com repetição"}
                                 {h.params.sortAsc ? ", ordenado" : ""}
                                 {h.params.exclude.length
                                    ? `, excl.: ${h.params.exclude.join(" ")}`
                                    : ""}
                                 {h.params.seed
                                    ? `, seed: ${h.params.seed}`
                                    : ""}
                              </div>
                           </li>
                        ))}
                     </ul>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                     <button onClick={downloadCSV} className="btn-ghost">
                        Exportar CSV
                     </button>
                     <button onClick={clearHistory} className="btn-ghost">
                        Limpar histórico
                     </button>
                  </div>
               </div>

               <div
                  className="card p-6 bg-white dark:bg-slate-950 dark:border-slate-800"
                  id="como-funciona"
               >
                  <h3 className="font-semibold">Como funciona</h3>
                  <ol className="text-sm text-gray-700 dark:text-slate-300 mt-2 list-decimal pl-4 space-y-1">
                     <li>
                        Escolha a quantidade de números e o intervalo (mín e
                        máx).
                     </li>
                     <li>
                        Ative <em>Não repetir</em> para amostragem sem
                        reposição.
                     </li>
                     <li>Use exclusões para remover valores específicos.</li>
                     <li>
                        Opcional: informe uma <em>seed</em> para reproduzir o
                        mesmo sorteio.
                     </li>
                     <li>
                        Clique em <strong>Sortear</strong>.
                     </li>
                  </ol>
               </div>

               <div
                  className="card p-6 bg-white dark:bg-slate-950 dark:border-slate-800"
                  id="faq"
               >
                  <h3 className="font-semibold">FAQ</h3>
                  <div className="mt-2 space-y-3 text-sm">
                     <div>
                        <p className="font-medium">
                           É criptograficamente seguro?
                        </p>
                        <p className="text-gray-600 dark:text-slate-400">
                           Não. Usa gerador pseudo-aleatório padrão do navegador
                           ou um PRNG simples quando seed é informada. Não
                           utilizar para fins legais.
                        </p>
                     </div>
                     <div>
                        <p className="font-medium">
                           Posso reproduzir um resultado?
                        </p>
                        <p className="text-gray-600 dark:text-slate-400">
                           Sim, informe a mesma seed, parâmetros e exclusões
                           para obter o mesmo conjunto.
                        </p>
                     </div>
                     <div>
                        <p className="font-medium">
                           Os resultados ficam salvos?
                        </p>
                        <p className="text-gray-600 dark:text-slate-400">
                           Sim, localmente no seu navegador (localStorage). Você
                           pode exportar em CSV.
                        </p>
                     </div>
                  </div>
               </div>
            </aside>
         </main>

         <Footer />
      </div>
   );
}
