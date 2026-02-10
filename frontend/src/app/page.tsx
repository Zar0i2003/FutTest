import { CandidateCards, type Candidate } from "@/components/CandidateCards";
import { FlyingBall } from "@/components/FlyingBall";
import { Navbar } from "@/components/Navbar";
import { API_URL } from "@/lib/api";

async function getCandidates(): Promise<Candidate[]> {
  const response = await fetch(`${API_URL}/api/candidates`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export default async function HomePage() {
  const candidates = await getCandidates();

  return (
    <main>
      <Navbar />
      <FlyingBall />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex rounded-full border border-accent/50 px-4 py-1 text-sm text-accent">
            Football voting platform
          </span>
          <h1 className="text-5xl font-bold leading-tight text-white">Who is the best football player?</h1>
          <p className="text-lg leading-relaxed text-slate-300">
            Welcome to FutVote: a modern and minimal platform where fans choose their favorite football star.
            Scroll and enjoy the animated football, discover candidates, and cast your secure vote.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-6 pb-24">
        <h2 className="text-3xl font-semibold text-white">Candidates</h2>
        <CandidateCards candidates={candidates} />
      </section>
    </main>
  );
}
