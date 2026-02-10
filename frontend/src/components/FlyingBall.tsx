"use client";

import { useEffect, useState } from "react";

export function FlyingBall() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(window.scrollY);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-10 h-16 w-16 rounded-full border-4 border-white/80 bg-gradient-to-br from-white to-slate-200 shadow-2xl"
      style={{
        transform: `translate(${Math.min(offset * 0.6, 900)}px, ${80 + offset * 0.35}px) rotate(${offset * 0.3}deg)`,
        transition: "transform 120ms linear",
      }}
    />
  );
}
