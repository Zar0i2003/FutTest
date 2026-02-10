"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import type { Candidate } from "@/components/CandidateCards";

type MeResponse = { authenticated: boolean; username?: string };

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiFetch<MeResponse>("/api/me", { method: "GET" });
        if (me.authenticated && me.username) {
          setCurrentUser(me.username);
        }
      } catch {
        // no-op
      }

      try {
        const list = await apiFetch<Candidate[]>("/api/candidates", { method: "GET" });
        setCandidates(list);
      } catch (error) {
        setMessage((error as Error).message);
      }
    };

    void load();
  }, []);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      if (isRegister) {
        await apiFetch<{ message: string }>("/api/register", {
          method: "POST",
          body: JSON.stringify({ username, password, confirmPassword }),
        });
      }
      const result = await apiFetch<{ username: string }>("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setCurrentUser(result.username);
      setPassword("");
      setConfirmPassword("");
      setMessage("Authentication successful. You can vote now.");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleVote = async () => {
    if (!selectedId) {
      setMessage("Please select a player first.");
      return;
    }

    try {
      const result = await apiFetch<{ message: string; candidate: string }>("/api/vote", {
        method: "POST",
        body: JSON.stringify({ candidateId: selectedId }),
      });
      setMessage(`${result.message} You voted for ${result.candidate}.`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14">
        <h1 className="text-4xl font-bold text-white">Vote for the best player</h1>

        {!currentUser ? (
          <form onSubmit={handleAuth} className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">{isRegister ? "Create account" : "Login"}</h2>
            <input
              className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <input
              className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {isRegister ? (
              <input
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            ) : null}
            <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-slate-950" type="submit">
              {isRegister ? "Register & login" : "Login"}
            </button>
            <button type="button" onClick={() => setIsRegister((prev) => !prev)} className="text-left text-sm text-accent">
              {isRegister ? "Already have account? Login" : "Need account? Register"}
            </button>
          </form>
        ) : (
          <p className="rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 text-accent">Logged in as {currentUser}</p>
        )}

        <div className="grid gap-3">
          {candidates.map((candidate) => (
            <label
              key={candidate.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4"
            >
              <input
                type="radio"
                name="candidate"
                value={candidate.id}
                checked={selectedId === candidate.id}
                onChange={() => setSelectedId(candidate.id)}
              />
              <div>
                <p className="font-semibold text-white">{candidate.name}</p>
                <p className="text-sm text-slate-300">{candidate.description}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleVote}
          disabled={!currentUser}
          className="w-max rounded-full bg-white px-6 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit vote
        </button>

        {message ? <p className="text-sm text-slate-200">{message}</p> : null}
      </section>
    </main>
  );
}
