// Achievement definitions for NEXUS: Linux Quest.
// The first 12 ids and names are copied verbatim from GAME-DESIGN.md.
// The v2 block after them adds progression-system achievements (lessons,
// streaks, command mastery, quizzes, flawless boss drills).

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
  { id: "orientation", name: "Orientation", description: "View your first lesson. Reading the briefing counts as work." },
  { id: "chapter-scholar", name: "Chapter Scholar", description: "View every lesson in a single chapter. Thorough. AXIOM approves." },
  { id: "valedictorian", name: "Valedictorian", description: "View all 61 lessons. You now know things the senior crew forgot." },
  { id: "on-fire", name: "On Fire", description: "Solve 3 challenges in a row. The terminal is warming up." },
  { id: "unstoppable", name: "Unstoppable", description: "Solve 5 challenges in a row. AXIOM is checking your pulse. It is fine." },
  { id: "relentless", name: "Relentless", description: "Solve 8 challenges in a row. The streak has its own gravity now." },
  { id: "second-nature", name: "Second Nature", description: "Master your first command. Three clean solves. It lives in your fingers now." },
  { id: "muscle-memory", name: "Muscle Memory", description: "Master 10 commands. Your hands file the paperwork before your brain wakes up." },
  { id: "autopilot", name: "Autopilot", description: "Master 25 commands. You type them in your sleep. AXIOM has logs." },
  { id: "flawless-drill", name: "Flawless Drill", description: "Clear a boss drill with zero hints used in its zone. Nerves of steel, hands of code." },
  { id: "rtfm", name: "RTFM", description: "Use the man command. The manual was right there the whole time." },
  { id: "top-of-the-class", name: "Top of the Class", description: "Ace a quiz with a perfect 4/4. The bell curve fears you." },
  { id: "deans-list", name: "Dean's List", description: "Ace 3 quizzes. Your name is on a list now. A good list." },
  { id: "promoted", name: "Promoted", description: "Reach the Operator rank. The coffee is still terrible, but the title is real." },
  { id: "persistent", name: "Persistent", description: "Claim 20 hints. No shame in it. Even AXIOM reads the manual sometimes." },
  { id: "marathon", name: "Marathon", description: "Complete 50 challenges. Halfway to legend is still a long way from the start." },
  { id: "centurion", name: "Centurion", description: "Complete 100 challenges. Triple digits. The station log is mostly your name now." },
  { id: "completionist", name: "Completionist", description: "Clear every challenge in all 8 zones, bosses included. Nothing left uncleared." },
  { id: "triple-clean", name: "Triple Clean", description: "Clear 3 full zones without revealing a single hint. Raw skill, three times over." },
  { id: "drill-sergeant", name: "Drill Sergeant", description: "Beat 4 boss drills with at least half the timer remaining. You run the drills now." },
  { id: "drill-master", name: "Drill Master", description: "Beat all 8 boss drills with at least half the timer remaining. The clock fears you." },
  { id: "juggernaut", name: "Juggernaut", description: "Solve 15 challenges in a row. Nothing stops this. Nothing." },
  { id: "untouchable", name: "Untouchable", description: "Solve 25 challenges in a row. AXIOM has stopped suggesting hints entirely." },
  { id: "quiz-master", name: "Quiz Master", description: "Ace 5 chapter quizzes with a perfect 4/4. The bell curve has filed a complaint." },
  { id: "flawless-commander", name: "Flawless Commander", description: "Clear all 8 boss drills with zero hints used in their zones. Perfect record." },
  { id: "ghost-protocol", name: "Ghost Protocol", description: "Reach the Ghost rank. You were never here. The logs disagree." },
  { id: "living-legend", name: "Living Legend", description: "Reach the Nexus Legend rank. They will tell stories about this shift." },
  { id: "mythic", name: "Mythic", description: "Reach the Mythic rank. Beyond legend. The station named a corridor after you." },
];
