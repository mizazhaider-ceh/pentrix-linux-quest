// Achievement definitions for NEXUS: Linux Quest.
// Ids and names are copied verbatim from GAME-DESIGN.md.

export interface Achievement {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-boot", name: "First Boot", description: "Complete your first challenge. The night shift begins." },
  { id: "cartographer", name: "Cartographer", description: "Clear every challenge in Zone 1, boss included. You are the map now." },
  { id: "archivist", name: "Archivist", description: "Clear every challenge in Zone 2, boss included. The logs hold no secrets from you." },
  { id: "word-surgeon", name: "Word Surgeon", description: "Clear every challenge in Zone 3, boss included. Noise in, signal out." },
  { id: "gatekeeper", name: "Gatekeeper", description: "Clear every challenge in Zone 4, boss included. Every lock re-keyed, every key accounted for." },
  { id: "exterminator", name: "Exterminator", description: "Clear every challenge in Zone 5, boss included. The squatters have been served." },
  { id: "signal-runner", name: "Signal Runner", description: "Clear every challenge in Zone 6, boss included. The station talks because of you." },
  { id: "all-seeing", name: "All-Seeing", description: "Clear every challenge in Zone 7, boss included. Disk, memory, kernel: all read at a glance." },
  { id: "reactor-chief", name: "Reactor Chief", description: "Clear every challenge in Zone 8, boss included. You command the shell now." },
  { id: "clean-sweep", name: "Clean Sweep", description: "Clear a full zone without revealing a single hint. No help needed, no help taken." },
  { id: "beat-the-clock", name: "Beat the Clock", description: "Defeat a boss drill with at least half the timer remaining. Fast and correct." },
  { id: "nexus-graduate", name: "Nexus Graduate", description: "Capture all 5 flags in the graduation CTF. Your callsign is on the station wall." },
];
