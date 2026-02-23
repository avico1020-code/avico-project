import Link from "next/link";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors inline-flex items-center gap-2";

function getTodayFormatted(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function Home() {
  const today = getTodayFormatted();

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: cream }}
    >
      <header
        className="w-full flex items-center gap-4 pt-4 pb-4 px-4"
        style={{ backgroundColor: cream }}
      >
        <div className="flex-1 min-w-0" aria-hidden />
        <h1 className="text-4xl font-bold text-black flex-1 text-center shrink-0">
          Dashboard
        </h1>
        <div className="flex-1 flex justify-start min-w-0">
          <span className="text-black font-bold text-xl">{today}</span>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl pt-8 mr-[calc(30vw+1rem)]">
        <section className="flex flex-wrap gap-3 mb-12 justify-center">
          <Link href="/projects" className={btnClass}>
            כל הפרויקטים
          </Link>
          <Link href="/projects/watchlist" className={btnClass}>
            רשימת מעקב
          </Link>
          <Link href="/projects/new" className={btnClass}>
            פרויקט חדש
          </Link>
        </section>
      </main>

      <aside
        className="fixed right-4 top-44 bottom-4 w-[30vw] min-w-[220px] max-w-[380px] rounded-2xl border-2 border-black p-5 flex flex-col overflow-hidden"
        style={{ backgroundColor: cream }}
        aria-label="פרויקטים פתוחים"
      >
        <h2 className="text-xl font-semibold text-black mb-4 text-center shrink-0">
          פרויקטים פתוחים
        </h2>
      </aside>
    </div>
  );
}
