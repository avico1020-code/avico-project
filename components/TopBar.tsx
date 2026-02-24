import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { getTodayFormatted } from "@/lib/utils";
import { NewProjectTrigger } from "@/components/NewProjectTrigger";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors inline-flex items-center gap-2";

export function TopBar() {
  const today = getTodayFormatted();

  return (
    <header
      className="w-full flex justify-center items-center gap-4 pt-4 pb-4 px-4"
      style={{ backgroundColor: cream }}
    >
      <div className="flex flex-wrap gap-3 justify-center items-center">
        <span className="text-black font-bold text-xl shrink-0">{today}</span>
        <section
          className="flex flex-wrap gap-3 justify-center items-center"
          aria-label="פעולות מהירות"
        >
          <Link
            href="/"
            className="rounded-2xl border-2 border-black bg-transparent text-black font-medium p-2.5 hover:bg-black/5 transition-colors inline-flex items-center justify-center size-12 shrink-0"
            aria-label="דף הבית"
          >
            <HomeIcon className="size-6" aria-hidden />
          </Link>
          <Link href="/projects" className={btnClass}>
            כל הפרויקטים
          </Link>
          <Link href="/projects/watchlist" className={btnClass}>
            רשימת מעקב
          </Link>
          <NewProjectTrigger />
          <label className="sr-only" htmlFor="top-search">
            חיפוש
          </label>
          <input
            id="top-search"
            type="search"
            placeholder="חיפוש..."
            className="rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2.5 min-w-[140px] max-w-[200px] placeholder:text-black/60 focus:outline-none focus:ring-2 focus:ring-black/20"
            aria-label="חיפוש"
          />
        </section>
      </div>
    </header>
  );
}
