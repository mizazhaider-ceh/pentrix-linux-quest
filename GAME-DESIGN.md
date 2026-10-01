# NEXUS: Linux Quest - Game Design Document

## Story Premise

NEXUS-9 is a PenTrix listening station in low orbit over Brussels. It is quiet, boring, and exactly how the night shift likes it. At 03:12 station time, an intruder slipped through a misconfigured relay service and spent forty minutes rearranging the place: logs scattered across the filesystem, permissions scrambled, rogue processes squatting on ports, the routing table doodled on. Then the intruder vanished, leaving the station alive but a mess.

You are the junior agent on duty. The senior crew is three hours out and the station must be clean before the morning handover. Your terminal still answers, and the breach left one gift: nothing was deleted, only moved, renamed, locked, or hidden. The station AI, AXIOM, has mapped the damage into eight zones. Clear them in order, beat each zone's lockdown drill, and you will make the handover with a story worth telling. Miss it, and you get to explain to your lead why the station smells like burnt cron jobs.

## The 8 Zones

### Zone 1: Dark Halls (Navigation)
The zone map is gone and the lights are out. You will learn to move in the dark: where you are, what is around you, and how to build the directory structure the recovery effort needs. By the end, you can cross any filesystem blindfolded.

### Zone 2: Signal Library (Reading Files)
The breach scattered logs across the station, and the truth about 03:12 is written in them somewhere. You will learn to read files fast: whole files, slices of files, and how to tell a text file from a binary decoy at a glance.

### Zone 3: Scriptorium (Text Fu)
Five hundred lines of noise, three lines that matter. You will learn to carve signal out of text: searching, sorting, counting, cutting fields, and the small regex patterns that find needles in log haystacks.

### Zone 4: The Vault (Permissions)
Every lock on the station was picked or left open. You will re-key NEXUS-9: read permission strings like a second language, lock files down to 600, open scripts to 755, and use sudo without blowing your own foot off.

### Zone 5: Engine Room (Processes)
Rogue processes are squatting on your CPU and holding ports hostage. You will learn to see every running process, push work into the background, and evict anything that does not belong, politely at first, with signal 9 if needed.

### Zone 6: Antenna Array (Networking)
The relays went silent at 03:12. You will get the station talking again: check your own addresses, ping the gateway, read the sockets, pull files from the relay, and copy evidence off-station over SSH.

### Zone 7: Observatory (System Intel)
Before you fix a station, you must know it. You will learn to read the whole machine at a glance: disk, memory, uptime, kernel, environment, and your own command history, which by now is a crime scene of its own.

### Zone 8: Reactor Core (Shell Power)
Pipes, redirects, wildcards, variables, exit codes, archives, and loops. This is where junior agents stop typing commands and start commanding the shell. The reactor does not forgive sloppy syntax, but it rewards clean one-liners.

## Progression Rules

1. Zones unlock in order, 1 through 8. No skipping ahead.
2. Complete at least 10 of a zone's 13 standard challenges to unlock the next zone.
3. A zone's boss drill unlocks only after all 13 standard challenges in that zone are complete.
4. The graduation CTF unlocks after all 8 boss drills are beaten.
5. Within a zone, challenges run in order and filesystem state persists between them. A later challenge may build on files an earlier one created.
6. Every challenge starts the player in /home/agent unless its briefing says otherwise.
7. The emulated terminal runs as user `agent` with passwordless sudo. The engine simulates processes, network peers (gateway 10.0.0.1, relay 10.0.0.2), and command outputs faithfully enough that every challenge is solvable with real commands.

## XP Economy

| Difficulty | XP |
|---|---|
| Easy | 10 |
| Medium | 20 |
| Hard | 30 |
| Boss drill | 50 |
| Graduation CTF (all 5 flags) | 300 |

- Each zone holds 13 standard challenges (10 XP easy, 20 XP medium, 30 XP hard) plus a 50 XP boss drill: 270 to 290 XP per zone, 2300 across all eight.
- A hint costs 5 XP, deducted the moment it is revealed. The boss clock keeps running while you read it.
- XP can never drop below zero. Spending your last XP on a hint just leaves you broke, not in debt.

### Levels

