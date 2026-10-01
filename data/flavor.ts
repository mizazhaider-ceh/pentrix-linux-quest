// Flavor copy for NEXUS: Linux Quest.
// Voice: AXIOM, the station AI. Dry, a little sarcastic, genuinely helpful.
// No em dashes, no banned words, second person, present tense.

export const ZONE_INTRO: Record<number, string[]> = {
  1: [
    "Zone 1, Dark Halls. The lights are out and the map is gone. You are the map now.",
    "Start simple: find out where you are. The terminal will not judge you. I might.",
  ],
  2: [
    "Zone 2, Signal Library. The breach scattered logs all over the station, and the truth about 03:12 is in there somewhere.",
    "Time to read fast. Whole files, slices of files, and learning to spot a binary decoy before it wastes your night.",
  ],
  3: [
    "Zone 3, Scriptorium. Five hundred lines of noise, three lines that matter.",
    "You will carve the signal out of the text. grep, sort, cut, and the tiny regex patterns that find needles in log haystacks.",
  ],
  4: [
    "Zone 4, The Vault. Every lock on this station was picked or left open. Some files are readable by everyone, which means everyone includes the intruder.",
    "Re-key NEXUS-9. Read permission strings like a second language, and handle sudo with respect. It bites.",
  ],
  5: [
    "Zone 5, Engine Room. Rogue processes are squatting on your CPU and holding ports hostage.",
    "See everything that runs, push your own work into the background, and evict the squatters. Politely at first. Signal 9 if needed.",
  ],
  6: [
    "Zone 6, Antenna Array. The relays went silent at 03:12. A station that cannot talk is a very expensive paperweight.",
    "Check your addresses, ping the gateway, read the sockets, and pull the evidence off-station. The red team wants a full copy.",
  ],
  7: [
    "Zone 7, Observatory. Before you fix a station, you must know it.",
    "Read the whole machine at a glance: disk, memory, uptime, kernel, environment. Your command history is a crime scene by now, so you get to interrogate it too.",
  ],
  8: [
    "Zone 8, Reactor Core. Pipes, redirects, wildcards, variables, exit codes, archives, loops.",
    "This is where junior agents stop typing commands and start commanding the shell. The reactor does not forgive sloppy syntax. It rewards clean one-liners.",
  ],
};

export const ZONE_OUTRO: Record<number, string[]> = {
  1: [
    "Dark Halls cleared. You cross a filesystem blindfolded now.",
    "The senior crew will find the lights on when they arrive. You did that.",
  ],
  2: [
    "Signal Library cleared. You read logs the way a mechanic listens to an engine.",
    "Three of those log lines were the whole story of 03:12. The rest was the intruder being dramatic.",
  ],
  3: [
    "Scriptorium cleared. Noise goes in, signal comes out.",
    "The logs fear you now. That is not a metaphor, it is a measurable outcome.",
  ],
  4: [
    "The Vault cleared. Every lock on NEXUS-9 is re-keyed and the intruder's copies of the keys are decorative.",
    "Your sudo discipline was almost elegant. Almost.",
  ],
  5: [
    "Engine Room cleared. The CPU belongs to the station again and the ports are yours.",
    "The rogue processes have been evicted. One of them left a thank-you note. I deleted it.",
  ],
  6: [
    "Antenna Array cleared. NEXUS-9 is talking again, and the gateway remembers your name.",
    "Evidence is off-station and safe. Whatever the red team is planning, it has the full picture now.",
  ],
  7: [
    "Observatory cleared. You know this station better than the people who built it.",
    "Your command history is now a textbook. A slightly embarrassing textbook, but a textbook.",
  ],
  8: [
    "Reactor Core cleared. You do not type commands anymore. You command the shell.",
    "Every zone behind you, one box left to open. The night shift is about to become a story.",
  ],
};

export const LEVEL_NAMES: string[] = [
  "Rookie",
  "Operator",
  "Specialist",
  "Veteran",
  "Ghost",
  "Nexus Legend",
];

export const BOSS_START: Record<number, string> = {
  1: "Lockdown drill, Dark Halls. You have 150 seconds. Navigate the dark without a single wrong turn.",
  2: "Lockdown drill, Signal Library. You have 150 seconds. Read fast and tell the decoys from the truth.",
  3: "Lockdown drill, Scriptorium. You have 180 seconds. The noise is worse than before and the signal is buried deeper.",
  4: "Lockdown drill, The Vault. You have 150 seconds. Every lock is wrong again. Fix them all, and mind your sudo.",
  5: "Lockdown drill, Engine Room. You have 150 seconds. The squatters brought friends. Evict the lot of them.",
  6: "Lockdown drill, Antenna Array. You have 150 seconds. The relays are dark again. Get the station talking.",
  7: "Lockdown drill, Observatory. You have 180 seconds. The station is hiding something. Read the whole machine and find it.",
  8: "Lockdown drill, Reactor Core. You have 180 seconds. Full shell power, no safety net. Clean one-liners only.",
};

export const BOSS_WIN: Record<number, string> = {
  1: "Drill passed. The Dark Halls bow to you. On to the next zone.",
  2: "Drill passed. You read that whole mess like a bedtime story. On to the next zone.",
  3: "Drill passed. The Scriptorium is quiet, and quiet is correct. On to the next zone.",
  4: "Drill passed. The Vault is sealed tight. The intruder would need a miracle and a password. On to the next zone.",
  5: "Drill passed. The Engine Room hums clean. Your eviction notices have been noted. On to the next zone.",
  6: "Drill passed. The Antenna Array sings. Ten out of ten, would relay again. On to the next zone.",
  7: "Drill passed. The Observatory has no secrets left from you. One zone to go.",
  8: "Drill passed. The Reactor Core is yours. And now, junior agent, we talk about the black box.",
};

export const CTF_INTRO: string[] = [
  "Operation Blackout. The intruder left a parting gift: a locked black box, buried somewhere in this station.",
  "Five flags, fifteen minutes, every skill you own. The red team is watching to see if the night-shift junior can crack it.",
  "No hints from me this time. You already know everything. Prove it.",
];

export const GRADUATION: string[] = [
  "All five flags captured. The black box is open, and your callsign is going on the station wall.",
  "Here is the real news: the intruder was a PenTrix red-teamer. This whole night was an authorized drill.",
  "Congratulations. You just passed the hardest job interview of your life. The morning handover is going to be fun.",
];

export const IDLE_NUDGES: string[] = [
  "Three misses. Try reading the task again, slowly this time. The answer is usually in the last sentence.",
  "Stuck? The hint button costs 5 XP and never judges. Unlike me.",
  "That command went nowhere. The terminal has seen worse. Probably.",
  "Think about which command does exactly one thing here. Start there.",
  "Check your spelling and your slashes. Typos have ended careers.",
  "The briefing tells you what to do. The man page tells you how. man is your friend.",
  "Slow down. Type the command you are most sure about first, then build from its output.",
  "You are closer than you feel. Read the last error line out loud. It usually confesses.",
];

export const HINT_TEASE: string =
  "5 XP for a real answer. The clock keeps ticking, so spend it well.";
