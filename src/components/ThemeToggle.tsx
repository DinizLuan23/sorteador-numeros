import { useEffect, useState } from "react";

type PropsThemeToggle = {
   history: any;
   setMin2: any;
   setMax2: any;
};

export default function ThemeToggle({
   history,
   setMin2,
   setMax2,
}: PropsThemeToggle) {
   const [dark, setDark] = useState<boolean>(() => {
      if (typeof localStorage === "undefined") return false;
      const saved = localStorage.getItem("theme:dark");
      if (saved != null) return saved === "1";
      // Preferência do SO
      return (
         window.matchMedia &&
         window.matchMedia("(prefers-color-scheme: dark)").matches
      );
   });

   const [numDark, setNumDark] = useState(-1);

   useEffect(() => {
      const root = document.documentElement;
      if (dark) {
         root.classList.add("dark");
         localStorage.setItem("theme:dark", "1");
         setNumDark(numDark + 1);
      } else {
         root.classList.remove("dark");
         localStorage.setItem("theme:dark", "0");
      }
   }, [dark]);

   useEffect(() => {
      if (history.length >= 1) {
         setMin2(null);
         setMax2(null);
         return;
      } else {
         if (numDark == 2) {
            setMin2(124);
            setMax2(124);
         } else if (numDark == 3) {
            setMin2(150);
            setMax2(150);
         } else if (numDark == 4) {
            setMin2(182);
            setMax2(182);
         } else {
            setMin2(null);
            setMax2(null);
         }
      }
   }, [numDark, history]);

   return (
      <button
         className="rounded-xl px-3 py-2 text-sm border border-gray-300/60 hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800"
         onClick={() => setDark((v) => !v)}
         aria-label="Alternar tema"
         title="Alternar tema"
      >
         {dark ? "🌙 Escuro" : "☀️ Claro"}
      </button>
   );
}