| Level | Title | XP required |
|---|---|---|
| 1 | Rookie | 0 |
| 2 | Operator | 200 |
| 3 | Specialist | 500 |
| 4 | Veteran | 900 |
| 5 | Ghost | 1400 |
| 6 | Nexus Legend | 2000 |

## Boss Challenge Rules

- One boss drill per zone, marked with an `-boss` challenge id, worth 50 XP.
- Every boss is timed. Standard timer is 150 seconds; the Scriptorium, Observatory, and Reactor Core bosses get 180 seconds because they chain several steps. The exact limit is stated in the boss briefing, in the form "You have N seconds."
- Beating the timer is not required to pass. If time expires, the drill resets and you retry with no XP penalty.
- Boss verification checks real end state with three or more checks (files in place, modes correct, commands actually used).
- Hints are allowed during bosses at the normal 5 XP price, but the clock does not pause.
- Defeating a boss with at least half the timer remaining earns the "Beat the Clock" achievement.

## Achievements (12)

| # | Name | Unlock condition |
|---|---|---|
| 1 | First Boot | Complete your first challenge. |
| 2 | Cartographer | Clear every challenge in Zone 1, boss included. |
| 3 | Archivist | Clear every challenge in Zone 2, boss included. |
| 4 | Word Surgeon | Clear every challenge in Zone 3, boss included. |
| 5 | Gatekeeper | Clear every challenge in Zone 4, boss included. |
| 6 | Exterminator | Clear every challenge in Zone 5, boss included. |
| 7 | Signal Runner | Clear every challenge in Zone 6, boss included. |
| 8 | All-Seeing | Clear every challenge in Zone 7, boss included. |
| 9 | Reactor Chief | Clear every challenge in Zone 8, boss included. |
| 10 | Clean Sweep | Clear any full zone without revealing a single hint. |
| 11 | Beat the Clock | Defeat any boss drill with at least half the timer remaining. |
| 12 | Nexus Graduate | Capture all 5 flags in the graduation CTF. |

## Final Graduation CTF: Operation Blackout

After the eighth boss falls, AXIOM drops the real news: the intruder left a parting gift, a locked black box buried in the station, and the red team wants to see if the night-shift junior can crack it. Five flags, fifteen minutes on the clock, every skill from all eight zones in play:

1. **FOUNDATION** (Navigation): a flag file hidden three directories deep under /home/agent. Find it.
2. **LOCKPICK** (Permissions): a flag only root can read. Take it anyway.
3. **STATIC** (Text fu): a flag scrambled with a Caesar-style letter shift. Unscramble it with tr.
4. **ARCHIVE** (Shell power): a flag inside a tarball, inside another directory, with a misleading name.
5. **GHOST** (Everything): a flag split across a dozen log lines. Reassemble it with grep, sort, and uniq.

Each flag is worth 60 XP (300 total). Capturing all five earns the "Nexus Graduate" achievement and puts the player's callsign on the station wall, the persistent leaderboard. The closing cutscene reveals the intruder was a PenTrix red-teamer running an authorized drill, and the junior agent just passed the hardest job interview of their life.

## Tone Guidelines

- Playful but sharp. AXIOM is dry, competent, and faintly amused by you. Short sentences. Understatement over hype.
- Second person, present tense. The player is doing things right now, not setting off on some grand quest.
- Celebrate real skill, not participation. "Clean. The logs fear you now." beats "Amazing job, superstar!"
- Failure lines are funny, never shaming. "That command went nowhere. The terminal has seen worse. Probably."
- Banned words and phrases, everywhere, no exceptions: delve, unleash, elevate, game-changer, dive in, embark, tapestry, cutting-edge, seamless, robust, leverage, "unlock your potential", "in today's world", "in the world of", "furthermore", "moreover", "vibrant", "bustling".
- No em dashes in any copy, ever. Use commas, colons, or parentheses.
- No emoji bullets in design docs. In-game UI copy may use them sparingly where the interface calls for it.
- Every hint must genuinely solve its task with a real command. If the hint does not work when pasted, the challenge is broken.
- Zero lorem ipsum, zero placeholder text. Every string a player can read was written by a human voice on purpose.
