import Link from "next/link";
import { ZONES } from "@/data/zones";
import { CHALLENGES } from "@/data/challenges";

export const metadata = {
  title: "How to play | NEXUS: Linux Quest",
  description: "What happened on NEXUS-9, and what the night shift expects from you.",
};

const STD_PER_ZONE =
  CHALLENGES.filter((c) => c.zone === 1 && !c.id.endsWith("-boss")).length || 19;

const RULES = [
  {
    title: "Sectors open in order",
    body: `There are eight sectors, each with ${STD_PER_ZONE} challenges plus a lockdown drill. Clear the drill to unlock the next sector. No skipping. The station likes its paperwork in order.`,
  },
  {
    title: "Hints cost 5 XP",
    body: "Every hint is a real command that solves the task, pasted straight from AXIOM's own notes. Revealing one costs 5 XP, charged the moment you look. Your XP can never go below zero, but a broke agent still has to type.",
  },
  {
    title: "Lockdown drills are timed",
    body: `Each sector ends with a lockdown drill, unlocked only after all ${STD_PER_ZONE} standard challenges are cleared. Beat it against the clock for a bonus achievement. If the timer runs out, the drill resets and you try again. No penalty, just pride.`,
  },
  {
    title: "Your work persists",
    body: "The filesystem remembers. Files you create in one challenge are still there in the next, and later challenges may build on them. Think before you rm.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0b0e14] text-[#e6e9f0]">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs tracking-[0.3em] text-[#4ade80]">NEXUS // FIELD MANUAL</p>
        <h1 className="mt-2 text-3xl font-bold">How to play</h1>

        <section className="mt-8 rounded border border-[#232a3a] bg-[#12161f] p-5">
          <h2 className="text-xs font-bold tracking-widest text-[#8b93a7]">THE SITUATION</h2>
          <p className="mt-3 text-sm leading-relaxed">
            At 03:12 station time, an intruder slipped through a misconfigured relay on
            NEXUS-9 and spent forty minutes rearranging the place. Logs are scattered,
            permissions are scrambled, rogue processes squat on the ports. Nothing was
            deleted, only moved, renamed, locked, or hidden.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            You are the junior agent on night shift. The senior crew is three hours out
            and the station must be clean before handover. Your terminal still answers.
            AXIOM, the station AI, has mapped the damage into eight sectors and briefs
            you one challenge at a time. Clear them, beat each sector&apos;s lockdown
            drill, and the morning handover is yours.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-bold tracking-widest text-[#8b93a7]">GROUND RULES</h2>
          <div className="mt-3 flex flex-col gap-3">
            {RULES.map((r) => (
              <div key={r.title} className="rounded border border-[#232a3a] bg-[#12161f] p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#fbbf24]">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#8b93a7]">{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-bold tracking-widest text-[#8b93a7]">THE EIGHT SECTORS</h2>
          <ol className="mt-3 flex flex-col gap-2">
            {ZONES.map((z) => (
              <li
                key={z.id}
                className="flex items-baseline gap-3 rounded border border-[#232a3a] bg-[#12161f] px-4 py-3"
              >
                <span className="font-mono text-xs font-bold text-[#4ade80]">
                  {String(z.id).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">{z.name}</p>
                  <p className="text-xs text-[#8b93a7]">{z.tagline}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded border border-[#4ade80] bg-[#12161f] p-5">
          <h2 className="text-xs font-bold tracking-widest text-[#4ade80]">GRADUATION</h2>
          <p className="mt-3 text-sm leading-relaxed">
            After the eighth drill falls, AXIOM drops the real news: the intruder left a
            locked black box buried in the station. Five flags, fifteen minutes, every
            skill you learned. Capture all five and your callsign goes on the station
            wall.
          </p>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block rounded border border-[#4ade80] px-8 py-3 text-sm font-bold tracking-widest text-[#4ade80] transition-colors hover:bg-[#4ade80] hover:text-[#0b0e14]"
          >
            BACK TO THE TERMINAL
          </Link>
        </div>
      </div>
    </main>
  );
}
