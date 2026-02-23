import Link from "next/link";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors inline-flex items-center gap-2";

export default function Home() {
  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: cream }}
    >
      <main className="container mx-auto max-w-4xl pt-12">
        <h1 className="text-4xl font-bold mb-2 text-black">
          מעקב פרויקטים במשרד
        </h1>
        <p className="text-lg text-black/80 mb-10">
          ניהול פרויקטים, רשימות מעקב, הערות, תזכורות ומשימות במקום אחד.
        </p>

        <section className="flex flex-col gap-4 mb-12">
          <h2 className="text-xl font-semibold text-black mb-2">פעולות מהירות</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className={btnClass}>
              כל הפרויקטים
            </Link>
            <Link href="/projects/watchlist" className={btnClass}>
              רשימת מעקב
            </Link>
            <Link href="/projects/new" className={btnClass}>
              פרויקט חדש
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/projects?tab=notes"
            className="rounded-2xl border-2 border-black p-5 text-black hover:bg-black/5 transition-colors block"
          >
            <h3 className="font-semibold text-lg mb-1">הערות</h3>
            <p className="text-black/70 text-sm">הערות לכל פרויקט במקום אחד</p>
          </Link>
          <Link
            href="/projects?tab=reminders"
            className="rounded-2xl border-2 border-black p-5 text-black hover:bg-black/5 transition-colors block"
          >
            <h3 className="font-semibold text-lg mb-1">תזכורות</h3>
            <p className="text-black/70 text-sm">תזכורות ומועדים לפרויקטים</p>
          </Link>
          <Link
            href="/projects?tab=tasks"
            className="rounded-2xl border-2 border-black p-5 text-black hover:bg-black/5 transition-colors block"
          >
            <h3 className="font-semibold text-lg mb-1">משימות</h3>
            <p className="text-black/70 text-sm">משימות ומעקב ביצוע</p>
          </Link>
          <Link
            href="/projects/watchlist"
            className="rounded-2xl border-2 border-black p-5 text-black hover:bg-black/5 transition-colors block"
          >
            <h3 className="font-semibold text-lg mb-1">רשימת מעקב</h3>
            <p className="text-black/70 text-sm">פרויקטים שאתה עוקב אחריהם</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
