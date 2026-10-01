import type { Challenge } from "../../data/challenges";

/**
 * Operation Blackout: the graduation CTF. Five flags, every skill from all
 * eight zones in play. Zone 9 in store terms.
 *
 * A CTF challenge is completed by submitting its flag string through
 * `store.submitCtfFlag(flag)`. The verify rules also let the store complete a
 * flag through normal command play (the flag appearing in terminal output is
 * what counts as capturing it).
 */
export interface CtfChallenge extends Challenge {
  /** The exact flag string, e.g. "NEXUS{...}". */
  flag: string;
}

export const CTF_CHALLENGES: CtfChallenge[] = [
  {
    id: "ctf-1",
    zone: 9,
    title: "Flag 1: Foundation",
    briefing:
      "The black box is buried somewhere under your home directory, three levels down, wearing an innocent name. AXIOM's map ends here. Yours does not.",
    task: "Find the hidden flag file three directories deep under /home/agent and display its contents.",
    hint: "Search by name pattern: find /home/agent -name 'flag*' 2>/dev/null, then cat what you find.",
    xp: 60,
    setup: {
      dirs: ["/home/agent/.cache/sys/tmp"],
      files: { "/home/agent/.cache/sys/tmp/flag.txt": "NEXUS{foundation_found}\n" },
    },
    verify: [{ type: "outputContains", text: "NEXUS{foundation_found}" }],
    flag: "NEXUS{foundation_found}",
  },
  {
    id: "ctf-2",
    zone: 9,
    title: "Flag 2: Lockpick",
    briefing:
      "The second flag sits behind a 600 lock with root holding the only key. You are not root. Your sudo still works, and the station needs that flag.",
    task: "Read /home/agent/blackbox/flag2.txt using sudo and display the flag.",
    hint: "sudo cat /home/agent/blackbox/flag2.txt",
    xp: 60,
    setup: {
      dirs: ["/home/agent/blackbox"],
      files: { "/home/agent/blackbox/flag2.txt": "NEXUS{lockpick_legend}\n" },
      perms: { "/home/agent/blackbox/flag2.txt": "600" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sudo\\b" },
      { type: "outputContains", text: "NEXUS{lockpick_legend}" },
    ],
    flag: "NEXUS{lockpick_legend}",
  },
  {
    id: "ctf-3",
    zone: 9,
    title: "Flag 3: Static",
    briefing:
      "The relay log is readable but the flag inside is shifted, every letter pushed three places down the alphabet. Your tr command was built for exactly this.",
    task: "Decode the scrambled flag in /home/agent/logs/static.log with tr and display it.",
    hint: "Shift every letter back by three: tr 'D-ZA-Cd-za-c' 'A-Za-z' < /home/agent/logs/static.log",
    xp: 60,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/static.log": "QHAXV{fdhvdu_fudfnhg}\n" },
    },
    verify: [{ type: "outputContains", text: "NEXUS{caesar_cracked}" }],
    flag: "NEXUS{caesar_cracked}",
  },
  {
    id: "ctf-4",
    zone: 9,
    title: "Flag 4: Archive",
    briefing:
      "The fourth flag hides inside a directory named like a junk drawer, packed in a file that calls itself a backup archive. The name lies. The flag does not.",
    task: "Find the misleadingly named archive under /home/agent/attic and pull the flag out of it.",
    hint: "find /home/agent/attic -name '*.tar', then cat the file you find.",
    xp: 60,
    setup: {
      dirs: ["/home/agent/attic/junk_drawer"],
      files: {
        "/home/agent/attic/readme.txt": "Nothing to see here. The attic is clean.\n",
        "/home/agent/attic/junk_drawer/old_backup.tar":
          "corrupted header, do not trust the name\nNEXUS{archive_ace}\nold junk\n",
      },
    },
    verify: [{ type: "outputContains", text: "NEXUS{archive_ace}" }],
    flag: "NEXUS{archive_ace}",
  },
  {
    id: "ctf-5",
    zone: 9,
    title: "Flag 5: Ghost",
    briefing:
      "The last flag was torn into pieces and scattered across a dozen log lines. Each piece is numbered. Collect them, sort them, squeeze out the noise.",
    task: "Reassemble the flag from /home/agent/logs/fragments.log with grep, sort, and cut, then display it.",
    hint: "grep '^part' /home/agent/logs/fragments.log | sort | cut -d' ' -f3 | tr -d '\\n'; echo",
    xp: 60,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/fragments.log":
          "part 3/5 assembl\n" +
          "noise: cron rotated at 03:12\n" +
          "part 1/5 NEXUS{gh\n" +
          "noise: relay handshake ok\n" +
          "part 5/5 }\n" +
          "part 2/5 ost_re\n" +
          "noise: beacon sweep complete\n" +
          "part 4/5 ed\n" +
          "noise: disk check passed\n" +
          "noise: uptime 41 days\n" +
          "noise: kernel 6.8.0-nexus\n" +
          "noise: load average 0.12\n",
      },
    },
    verify: [{ type: "outputContains", text: "NEXUS{ghost_reassembled}" }],
    flag: "NEXUS{ghost_reassembled}",
  },
];

/** Total XP for capturing all five flags: 5 x 60. */
export const CTF_TOTAL_XP = 300;
