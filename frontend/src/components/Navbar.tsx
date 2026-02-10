import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          FutVote
        </Link>
        <div className="flex gap-3">
          <Link
            href="/vote"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-950 transition hover:scale-105"
          >
            Vote now
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-accent"
          >
            Admin panel
          </Link>
        </div>
      </nav>
    </header>
  );
}
