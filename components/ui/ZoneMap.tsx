"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Zone } from "@/data/zones";

export interface ZoneProgress {
  done: number;
  total: number;
}

interface Props {
  zones: Zone[];
  unlockedZones: number[];
  progress: Record<number, ZoneProgress>;
  current: number;
  onSelect: (z: number) => void;
}

type ZoneState = "locked" | "unlocked" | "active" | "complete";

function zoneState(
  id: number,
  unlockedZones: number[],
  progress: Record<number, ZoneProgress>,
  current: number
): ZoneState {
  if (!unlockedZones.includes(id)) return "locked";
  const p = progress[id];
  if (p && p.total > 0 && p.done >= p.total) return "complete";
  if (id === current) return "active";
  return "unlocked";
}

const STATE_STYLES: Record<ZoneState, string> = {
  locked: "border-[#232a3a] text-[#8b93a7] opacity-45 cursor-not-allowed",
  unlocked: "border-[#232a3a] text-[#e6e9f0] hover:border-[#8b93a7]",
  active: "border-[#4ade80] text-[#4ade80]",
  complete: "border-[#232a3a] text-[#8b93a7] hover:border-[#4ade80]",
};

export default function ZoneMap({ zones, unlockedZones, progress, current, onSelect }: Props) {
  // Celebrate zones that unlock while the player is watching: a soft pulse,
  // no remount, no layout shift.
  const [celebrate, setCelebrate] = useState<number[]>([]);
  const prevUnlocked = useRef<number[]>(unlockedZones);
  useEffect(() => {
    const prev = prevUnlocked.current;
    prevUnlocked.current = unlockedZones;
    const fresh = unlockedZones.filter((z) => !prev.includes(z));
    if (fresh.length === 0) return;
    setCelebrate(fresh);
    const t = window.setTimeout(() => setCelebrate([]), 2000);
    return () => window.clearTimeout(t);
  }, [unlockedZones]);

  return (
    <nav aria-label="Zone map" className="min-w-0">
      <motion.ul
        className="flex items-stretch gap-2 overflow-x-auto pb-1"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        {zones.map((z) => {
          const st = zoneState(z.id, unlockedZones, progress, current);
          const p = progress[z.id];
          const locked = st === "locked";
          const num = String(z.id).padStart(2, "0");
          return (
            <motion.li
              key={z.id}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="shrink-0"
            >
              <motion.button
                type="button"
                disabled={locked}
                onClick={() => onSelect(z.id)}
                whileTap={locked ? undefined : { scale: 0.96 }}
                aria-label={`Zone ${z.id}: ${z.name}${
                  locked ? " (locked)" : p ? `, ${p.done} of ${p.total} cleared` : ""
                }`}
                aria-current={st === "active" ? "true" : undefined}
                title={locked ? "Locked. Clear the previous sector first." : z.tagline}
                className={`relative flex h-full min-w-[7.5rem] flex-col justify-between gap-1 rounded border bg-[#12161f] px-2.5 py-2 text-left transition-colors ${
                  STATE_STYLES[st]
                } ${celebrate.includes(z.id) ? "zone-unlock-celebrate" : ""}`}
              >
                {st === "active" && (
                  <motion.span
                    layoutId="zone-active-glow"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded bg-[#4ade80]/10"
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-widest">{num}</span>
                  {st === "complete" ? (
                    <span className="text-xs text-[#4ade80]" aria-hidden="true">
                      &#10003;
                    </span>
                  ) : locked ? (
                    <span className="text-[10px] tracking-widest">LOCK</span>
                  ) : (
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        st === "active" ? "bg-[#4ade80]" : "bg-[#8b93a7]"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="relative text-xs font-bold uppercase tracking-wide">
                  {z.name}
                </span>
                <span className="relative text-[10px] tracking-widest">
                  {locked ? "---" : p ? `${p.done}/${p.total}` : ""}
                </span>
              </motion.button>
            </motion.li>
          );
        })}
      </motion.ul>
    </nav>
  );
}
