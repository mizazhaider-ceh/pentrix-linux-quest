import dynamic from "next/dynamic";

// TerminalGame mounts xterm.js, which needs the DOM; keep it client-only.
const TerminalGame = dynamic(() => import("@/components/TerminalGame"), {
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
  return <TerminalGame />;
}
