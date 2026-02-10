"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { apiFetch } from "@/lib/api";

type VoteRow = {
  username: string;
  candidate: string;
  votedAt: string;
};

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [form, setForm] = useState({
    name: "",
    photoUrl: "",
    gender: "",
    age: 18,
    description: "",
  });

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await apiFetch<{ message: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: adminPassword }),
      });
      setAuthenticated(true);
      setMessage("Admin authenticated.");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const submitCandidate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiFetch<{ message: string }>("/api/admin/candidates", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("Candidate created successfully.");
      setForm({ name: "", photoUrl: "", gender: "", age: 18, description: "" });
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const loadVotes = async () => {
    try {
      const list = await apiFetch<VoteRow[]>("/api/admin/votes", { method: "GET" });
      setVotes(list);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-14">
        <h1 className="text-4xl font-bold text-white">Admin Panel</h1>

        {!authenticated ? (
          <form onSubmit={handleAdminLogin} className="max-w-md space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-slate-300">Login with admin password to manage players and view votes.</p>
            <input
              type="password"
              placeholder="Admin password"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              required
            />
            <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-slate-950">Unlock panel</button>
          </form>
        ) : (
          <>
            <form onSubmit={submitCandidate} className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold">Create player card</h2>
              <input
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
                placeholder="Player name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
              <input
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
                placeholder="Photo URL"
                value={form.photoUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, photoUrl: event.target.value }))}
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
                  placeholder="Gender"
                  value={form.gender}
                  onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                  required
                />
                <input
                  className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
                  type="number"
                  min={10}
                  max={60}
                  value={form.age}
                  onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
                  required
                />
              </div>
              <textarea
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
                rows={4}
                placeholder="Description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                required
              />
              <button className="w-max rounded-lg bg-white px-4 py-2 font-semibold text-slate-950">Create card</button>
            </form>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Votes</h2>
                <button onClick={loadVotes} className="rounded-lg border border-white/20 px-4 py-2 text-sm">
                  Refresh votes
                </button>
              </div>
              {!votes.length ? (
                <p className="text-slate-400">No votes loaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {votes.map((vote, index) => (
                    <li key={`${vote.username}-${index}`} className="rounded-lg border border-white/10 px-4 py-3 text-sm">
                      <span className="font-semibold text-white">{vote.username}</span> voted for <span className="text-accent">{vote.candidate}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {message ? <p className="text-sm text-slate-200">{message}</p> : null}
      </section>
    </main>
  );
}
