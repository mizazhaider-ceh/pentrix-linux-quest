import dynamic from "next/dynamic";

// GameFlow mounts xterm.js (via TerminalGame), which needs the DOM; keep it client-only.
const GameFlow = dynamic(() => import("@/components/GameFlow"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0e14]">
      <p className="text-sm tracking-widest text-[#8b93a7]">
        INITIALIZING NEXUS<span className="nexus-cursor">_</span>
      </p>
    </main>
  ),
});

export default function Home() {
  return <GameFlow />;
}
