import Image from "next/image";

export type Candidate = {
  id: number;
  name: string;
  photoUrl: string;
  gender: string;
  age: number;
  description: string;
};

export function CandidateCards({ candidates }: { candidates: Candidate[] }) {
  if (!candidates.length) {
    return <p className="text-slate-400">No candidates yet. Admin can add candidates from the panel.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <article
          key={candidate.id}
          className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-card transition hover:-translate-y-1"
        >
          <div className="relative h-56">
            <Image src={candidate.photoUrl} alt={candidate.name} fill className="object-cover" />
          </div>
          <div className="space-y-3 p-5">
            <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
            <p className="text-sm text-slate-300">
              {candidate.gender} • {candidate.age} years old
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{candidate.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
