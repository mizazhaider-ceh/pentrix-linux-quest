export type VerifyRule =
  | { type: "fileExists"; path: string }
  | { type: "fileAbsent"; path: string }
  | { type: "fileContains"; path: string; text: string }
  | { type: "perm"; path: string; mode: string } // e.g. "755"
  | { type: "historyMatches"; regex: string } // player's command history matches
  | { type: "outputContains"; text: string }; // last command output contains

export interface Challenge {
  id: string; // e.g. "nav-01"
  zone: number; // 1-8
  title: string;
  briefing: string; // story text, 1-3 sentences
  task: string; // concrete instruction, e.g. "Create the directory /home/agent/ops"
  hint: string; // genuinely helpful, reveals the command pattern
  xp: number; // 10 easy, 20 medium, 30 hard, 50 boss
  setup?: {
    files?: Record<string, string>;
    dirs?: string[];
    perms?: Record<string, string>;
    owners?: Record<string, string>;
  };
  verify: VerifyRule | VerifyRule[];
}

export const CHALLENGES: Challenge[] = [
  // ================= ZONE 1: DARK HALLS (Navigation) =================
  {
    id: "nav-01",
    zone: 1,
    title: "Where Am I",
    briefing:
      "Lights out. The terminal hums, but you have no idea where in the filesystem you woke up. First rule of the dark: always know your position.",
    task: "Print your current working directory.",
    hint: "pwd prints the working directory. Just type: pwd",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*pwd\\b" },
      { type: "outputContains", text: "/home/agent" },
    ],
  },
  {
    id: "nav-02",
    zone: 1,
    title: "Survey the Room",
    briefing:
      "You are in your home directory, /home/agent. The breach may have left surprises here. Look around before you touch anything.",
    task: "List everything in /home/agent.",
    hint: "ls lists directory contents: ls /home/agent",
    xp: 10,
    setup: { files: { "/home/agent/breach_note.txt": "03:12. remember this time." } },
    verify: [
      { type: "historyMatches", regex: "^\\s*ls\\b" },
      { type: "outputContains", text: "breach_note" },
    ],
  },
  {
    id: "nav-03",
    zone: 1,
    title: "Step Inside",
    briefing:
      "AXIOM flagged an ops directory for the recovery effort. Walk into it. In the dark, you move one directory at a time.",
    task: "Move into /home/agent/ops.",
    hint: "cd changes directory: cd /home/agent/ops",
    xp: 10,
    setup: { dirs: ["/home/agent/ops"] },
    verify: [{ type: "historyMatches", regex: "^\\s*cd\\s+/home/agent/ops" }],
  },
  {
    id: "nav-04",
    zone: 1,
    title: "Build a Room",
    briefing:
      "Recovery logs need a home. Empty directories are cheap, so build one for the incoming logs.",
    task: "Create the directory /home/agent/ops/logs.",
    hint: "mkdir makes directories: mkdir /home/agent/ops/logs",
    xp: 10,
    setup: { dirs: ["/home/agent/ops"] },
    verify: [{ type: "fileExists", path: "/home/agent/ops/logs" }],
  },
  {
    id: "nav-05",
    zone: 1,
    title: "Dig Deep",
    briefing:
      "The log archive needs a dated tree: logs/2026/oct. You could make each level by hand, or be smart about it.",
    task: "Create /home/agent/ops/logs/2026/oct in a single command.",
    hint: "mkdir -p builds parents as needed: mkdir -p /home/agent/ops/logs/2026/oct",
    xp: 10,
    setup: { dirs: ["/home/agent/ops"] },
    verify: [{ type: "fileExists", path: "/home/agent/ops/logs/2026/oct" }],
  },
  {
    id: "nav-06",
    zone: 1,
    title: "Leave a Marker",
    briefing:
      "Every op starts with a status file. Drop an empty one so the rest of the crew knows this directory is claimed.",
    task: "Create an empty file /home/agent/ops/status.txt.",
    hint: "touch creates an empty file: touch /home/agent/ops/status.txt",
    xp: 10,
    setup: { dirs: ["/home/agent/ops"] },
    verify: [{ type: "fileExists", path: "/home/agent/ops/status.txt" }],
  },
  {
    id: "nav-07",
    zone: 1,
    title: "Copy That",
    briefing:
      "You found a draft intrusion timeline. Before you touch it, make a backup copy. Amateurs edit originals.",
    task: "Copy /home/agent/ops/report.txt to /home/agent/ops/report.bak.",
    hint: "cp copies source to dest: cp /home/agent/ops/report.txt /home/agent/ops/report.bak",
    xp: 20,
    setup: { files: { "/home/agent/ops/report.txt": "intrusion timeline, draft" } },
    verify: [{ type: "fileExists", path: "/home/agent/ops/report.bak" }],
  },
  {
    id: "nav-08",
    zone: 1,
    title: "Rename the Evidence",
    briefing:
      "The timeline is finalized. Give the backup its proper name. Moving a file onto a new name is how renaming works here.",
    task: "Rename /home/agent/ops/report.bak to /home/agent/ops/report.final.",
    hint: "mv renames when the target is a new name: mv /home/agent/ops/report.bak /home/agent/ops/report.final",
    xp: 20,
    setup: { files: { "/home/agent/ops/report.bak": "intrusion timeline, final" } },
    verify: [
      { type: "fileExists", path: "/home/agent/ops/report.final" },
      { type: "fileAbsent", path: "/home/agent/ops/report.bak" },
    ],
  },
  {
    id: "nav-09",
    zone: 1,
    title: "Take Out the Trash",
    briefing:
      "A junk temp file is sitting in ops, left by the intruder's sloppy tooling. Delete it. The station is yours again.",
    task: "Delete /home/agent/ops/junk.tmp.",
    hint: "rm removes files: rm /home/agent/ops/junk.tmp",
    xp: 20,
    setup: { files: { "/home/agent/ops/junk.tmp": "intruder litter" } },
    verify: [{ type: "fileAbsent", path: "/home/agent/ops/junk.tmp" }],
  },
  {
    id: "nav-10",
    zone: 1,
    title: "Demolish",
    briefing:
      "The intruder nested a whole scratch tree under ops/trash. One file at a time would take all night. Bring the whole tree down at once.",
    task: "Remove the entire /home/agent/ops/trash directory tree.",
    hint: "rm -r removes directories and everything inside: rm -r /home/agent/ops/trash",
    xp: 20,
    setup: {
      dirs: ["/home/agent/ops/trash/a/b"],
      files: { "/home/agent/ops/trash/a/b/x.txt": "x" },
    },
    verify: [{ type: "fileAbsent", path: "/home/agent/ops/trash" }],
  },
  {
    id: "nav-11",
    zone: 1,
    title: "Climb Out",
    briefing:
      "You are deep in the log tree and need to get back up fast. Absolute paths are for tourists. Climb with relative moves.",
    task: "First move into /home/agent/ops/logs, then go up two levels with a single command.",
    hint: "cd /home/agent/ops/logs first, then climb: cd ../..",
    xp: 20,
    setup: { dirs: ["/home/agent/ops/logs/2026"] },
    verify: [{ type: "historyMatches", regex: "cd\\s+\\.\\./\\.\\." }],
  },
  {
    id: "nav-12",
    zone: 1,
    title: "Clone the Casefiles",
    briefing:
      "The casefiles directory holds everything found so far. AXIOM wants a full duplicate before analysis begins. Copy the tree, contents and all.",
    task: "Copy the whole /home/agent/ops/casefiles directory to /home/agent/ops/casefiles_backup.",
    hint: "cp -r copies directories recursively: cp -r /home/agent/ops/casefiles /home/agent/ops/casefiles_backup",
    xp: 30,
    setup: {
      dirs: ["/home/agent/ops/casefiles"],
      files: { "/home/agent/ops/casefiles/note1.txt": "found at 03:14" },
    },
    verify: [{ type: "fileExists", path: "/home/agent/ops/casefiles_backup/note1.txt" }],
  },
  {
    id: "nav-13",
    zone: 1,
    title: "Long Look",
    briefing:
      "Before the lockdown drill, take a detailed inventory of ops. Owners, sizes, timestamps. Know exactly what you are defending.",
    task: "List /home/agent/ops in long detail format.",
    hint: "ls -l shows the long format: ls -l /home/agent/ops",
    xp: 30,
    setup: { dirs: ["/home/agent/ops"] },
    verify: [
      { type: "historyMatches", regex: "^\\s*ls\\b" },
      { type: "historyMatches", regex: "-[a-zA-Z]*l" },
    ],
  },
  {
    id: "nav-boss",
    zone: 1,
    title: "Boss: Beacon Sweep",
    briefing:
      "Lockdown drill. The intruder scattered five beacon files across this zone to phone home. Find all five and quarantine them in /home/agent/ops/quarantine. You have 120 seconds.",
    task: "Move all five beacon_*.tmp files into /home/agent/ops/quarantine. You have 120 seconds.",
    hint: "Move them all at once: mv /home/agent/beacon_1.tmp /home/agent/ops/logs/beacon_2.tmp /home/agent/ops/beacon_3.tmp /home/agent/ops/casefiles/beacon_4.tmp /home/agent/ops/old/beacon_5.tmp /home/agent/ops/quarantine/",
    xp: 50,
    setup: {
      dirs: [
        "/home/agent/ops/quarantine",
        "/home/agent/ops/logs",
        "/home/agent/ops/casefiles",
        "/home/agent/ops/old",
      ],
      files: {
        "/home/agent/beacon_1.tmp": "beacon",
        "/home/agent/ops/logs/beacon_2.tmp": "beacon",
        "/home/agent/ops/beacon_3.tmp": "beacon",
        "/home/agent/ops/casefiles/beacon_4.tmp": "beacon",
        "/home/agent/ops/old/beacon_5.tmp": "beacon",
      },
    },
    verify: [
      { type: "fileExists", path: "/home/agent/ops/quarantine/beacon_1.tmp" },
      { type: "fileExists", path: "/home/agent/ops/quarantine/beacon_2.tmp" },
      { type: "fileExists", path: "/home/agent/ops/quarantine/beacon_3.tmp" },
      { type: "fileExists", path: "/home/agent/ops/quarantine/beacon_4.tmp" },
      { type: "fileExists", path: "/home/agent/ops/quarantine/beacon_5.tmp" },
      { type: "fileAbsent", path: "/home/agent/beacon_1.tmp" },
      { type: "fileAbsent", path: "/home/agent/ops/logs/beacon_2.tmp" },
      { type: "fileAbsent", path: "/home/agent/ops/beacon_3.tmp" },
      { type: "fileAbsent", path: "/home/agent/ops/casefiles/beacon_4.tmp" },
      { type: "fileAbsent", path: "/home/agent/ops/old/beacon_5.tmp" },
    ],
  },
  // ================= ZONE 2: SIGNAL LIBRARY (Reading files) =================
  {
    id: "read-01",
    zone: 2,
    title: "Read the Memo",
    briefing:
      "AXIOM recovered a shift memo from the wreckage. Whatever the night crew knew, it is in there. Read the whole thing.",
    task: "Display the full contents of /home/agent/intel/memo.txt.",
    hint: "cat prints a whole file: cat /home/agent/intel/memo.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/intel"],
      files: { "/home/agent/intel/memo.txt": "Shift change at 06:00. Station quiet.\nRelay service patched last week. Probably fine." },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*cat\\s+/home/agent/intel/memo\\.txt" },
      { type: "outputContains", text: "Shift change" },
    ],
  },
  {
    id: "read-02",
    zone: 2,
    title: "First Three",
    briefing:
      "The access log is long and your eyes are not. Start at the top: the first entries tell you when the night began.",
    task: "Show only the first 3 lines of /home/agent/intel/access.log.",
    hint: "head shows the top of a file: head -n 3 /home/agent/intel/access.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/intel"],
      files: {
        "/home/agent/intel/access.log":
          "01 alpha\n02 bravo\n03 charlie\n04 delta\n05 echo\n06 foxtrot\n07 golf\n08 hotel\n09 india\n10 juliet\n11 kilo\n12 lima\n13 mike\n14 november\n15 oscar\n16 papa\n17 quebec\n18 romeo\n19 sierra\n20 tango\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*head\\b" },
      { type: "outputContains", text: "alpha" },
    ],
  },
  {
    id: "read-03",
    zone: 2,
    title: "Last Five",
    briefing:
      "The top of the log is old news. The breach happened near the end of the file. Read the tail.",
    task: "Show only the last 5 lines of /home/agent/intel/access.log.",
    hint: "tail shows the end of a file: tail -n 5 /home/agent/intel/access.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/intel"],
      files: {
        "/home/agent/intel/access.log":
          "01 alpha\n02 bravo\n03 charlie\n04 delta\n05 echo\n06 foxtrot\n07 golf\n08 hotel\n09 india\n10 juliet\n11 kilo\n12 lima\n13 mike\n14 november\n15 oscar\n16 papa\n17 quebec\n18 romeo\n19 sierra\n20 tango\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*tail\\b" },
      { type: "outputContains", text: "tango" },
    ],
  },
  {
    id: "read-04",
    zone: 2,
    title: "What Is This",
    briefing:
      "A file named payload.bin turned up in intel. The name says binary, but names lie. Ask the system what it really is.",
    task: "Identify the file type of /home/agent/intel/payload.bin.",
    hint: "file identifies file types: file /home/agent/intel/payload.bin",
    xp: 10,
    setup: {
      dirs: ["/home/agent/intel"],
      files: { "/home/agent/intel/payload.bin": "NOTPLAINTEXT binary-blob-00ff" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*file\\s+/home/agent/intel/payload\\.bin" }],
  },
  {
    id: "read-05",
    zone: 2,
    title: "How Big Is the Story",
    briefing:
      "Before you dig into the access log, get a sense of its size. Twenty lines is a memo. Twenty thousand is a novel.",
    task: "Count the lines in /home/agent/intel/access.log.",
    hint: "wc -l counts lines: wc -l /home/agent/intel/access.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/intel"],
      files: {
        "/home/agent/intel/access.log":
          "01 alpha\n02 bravo\n03 charlie\n04 delta\n05 echo\n06 foxtrot\n07 golf\n08 hotel\n09 india\n10 juliet\n11 kilo\n12 lima\n13 mike\n14 november\n15 oscar\n16 papa\n17 quebec\n18 romeo\n19 sierra\n20 tango\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*wc\\b" },
      { type: "outputContains", text: "20" },
    ],
  },
  {
    id: "read-06",
    zone: 2,
    title: "Open the Manual",
    briefing:
      "The station manual is huge. Dumping it with cat would flood your screen. Open it in the pager so you can scroll and quit cleanly.",
    task: "Open /home/agent/intel/manual.txt in the pager.",
    hint: "less opens the pager (press q to quit): less /home/agent/intel/manual.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/intel"],
      files: { "/home/agent/intel/manual.txt": "NEXUS-9 field manual.\nPage after page of procedures.\nRead calmly. Panic later.\n" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*less\\s+/home/agent/intel/manual\\.txt" }],
  },
  {
    id: "read-07",
    zone: 2,
    title: "Numbered Lines",
    briefing:
      "AXIOM needs line numbers to reference entries in the incident report. Show the access log with every line numbered.",
    task: "Display /home/agent/intel/access.log with line numbers.",
    hint: "cat -n numbers every line: cat -n /home/agent/intel/access.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/intel"],
      files: { "/home/agent/intel/access.log": "01 alpha\n02 bravo\n03 charlie\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*cat\\b" },
      { type: "outputContains", text: "1" },
    ],
  },
  {
    id: "read-08",
    zone: 2,
    title: "Word Count",
    briefing:
      "The memo is short, but AXIOM wants exact stats for the report. Count its words, not its lines.",
    task: "Count the words in /home/agent/intel/memo.txt.",
    hint: "wc -w counts words: wc -w /home/agent/intel/memo.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/intel"],
      files: { "/home/agent/intel/memo.txt": "Shift change at 06:00. Station quiet.\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*wc\\s+-w\\b" },
      { type: "outputContains", text: "6" },
    ],
  },
  {
    id: "read-09",
    zone: 2,
    title: "Spot the Difference",
    briefing:
      "Two config snapshots, config.a and config.b. One of them was edited during the breach. Show exactly what changed.",
    task: "Show the differences between /home/agent/intel/config.a and /home/agent/intel/config.b.",
    hint: "diff compares two files line by line: diff /home/agent/intel/config.a /home/agent/intel/config.b",
    xp: 20,
    setup: {
      dirs: ["/home/agent/intel"],
      files: {
        "/home/agent/intel/config.a": "relay=10.0.0.2\nport=22\nloglevel=info\n",
        "/home/agent/intel/config.b": "relay=10.0.0.2\nport=2222\nloglevel=info\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\b" },
      { type: "outputContains", text: "2222" },
    ],
  },
  {
    id: "read-10",
    zone: 2,
    title: "First Bytes",
    briefing:
      "That payload.bin is suspicious. Before anyone runs strings on it, peek at just the first 60 bytes.",
    task: "Show the first 60 bytes of /home/agent/intel/payload.bin.",
    hint: "head -c limits by bytes: head -c 60 /home/agent/intel/payload.bin",
    xp: 20,
    setup: {
      dirs: ["/home/agent/intel"],
      files: { "/home/agent/intel/payload.bin": "NOTPLAINTEXT-binary-blob-00ff-aa55-more-bytes-here-to-fill" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*head\\s+-c" }],
  },
  {
    id: "read-11",
    zone: 2,
    title: "Identical Twins",
    briefing:
      "Two snapshots, snap1 and snap2, should be byte-identical. If diff prints nothing, they match. Silence is the answer here.",
    task: "Run diff on /home/agent/intel/snap1.txt and /home/agent/intel/snap2.txt to confirm they are identical.",
    hint: "diff prints nothing when files match: diff /home/agent/intel/snap1.txt /home/agent/intel/snap2.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/intel"],
      files: {
        "/home/agent/intel/snap1.txt": "snapshot ok\nline2\n",
        "/home/agent/intel/snap2.txt": "snapshot ok\nline2\n",
      },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/intel/snap1\\.txt\\s+/home/agent/intel/snap2\\.txt" }],
  },
  {
    id: "read-12",
    zone: 2,
    title: "Count Every Log",
    briefing:
      "Three log files, one report. Get the line count of every .log file in /home/agent/intel with a single command.",
    task: "Show line counts for all .log files in /home/agent/intel at once.",
    hint: "wc takes many files, and * matches them: wc -l /home/agent/intel/*.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/intel"],
      files: {
        "/home/agent/intel/a.log": "one\ntwo\nthree\n",
        "/home/agent/intel/b.log": "uno\ndos\ntres\ncuatro\ncinco\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-l\\b" },
      { type: "outputContains", text: "total" },
    ],
  },
  {
    id: "read-13",
    zone: 2,
    title: "Identify Everything",
    briefing:
      "The intel directory is a mix of text, data, and junk. Identify every file in it with one command and sort the real evidence from the noise.",
    task: "Run the file command on everything in /home/agent/intel.",
    hint: "file accepts many targets: file /home/agent/intel/*",
    xp: 30,
    setup: {
      dirs: ["/home/agent/intel"],
      files: {
        "/home/agent/intel/note.txt": "plain text note",
        "/home/agent/intel/blob.bin": "binary blob 00ff",
      },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*file\\s+/home/agent/intel/\\*" }],
  },
  {
    id: "read-boss",
    zone: 2,
    title: "Boss: The Split Note",
    briefing:
      "Lockdown drill. The intruder's note was split across three text files hidden among binary decoys in /home/agent/intel/vault. Use file to find the text ones, then cat all three in one command so your final output shows the secret word. You have 150 seconds.",
    task: "Identify the 3 text files in /home/agent/intel/vault with file, then display all three at once with a single cat. You have 150 seconds.",
    hint: "file /home/agent/intel/vault/* finds the text files, then: cat /home/agent/intel/vault/b.txt /home/agent/intel/vault/d.txt /home/agent/intel/vault/f.txt",
    xp: 50,
    setup: {
      dirs: ["/home/agent/intel/vault"],
      files: {
        "/home/agent/intel/vault/a.dat": "binary junk 00ff",
        "/home/agent/intel/vault/b.txt": "meet at midnight, dock 7\n",
        "/home/agent/intel/vault/c.bin": "binary junk aa55",
        "/home/agent/intel/vault/d.txt": "the relay goes dark at midnight\n",
        "/home/agent/intel/vault/e.dat": "binary junk ff00",
        "/home/agent/intel/vault/f.txt": "midnight is the window, do not be late\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\b" },
      { type: "outputContains", text: "midnight" },
    ],
  },
  // ================= ZONE 3: SCRIPTORIUM (Text fu) =================
  {
    id: "text-01",
    zone: 3,
    title: "Find the Failures",
    briefing:
      "The auth log is full of login noise. Somewhere in it are failed password attempts from 03:12. Pull out every line that mentions them.",
    task: "Print all lines containing 'Failed' in /home/agent/logs/auth.log.",
    hint: "grep searches inside files: grep Failed /home/agent/logs/auth.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/auth.log":
          "Oct 1 03:10:02 nexus sshd[101]: Accepted login for agent\nOct 1 03:11:44 nexus sshd[102]: Failed password for root\nOct 1 03:12:01 nexus sshd[103]: Failed password for admin\nOct 1 03:12:19 nexus sshd[104]: Failed password for root\nOct 1 03:13:37 nexus sshd[105]: Accepted login for agent\nOct 1 03:14:02 nexus sshd[106]: Failed password for guest\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\b" },
      { type: "outputContains", text: "Failed" },
    ],
  },
  {
    id: "text-02",
    zone: 3,
    title: "Case Blind",
    briefing:
      "The intruder's tooling writes 'failed' in lowercase. Your last search missed it. Search again, this time ignoring case.",
    task: "Print all lines containing 'failed' in any letter case in /home/agent/logs/auth.log.",
    hint: "grep -i ignores case: grep -i failed /home/agent/logs/auth.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/auth.log":
          "Oct 1 03:11:44 nexus sshd[102]: Failed password for root\nOct 1 03:12:01 nexus tool[9]: failed handshake from unknown\nOct 1 03:13:37 nexus sshd[105]: Accepted login for agent\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\s+-i\\b" },
      { type: "outputContains", text: "failed handshake" },
    ],
  },
  {
    id: "text-03",
    zone: 3,
    title: "Sort the Suspects",
    briefing:
      "AXIOM dumped a list of usernames seen on the wire. It is in random order, which is useless. Sort it.",
    task: "Display /home/agent/logs/names.txt sorted alphabetically.",
    hint: "sort orders lines: sort /home/agent/logs/names.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/names.txt": "zara\nmike\nana\nzoe\nbob\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sort\\b" },
      { type: "outputContains", text: "ana" },
    ],
  },
  {
    id: "text-04",
    zone: 3,
    title: "One of Each",
    briefing:
      "The sorted list has duplicates: the same scanner knocking twice. Collapse it so each name appears exactly once.",
    task: "Display /home/agent/logs/names_sorted.txt with duplicate lines removed.",
    hint: "uniq drops repeated lines (input must be sorted): uniq /home/agent/logs/names_sorted.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/names_sorted.txt": "ana\nana\nbob\nbob\nbob\nmike\n" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*uniq\\b" }],
  },
  {
    id: "text-05",
    zone: 3,
    title: "Sort Unique",
    briefing:
      "The raw names file is unsorted AND full of duplicates. Do both jobs in one command.",
    task: "Display the unique lines of /home/agent/logs/names.txt, sorted.",
    hint: "sort -u sorts and dedupes in one pass: sort -u /home/agent/logs/names.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/names.txt": "zara\nmike\nana\nzara\nbob\nana\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sort\\s+-u\\b" },
      { type: "outputContains", text: "ana" },
    ],
  },
  {
    id: "text-06",
    zone: 3,
    title: "Count the Knocks",
    briefing:
      "AXIOM wants a number, not a wall of text. How many failed logins are in the auth log? Count, do not list.",
    task: "Count the lines containing 'Failed' in /home/agent/logs/auth.log.",
    hint: "grep -c counts matches instead of printing them: grep -c Failed /home/agent/logs/auth.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/auth.log":
          "Oct 1 03:10:02 nexus sshd[101]: Accepted login for agent\nOct 1 03:11:44 nexus sshd[102]: Failed password for root\nOct 1 03:12:01 nexus sshd[103]: Failed password for admin\nOct 1 03:12:19 nexus sshd[104]: Failed password for root\nOct 1 03:13:37 nexus sshd[105]: Accepted login for agent\nOct 1 03:14:02 nexus sshd[106]: Failed password for guest\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\s+-c\\b" },
      { type: "outputContains", text: "4" },
    ],
  },
  {
    id: "text-07",
    zone: 3,
    title: "Everything Else",
    briefing:
      "You have stared at failures long enough. Show the log with every Failed line removed, so the normal traffic stands out.",
    task: "Print all lines in /home/agent/logs/auth.log that do NOT contain 'Failed'.",
    hint: "grep -v inverts the match: grep -v Failed /home/agent/logs/auth.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/auth.log":
          "Oct 1 03:10:02 nexus sshd[101]: Accepted login for agent\nOct 1 03:11:44 nexus sshd[102]: Failed password for root\nOct 1 03:13:37 nexus sshd[105]: Accepted login for agent\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\s+-v\\b" },
      { type: "outputContains", text: "Accepted" },
    ],
  },
  {
    id: "text-08",
    zone: 3,
    title: "Cut the Column",
    briefing:
      "The access CSV has three columns: user, ip, action. AXIOM only wants the usernames. Slice out the first field.",
    task: "Print only the first comma-separated field of every line in /home/agent/logs/access.csv.",
    hint: "cut slices fields: cut -d, -f1 /home/agent/logs/access.csv",
    xp: 20,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/access.csv": "user,ip,action\nagent,10.0.0.5,login\nroot,10.0.0.9,failed\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*cut\\b" },
      { type: "outputContains", text: "agent" },
    ],
  },
  {
    id: "text-09",
    zone: 3,
    title: "Shout It",
    briefing:
      "A ransom note arrived in whisper-quiet lowercase. Convert it to uppercase so the whole night shift can read it from across the room.",
    task: "Display /home/agent/logs/mixed.txt converted to all uppercase.",
    hint: "tr translates characters, reading stdin: cat /home/agent/logs/mixed.txt | tr 'a-z' 'A-Z'",
    xp: 20,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/mixed.txt": "we have your logs\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "WE HAVE YOUR LOGS" },
    ],
  },
  {
    id: "text-10",
    zone: 3,
    title: "Biggest First",
    briefing:
      "A sizes file lists byte counts and filenames. Alphabetical sort puts 64 above 1024, which is wrong. Sort by the numbers.",
    task: "Display /home/agent/logs/sizes.txt sorted numerically by the first column.",
    hint: "sort -n sorts by numeric value: sort -n /home/agent/logs/sizes.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/sizes.txt": "1024 cache.db\n64 temp\n512 auth.log\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sort\\s+-n\\b" },
      { type: "outputContains", text: "64 temp" },
    ],
  },
  {
    id: "text-11",
    zone: 3,
    title: "Field Extraction",
    briefing:
      "Each FAILED line carries a user= field in position 5. Pull just that field from every FAILED line. This is what awk was born for.",
    task: "Print the 5th field of every line containing 'FAILED' in /home/agent/logs/auth2.log.",
    hint: "Pipe grep into awk: grep FAILED /home/agent/logs/auth2.log | awk '{print $5}'",
    xp: 30,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/auth2.log":
          "2026-10-01 03:12:01 FAILED login user=root ip=10.0.0.5\n2026-10-01 03:12:02 FAILED login user=admin ip=10.0.0.9\n2026-10-01 03:12:03 OK login user=agent ip=10.0.0.2\n2026-10-01 03:12:04 FAILED login user=guest ip=10.0.0.7\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "user=root" },
    ],
  },
  {
    id: "text-12",
    zone: 3,
    title: "Search and Replace",
    briefing:
      "The relay config still points at old-relay, which the intruder controlled. Preview the config with the hostname swapped to new-relay, without editing the file.",
    task: "Display /home/agent/logs/config.txt with every 'old-relay' replaced by 'new-relay'. Do not modify the file.",
    hint: "sed substitutes on the fly: sed 's/old-relay/new-relay/' /home/agent/logs/config.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/config.txt": "host=old-relay\nport=25\nbackup=old-relay\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "new-relay" },
    ],
  },
  {
    id: "text-13",
    zone: 3,
    title: "Hunt the IP",
    briefing:
      "Somewhere in the probe log are IPv4 addresses. Four groups of digits, dots between them. Write the pattern and let grep do the hunting.",
    task: "Print every line in /home/agent/logs/auth3.log that contains an IPv4 address.",
    hint: "grep -E enables the pattern: grep -E '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' /home/agent/logs/auth3.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/auth3.log":
          "2026-10-01 03:12:01 BREACH probe from 10.0.0.5\n2026-10-01 03:12:02 routine check, no address\n2026-10-01 03:12:03 BREACH probe from 203.0.113.9\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "203.0.113.9" },
    ],
  },
  {
    id: "text-boss",
    zone: 3,
    title: "Boss: Attacker IPs",
    briefing:
      "Lockdown drill. The breach log is hundreds of lines of noise with a few BREACH lines buried in it. Extract every attacker IP: find the BREACH lines, pull out the IPs, dedupe and sort them. You have 180 seconds.",
    task: "From /home/agent/logs/breach.log, print the sorted unique list of IPs on BREACH lines. You have 180 seconds.",
    hint: "Chain it: grep BREACH /home/agent/logs/breach.log | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | sort -u",
    xp: 50,
    setup: {
      dirs: ["/home/agent/logs"],
      files: {
        "/home/agent/logs/breach.log":
          "2026-10-01 03:09:01 routine heartbeat ok\n2026-10-01 03:09:02 routine heartbeat ok\n2026-10-01 03:12:01 BREACH handshake from 203.0.113.7 port 443\n2026-10-01 03:09:04 routine heartbeat ok\n2026-10-01 03:09:05 cron ran, nothing to do\n2026-10-01 03:12:02 BREACH handshake from 198.51.100.23 port 443\n2026-10-01 03:09:07 routine heartbeat ok\n2026-10-01 03:09:08 disk check passed\n2026-10-01 03:12:03 BREACH handshake from 203.0.113.7 port 80\n2026-10-01 03:09:10 routine heartbeat ok\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "198.51.100.23" },
    ],
  },
  // ================= ZONE 4: THE VAULT (Permissions) =================
  {
    id: "perm-01",
    zone: 4,
    title: "Read the Lock",
    briefing:
      "The vault holds the station's secrets. Before you touch any lock, learn to read one. The permission string tells you everything.",
    task: "List /home/agent/vault/key.txt with full permission details.",
    hint: "ls -l shows permissions: ls -l /home/agent/vault/key.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/key.txt": "station master key" },
      perms: { "/home/agent/vault/key.txt": "644" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*ls\\s+-l\\b" }],
  },
  {
    id: "perm-02",
    zone: 4,
    title: "Lock It Down",
    briefing:
      "The master key file is readable by everyone on the station. That ends now. Only you should be able to read and write it.",
    task: "Set /home/agent/vault/key.txt to mode 600.",
    hint: "chmod sets numeric modes: chmod 600 /home/agent/vault/key.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/key.txt": "station master key" },
      perms: { "/home/agent/vault/key.txt": "644" },
    },
    verify: [{ type: "perm", path: "/home/agent/vault/key.txt", mode: "600" }],
  },
  {
    id: "perm-03",
    zone: 4,
    title: "Make It Runnable",
    briefing:
      "The scan script is ready but not executable. Give everyone read and execute rights, and yourself write too: the classic 755.",
    task: "Set /home/agent/vault/scan.sh to mode 755.",
    hint: "chmod 755 /home/agent/vault/scan.sh",
    xp: 10,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/scan.sh": "#!/bin/bash\necho scanning\n" },
      perms: { "/home/agent/vault/scan.sh": "644" },
    },
    verify: [{ type: "perm", path: "/home/agent/vault/scan.sh", mode: "755" }],
  },
  {
    id: "perm-04",
    zone: 4,
    title: "Symbolic Touch",
    briefing:
      "Numeric modes are fast, but sometimes you only want to flip one bit. Add execute permission for the owner, using symbolic mode.",
    task: "Add owner-execute permission to /home/agent/vault/tool.sh with symbolic mode.",
    hint: "chmod u+x adds owner execute: chmod u+x /home/agent/vault/tool.sh",
    xp: 10,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/tool.sh": "#!/bin/bash\necho tool\n" },
      perms: { "/home/agent/vault/tool.sh": "644" },
    },
    verify: [{ type: "perm", path: "/home/agent/vault/tool.sh", mode: "744" }],
  },
  {
    id: "perm-05",
    zone: 4,
    title: "Cut Them Off",
    briefing:
      "Group and others can still read the key file. Strip every permission from group and others, symbolically.",
    task: "Remove all group and other permissions from /home/agent/vault/key.txt using symbolic mode.",
    hint: "chmod go-rwx strips group and others: chmod go-rwx /home/agent/vault/key.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/key.txt": "station master key" },
      perms: { "/home/agent/vault/key.txt": "644" },
    },
    verify: [{ type: "perm", path: "/home/agent/vault/key.txt", mode: "600" }],
  },
  {
    id: "perm-06",
    zone: 4,
    title: "Lock the Tree",
    briefing:
      "The whole drop directory and everything inside it needs to go to 700. Walking the tree by hand is for people with spare nights.",
    task: "Recursively set /home/agent/vault/drop and all its contents to mode 700.",
    hint: "chmod -R applies recursively: chmod -R 700 /home/agent/vault/drop",
    xp: 20,
    setup: {
      dirs: ["/home/agent/vault/drop/inner"],
      files: { "/home/agent/vault/drop/inner/f.txt": "x" },
      perms: {
        "/home/agent/vault/drop": "755",
        "/home/agent/vault/drop/inner": "755",
        "/home/agent/vault/drop/inner/f.txt": "644",
      },
    },
    verify: [
      { type: "perm", path: "/home/agent/vault/drop", mode: "700" },
      { type: "perm", path: "/home/agent/vault/drop/inner/f.txt", mode: "700" },
    ],
  },
  {
    id: "perm-07",
    zone: 4,
    title: "Take It Back",
    briefing:
      "A file in the vault is owned by root, a souvenir of the breach. You are not root, but you have sudo. Take ownership.",
    task: "Change the owner of /home/agent/vault/stolen.txt to agent, using sudo.",
    hint: "sudo chown agent /home/agent/vault/stolen.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/stolen.txt": "was root's, now yours" },
      owners: { "/home/agent/vault/stolen.txt": "root" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*sudo\\s+chown\\s+agent\\b" }],
  },
  {
    id: "perm-08",
    zone: 4,
    title: "Change the Crew",
    briefing:
      "The shared file belongs to the wrong group. Move it into the agents group so the crew can collaborate on it.",
    task: "Change the group of /home/agent/vault/shared.txt to agents, using sudo.",
    hint: "sudo chgrp agents /home/agent/vault/shared.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/shared.txt": "crew notes" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*sudo\\s+chgrp\\s+agents\\b" }],
  },
  {
    id: "perm-09",
    zone: 4,
    title: "Check the Default",
    briefing:
      "Every new file you create gets permissions filtered through your umask. Check what yours is set to right now.",
    task: "Display your current umask value.",
    hint: "Type umask and read the number it prints: umask",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "^\\s*umask\\s*$" },
      { type: "outputContains", text: "0022" },
    ],
  },
  {
    id: "perm-10",
    zone: 4,
    title: "Prove Your Power",
    briefing:
      "You have been throwing sudo around on faith. Prove the power is real: print the user you become under sudo.",
    task: "Print the username you become when running a command with sudo.",
    hint: "sudo whoami shows the user sudo turns you into: sudo whoami",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "^\\s*sudo\\s+whoami" },
      { type: "outputContains", text: "root" },
    ],
  },
  {
    id: "perm-11",
    zone: 4,
    title: "Read the Unreadable",
    briefing:
      "A note in the vault is mode 600, owned by root. You cannot read it as yourself. Read it as root.",
    task: "Display the contents of /home/agent/vault/rootnote.txt using sudo.",
    hint: "sudo cat /home/agent/vault/rootnote.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/vault"],
      files: { "/home/agent/vault/rootnote.txt": "core password hint: the relay never sleeps" },
      perms: { "/home/agent/vault/rootnote.txt": "600" },
      owners: { "/home/agent/vault/rootnote.txt": "root" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sudo\\s+cat\\b" },
      { type: "outputContains", text: "the relay never sleeps" },
    ],
  },
  {
    id: "perm-12",
    zone: 4,
    title: "Sticky Situation",
    briefing:
      "The crew needs a shared dropbox: everyone can write into it, but nobody can delete anyone else's files. That is what the sticky bit is for.",
    task: "Create /home/agent/vault/shared with mode 1777.",
    hint: "mkdir -m sets the mode at creation: mkdir -m 1777 /home/agent/vault/shared",
    xp: 30,
    setup: { dirs: ["/home/agent/vault"] },
    verify: [{ type: "perm", path: "/home/agent/vault/shared", mode: "1777" }],
  },
  {
    id: "perm-13",
    zone: 4,
    title: "Paranoid by Default",
    briefing:
      "Set your umask to 077 so every new file you create is private by default. Then create a file and confirm it landed at 600.",
    task: "Set umask to 077, then create /home/agent/vault/secret.txt and verify it is mode 600.",
    hint: "umask 077 && touch /home/agent/vault/secret.txt, then check with ls -l",
    xp: 30,
    setup: { dirs: ["/home/agent/vault"] },
    verify: [{ type: "perm", path: "/home/agent/vault/secret.txt", mode: "600" }],
  },
  {
    id: "perm-boss",
    zone: 4,
    title: "Boss: Lockdown Drill",
    briefing:
      "Lockdown drill. Six files in /home/agent/vault have sloppy permissions. Set every .key file to 600, every .sh file to 750, and notes.txt to 644. You have 150 seconds.",
    task: "Fix all six files: .key files to 600, .sh files to 750, notes.txt to 644. You have 150 seconds.",
    hint: "chmod 600 /home/agent/vault/*.key && chmod 750 /home/agent/vault/*.sh && chmod 644 /home/agent/vault/notes.txt",
    xp: 50,
    setup: {
      dirs: ["/home/agent/vault"],
      files: {
        "/home/agent/vault/a.key": "k",
        "/home/agent/vault/b.key": "k",
        "/home/agent/vault/x.sh": "#!/bin/bash",
        "/home/agent/vault/y.sh": "#!/bin/bash",
        "/home/agent/vault/notes.txt": "notes",
      },
      perms: {
        "/home/agent/vault/a.key": "644",
        "/home/agent/vault/b.key": "644",
        "/home/agent/vault/x.sh": "644",
        "/home/agent/vault/y.sh": "644",
        "/home/agent/vault/notes.txt": "600",
      },
    },
    verify: [
      { type: "perm", path: "/home/agent/vault/a.key", mode: "600" },
      { type: "perm", path: "/home/agent/vault/b.key", mode: "600" },
      { type: "perm", path: "/home/agent/vault/x.sh", mode: "750" },
      { type: "perm", path: "/home/agent/vault/y.sh", mode: "750" },
      { type: "perm", path: "/home/agent/vault/notes.txt", mode: "644" },
    ],
  },
  // ================= ZONE 5: ENGINE ROOM (Processes) =================
  {
    id: "proc-01",
    zone: 5,
    title: "Take Attendance",
    briefing:
      "The engine room is loud and you cannot see who is running. List your own running processes first.",
    task: "List your running processes.",
    hint: "ps lists processes: ps",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*ps\\s*$" }],
  },
  {
    id: "proc-02",
    zone: 5,
    title: "Everyone, Now",
    briefing:
      "Your processes look clean, but the squatters might belong to someone else. List every process on the station with full details.",
    task: "List all processes on the system with full details.",
    hint: "ps aux shows everything: ps aux",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*ps\\s+aux" }],
  },
  {
    id: "proc-03",
    zone: 5,
    title: "Background Worker",
    briefing:
      "You need a long scan running while you keep working. Start sleep 300 in the background so your terminal stays free.",
    task: "Start 'sleep 300' as a background job.",
    hint: "Append & to background a command: sleep 300 &",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "sleep\\s+300\\s*&" }],
  },
  {
    id: "proc-04",
    zone: 5,
    title: "Check the Crew",
    briefing:
      "You have jobs running in the background, or so you hope. List your background jobs to confirm.",
    task: "List your background jobs.",
    hint: "jobs lists background jobs: sleep 60 & then jobs",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*jobs\\b" }],
  },
  {
    id: "proc-05",
    zone: 5,
    title: "One Snapshot",
    briefing:
      "top is the engine room's live dashboard, but it never quits on its own. Take a single snapshot instead.",
    task: "Show a one-shot process summary with top.",
    hint: "top -b -n 1 prints once and exits: top -b -n 1",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*top\\b" }],
  },
  {
    id: "proc-06",
    zone: 5,
    title: "Full Format",
    briefing:
      "The default ps view hides the parentage. Show the full-format listing so you can see who spawned whom.",
    task: "List all processes in full format.",
    hint: "ps -ef shows the full listing: ps -ef",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*ps\\s+-ef" }],
  },
  {
    id: "proc-07",
    zone: 5,
    title: "Find the PID",
    briefing:
      "A sleep 900 job is running somewhere in the background. Find its process ID by name.",
    task: "Start 'sleep 900' in the background, then find its PID with pgrep.",
    hint: "sleep 900 & then search by name: pgrep -f 'sleep 900'",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "sleep\\s+900\\s*&" },
      { type: "historyMatches", regex: "^\\s*pgrep\\b" },
    ],
  },
  {
    id: "proc-08",
    zone: 5,
    title: "Kill by Number",
    briefing:
      "A sleep 1000 job has overstayed its welcome. Kill it by its job ID, the %1 kind, not its PID.",
    task: "Start 'sleep 1000' in the background, then kill it by job ID.",
    hint: "sleep 1000 & then kill the first job: kill %1",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*kill\\s+%1" }],
  },
  {
    id: "proc-09",
    zone: 5,
    title: "Kill by PID",
    briefing:
      "Job IDs only work in your own shell. Real evictions use PIDs. Start a sleeper, read its PID from jobs -l, and kill it by PID.",
    task: "Start 'sleep 1100' in the background, find its PID with jobs -l, then kill it by PID.",
    hint: "sleep 1100 & then jobs -l to see the PID, then kill <PID>",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*kill\\s+[0-9]+" }],
  },
  {
    id: "proc-10",
    zone: 5,
    title: "No More Mr. Nice",
    briefing:
      "One sleeper is ignoring the polite termination signal. Escalate: send signal 9, the one that cannot be ignored.",
    task: "Start 'sleep 1200' in the background and force-kill it with signal 9.",
    hint: "sleep 1200 & then jobs -l for the PID, then kill -9 <PID>",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*kill\\s+-9\\b" }],
  },
  {
    id: "proc-11",
    zone: 5,
    title: "Be Nice",
    briefing:
      "Not every job deserves full CPU. Start a background sleeper with a niceness of 10 so it yields to real work.",
    task: "Start 'sleep 1300' in the background with niceness 10.",
    hint: "nice -n sets niceness: nice -n 10 sleep 1300 &",
    xp: 30,
    verify: [{ type: "historyMatches", regex: "^\\s*nice\\s+-n\\s+10\\b" }],
  },
  {
    id: "proc-12",
    zone: 5,
    title: "Survive Logout",
    briefing:
      "The handover is coming and you might get disconnected. Launch a sleeper that survives a hangup.",
    task: "Start 'sleep 1400' with nohup in the background so it ignores hangups.",
    hint: "nohup shields from hangups: nohup sleep 1400 &",
    xp: 30,
    verify: [{ type: "historyMatches", regex: "^\\s*nohup\\b" }],
  },
  {
    id: "proc-13",
    zone: 5,
    title: "Clean Sweep",
    briefing:
      "The engine room is littered with your test sleepers. End every remaining sleep process by name, in one command.",
    task: "Kill all remaining 'sleep' processes by name.",
    hint: "pkill kills by name pattern: pkill sleep  (or: killall sleep)",
    xp: 30,
    verify: [{ type: "historyMatches", regex: "\\b(pkill|killall)\\s+sleep" }],
  },
  {
    id: "proc-boss",
    zone: 5,
    title: "Boss: Stress Test",
    briefing:
      "Lockdown drill. AXIOM wants proof you can manage load under pressure: launch three sleep 1500 background workers, confirm all three with jobs, then terminate all three with a single kill-by-name command. You have 150 seconds.",
    task: "Launch 3x 'sleep 1500' in the background, confirm with jobs, then kill them all by name. You have 150 seconds.",
    hint: "sleep 1500 & three times, then jobs, then: pkill -f 'sleep 1500'",
    xp: 50,
    verify: [
      { type: "historyMatches", regex: "sleep\\s+1500" },
      { type: "historyMatches", regex: "^\\s*jobs\\b" },
      { type: "historyMatches", regex: "\\b(pkill|killall)\\b" },
    ],
  },
  // ================= ZONE 6: ANTENNA ARRAY (Networking) =================
  {
    id: "net-01",
    zone: 6,
    title: "Know Your Address",
    briefing:
      "The array is dark and you do not even know your own addresses. Ask the station to introduce itself.",
    task: "Show the station's IP addresses.",
    hint: "ip addr shows addresses: ip addr  (or: ip a)",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*ip\\s+(addr|a)\\b" }],
  },
  {
    id: "net-02",
    zone: 6,
    title: "Ping the Gateway",
    briefing:
      "The gateway at 10.0.0.1 should answer. Send it three packets and see if the station's front door is alive.",
    task: "Ping 10.0.0.1 with exactly 3 packets.",
    hint: "ping -c 3 sends three packets: ping -c 3 10.0.0.1",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*ping\\s+-c\\s+3\\b" }],
  },
  {
    id: "net-03",
    zone: 6,
    title: "Who Is Listening",
    briefing:
      "The intruder may have left a backdoor socket open. List every listening socket on the station.",
    task: "List listening TCP sockets.",
    hint: "ss -tln shows listening TCP sockets: ss -tln",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*ss\\b" }],
  },
  {
    id: "net-04",
    zone: 6,
    title: "Fetch the Status",
    briefing:
      "The relay at 10.0.0.1 serves a status page. Fetch it and read what the array thinks of itself.",
    task: "Fetch http://10.0.0.1/status and display it.",
    hint: "curl fetches URLs: curl http://10.0.0.1/status",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*curl\\s+http://10\\.0\\.0\\.1/status" }],
  },
  {
    id: "net-05",
    zone: 6,
    title: "Download the Patch",
    briefing:
      "The relay hosts a firmware patch the array needs. Download it to /home/agent/patch.bin.",
    task: "Download http://10.0.0.1/firmware/patch.bin to /home/agent/patch.bin.",
    hint: "wget -O picks the output file: wget -O /home/agent/patch.bin http://10.0.0.1/firmware/patch.bin",
    xp: 10,
    verify: [{ type: "fileExists", path: "/home/agent/patch.bin" }],
  },
  {
    id: "net-06",
    zone: 6,
    title: "Knock on the Relay",
    briefing:
      "Time to visit the relay itself. Open an SSH session to relay@10.0.0.2 and say hello.",
    task: "Open an SSH session to relay@10.0.0.2.",
    hint: "ssh user@host connects: ssh relay@10.0.0.2",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*ssh\\s+relay@10\\.0\\.0\\.2\\s*$" }],
  },
  {
    id: "net-07",
    zone: 6,
    title: "Ship the Evidence",
    briefing:
      "The timeline report must get off-station now. Copy /home/agent/report.txt to relay@10.0.0.2:/incoming/.",
    task: "Copy /home/agent/report.txt to relay@10.0.0.2:/incoming/ with scp.",
    hint: "scp copies over SSH: scp /home/agent/report.txt relay@10.0.0.2:/incoming/",
    xp: 20,
    setup: { files: { "/home/agent/report.txt": "intrusion timeline, final" } },
    verify: [{ type: "historyMatches", regex: "^\\s*scp\\s+/home/agent/report\\.txt\\s+relay@10\\.0\\.0\\.2:/incoming/" }],
  },
  {
    id: "net-08",
    zone: 6,
    title: "Headers Only",
    briefing:
      "You do not need the whole status page, just its HTTP headers. Fetch headers only.",
    task: "Fetch only the HTTP headers of http://10.0.0.1/status.",
    hint: "curl -I fetches headers only: curl -I http://10.0.0.1/status",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*curl\\s+-I\\b" }],
  },
  {
    id: "net-09",
    zone: 6,
    title: "One Packet",
    briefing:
      "Quick health check on the gateway. One packet, no more. If it answers, the path is alive.",
    task: "Ping 10.0.0.1 with a single packet.",
    hint: "ping -c 1 sends exactly one packet: ping -c 1 10.0.0.1",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*ping\\s+-c\\s+1\\b" }],
  },
  {
    id: "net-10",
    zone: 6,
    title: "Connections and Owners",
    briefing:
      "Listening sockets were clean, but what about active connections? Show all TCP connections with the owning processes.",
    task: "Show all TCP connections including process names.",
    hint: "ss -tup shows TCP with processes: ss -tup",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*ss\\s+-tup" }],
  },
  {
    id: "net-11",
    zone: 6,
    title: "Read the Map",
    briefing:
      "Packets need directions. Display the station's routing table to see where traffic goes.",
    task: "Show the routing table.",
    hint: "ip route prints the routing table: ip route",
    xp: 30,
    verify: [{ type: "historyMatches", regex: "^\\s*ip\\s+route" }],
  },
  {
    id: "net-12",
    zone: 6,
    title: "Grab the File List",
    briefing:
      "The relay publishes a file listing at http://10.0.0.1/files/. Save it to /home/agent/files.txt for review.",
    task: "Download http://10.0.0.1/files/ to /home/agent/files.txt.",
    hint: "wget -O /home/agent/files.txt http://10.0.0.1/files/",
    xp: 30,
    verify: [{ type: "fileExists", path: "/home/agent/files.txt" }],
  },
  {
    id: "net-13",
    zone: 6,
    title: "Remote One-Liner",
    briefing:
      "You need the relay's uptime but a full SSH session is overkill. Run the command remotely and get the answer back.",
    task: "Run 'uptime' on relay@10.0.0.2 over SSH without opening an interactive session.",
    hint: "ssh runs a remote command when you append it: ssh relay@10.0.0.2 uptime",
    xp: 30,
    verify: [{ type: "historyMatches", regex: "^\\s*ssh\\s+relay@10\\.0\\.0\\.2\\s+uptime" }],
  },
  {
    id: "net-boss",
    zone: 6,
    title: "Boss: Firmware Run",
    briefing:
      "Lockdown drill. The array needs the firmware bundle from the relay before the window closes: pull http://10.0.0.1/bundle.tar down to /home/agent/bundle.tar, then list it with details to confirm the download. You have 150 seconds.",
    task: "Download the bundle to /home/agent/bundle.tar with wget, then list it with ls -l. You have 150 seconds.",
    hint: "wget -O /home/agent/bundle.tar http://10.0.0.1/bundle.tar && ls -lh /home/agent/bundle.tar",
    xp: 50,
    verify: [
      { type: "historyMatches", regex: "^\\s*wget\\b" },
      { type: "fileExists", path: "/home/agent/bundle.tar" },
      { type: "historyMatches", regex: "^\\s*ls\\b" },
    ],
  },
  // ================= ZONE 7: OBSERVATORY (System intel) =================
  {
    id: "sys-01",
    zone: 7,
    title: "Name the Kernel",
    briefing:
      "The observatory starts with the basics: what kernel is this station running? Ask it directly.",
    task: "Print the kernel name, version, and machine details.",
    hint: "uname -a prints it all: uname -a",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*uname\\s+-a" }],
  },
  {
    id: "sys-02",
    zone: 7,
    title: "How Long Awake",
    briefing:
      "The breach hit at 03:12. Knowing how long the station has been up tells you whether it rebooted during the attack.",
    task: "Show how long the system has been up.",
    hint: "uptime shows uptime and load: uptime",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*uptime\\b" }],
  },
  {
    id: "sys-03",
    zone: 7,
    title: "Disk Check",
    briefing:
      "The intruder may have filled a partition with junk. Check disk usage in human-readable form.",
    task: "Show disk usage in human-readable form.",
    hint: "df -h shows human-readable disk usage: df -h",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*df\\s+-h" }],
  },
  {
    id: "sys-04",
    zone: 7,
    title: "Memory Check",
    briefing:
      "Rogue processes eat memory. See how much RAM the station has and how much is actually free.",
    task: "Show memory usage in human-readable form.",
    hint: "free -h shows human-readable memory: free -h",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "^\\s*free\\s+-h" }],
  },
  {
    id: "sys-05",
    zone: 7,
    title: "Who Are You",
    briefing:
      "After all that sudo, a sanity check is in order. Confirm which user you are right now.",
    task: "Print your current username.",
    hint: "whoami prints your username: whoami",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*whoami\\b" },
      { type: "outputContains", text: "agent" },
    ],
  },
  {
    id: "sys-06",
    zone: 7,
    title: "Weigh the Logs",
    briefing:
      "The logs directory has been growing all night. Find out exactly how much disk it is eating.",
    task: "Show the total size of /home/agent/logs.",
    hint: "du -sh summarizes a directory: du -sh /home/agent/logs",
    xp: 20,
    setup: {
      dirs: ["/home/agent/logs"],
      files: { "/home/agent/logs/a.log": "log data here" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*du\\s+-sh\\b" }],
  },
  {
    id: "sys-07",
    zone: 7,
    title: "Recall",
    briefing:
      "Your shell remembers everything you typed tonight. Pull up the full command history and admire the trail.",
    task: "Display your command history.",
    hint: "history prints past commands: history",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*history\\b" }],
  },
  {
    id: "sys-08",
    zone: 7,
    title: "Find HOME",
    briefing:
      "Your environment holds dozens of variables. Fish out the HOME variable and confirm where home is.",
    task: "Find the HOME variable in your environment.",
    hint: "env lists variables, grep filters: env | grep HOME",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "\\benv\\b" },
      { type: "outputContains", text: "/home/agent" },
    ],
  },
  {
    id: "sys-09",
    zone: 7,
    title: "Read the Manual",
    briefing:
      "Real agents read manuals. Open the manual page for ls and learn one option you did not know.",
    task: "Open the manual page for ls.",
    hint: "man opens manual pages (press q to quit): man ls",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*man\\s+ls" }],
  },
  {
    id: "sys-10",
    zone: 7,
    title: "Station Time",
    briefing:
      "Every log entry needs a trustworthy clock. Print the current date and time.",
    task: "Print the current date and time.",
    hint: "date prints it: date",
    xp: 20,
    verify: [{ type: "historyMatches", regex: "^\\s*date\\b" }],
  },
  {
    id: "sys-11",
    zone: 7,
    title: "History Hunt",
    briefing:
      "You know you created directories tonight, but when? Search your history for every mkdir you ran.",
    task: "Search your command history for 'mkdir'.",
    hint: "Pipe history into grep: history | grep mkdir",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "\\bhistory\\b" },
      { type: "historyMatches", regex: "\\bgrep\\s+mkdir" },
    ],
  },
  {
    id: "sys-12",
    zone: 7,
    title: "Count the Inodes",
    briefing:
      "Disk space is only half the story. A million tiny files can exhaust inodes while gigabytes sit free. Check inode usage.",
    task: "Show inode usage for all filesystems.",
    hint: "df -i reports inodes: df -i",
    xp: 30,
    verify: [{ type: "historyMatches", regex: "^\\s*df\\s+-i" }],
  },
  {
    id: "sys-13",
    zone: 7,
    title: "Just the Value",
    briefing:
      "AXIOM wants the USER variable's value on record, nothing else. Extract that one line from the environment.",
    task: "Print only the USER line from your environment.",
    hint: "env lists variables, grep filters to one line: env | grep '^USER='",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "\\benv\\b" },
      { type: "outputContains", text: "agent" },
    ],
  },
  {
    id: "sys-boss",
    zone: 7,
    title: "Boss: Health Report",
    briefing:
      "Lockdown drill. The morning crew wants a health report in /home/agent/health.txt: the hostname, the uptime, disk usage of /, and memory usage. Gather all four with real commands. You have 180 seconds.",
    task: "Write hostname (uname -n), uptime, disk usage (df -h /), and memory (free -h) into /home/agent/health.txt. You have 180 seconds.",
    hint: "uname -n > /home/agent/health.txt && uptime >> /home/agent/health.txt && df -h / >> /home/agent/health.txt && free -h >> /home/agent/health.txt",
    xp: 50,
    verify: [
      { type: "fileExists", path: "/home/agent/health.txt" },
      { type: "historyMatches", regex: "\\buname\\b" },
      { type: "historyMatches", regex: "\\buptime\\b" },
      { type: "historyMatches", regex: "\\bdf\\b" },
      { type: "historyMatches", regex: "\\bfree\\b" },
    ],
  },
  // ================= ZONE 8: REACTOR CORE (Shell power) =================
  {
    id: "shell-01",
    zone: 8,
    title: "First Pipe",
    briefing:
      "The reactor runs on pipelines. Connect two commands: feed the words file into a line counter without using a filename argument.",
    task: "Count the lines in /home/agent/data/words.txt using a pipe into wc -l.",
    hint: "cat /home/agent/data/words.txt | wc -l",
    xp: 10,
    setup: {
      dirs: ["/home/agent/data"],
      files: { "/home/agent/data/words.txt": "one\ntwo\nthree\nfour\nfive\nsix\nseven\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\|" },
      { type: "outputContains", text: "7" },
    ],
  },
  {
    id: "shell-02",
    zone: 8,
    title: "Write, Don't Say",
    briefing:
      "Echo prints to the screen. Redirect it into a file instead and leave a status note for the crew.",
    task: "Write the text 'reactor nominal' into /home/agent/data/note.txt.",
    hint: "echo 'reactor nominal' > /home/agent/data/note.txt",
    xp: 10,
    setup: { dirs: ["/home/agent/data"] },
    verify: [{ type: "fileContains", path: "/home/agent/data/note.txt", text: "reactor nominal" }],
  },
  {
    id: "shell-03",
    zone: 8,
    title: "Append, Don't Clobber",
    briefing:
      "The note exists. Add a second line without wiping the first. One wrong redirect and the original line is gone.",
    task: "Append the line 'core temp stable' to /home/agent/data/note.txt.",
    hint: ">> appends instead of overwriting: echo 'core temp stable' >> /home/agent/data/note.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/data"],
      files: { "/home/agent/data/note.txt": "reactor nominal\n" },
    },
    verify: [{ type: "fileContains", path: "/home/agent/data/note.txt", text: "core temp stable" }],
  },
  {
    id: "shell-04",
    zone: 8,
    title: "Star Power",
    briefing:
      "The data directory holds logs and strays. List only the .log files using a wildcard.",
    task: "List only the .log files in /home/agent/data.",
    hint: "ls /home/agent/data/*.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/data"],
      files: {
        "/home/agent/data/a1.log": "x",
        "/home/agent/data/a2.log": "x",
        "/home/agent/data/b.txt": "x",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*ls\\b" },
      { type: "historyMatches", regex: "\\*" },
    ],
  },
  {
    id: "shell-05",
    zone: 8,
    title: "Find It",
    briefing:
      "A file named flag.txt is buried somewhere under /home/agent. Hunt it by name across the whole tree.",
    task: "Find every file named flag.txt under /home/agent.",
    hint: "find searches by name: find /home/agent -name flag.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/data/deep/nest"],
      files: { "/home/agent/data/deep/nest/flag.txt": "flag{deep}" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*find\\s+/home/agent\\s+-name" }],
  },
  {
    id: "shell-06",
    zone: 8,
    title: "Name It",
    briefing:
      "Stop retyping the same strings. Store 'nexus' in a variable called CALLSIGN and print it back.",
    task: "Create variable CALLSIGN with value 'nexus' and print its value.",
    hint: "CALLSIGN=nexus then echo $CALLSIGN  (no spaces around =)",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "CALLSIGN=nexus" },
      { type: "outputContains", text: "nexus" },
    ],
  },
  {
    id: "shell-07",
    zone: 8,
    title: "Read the Exit",
    briefing:
      "Every command exits with a code: 0 means success, anything else means trouble. Run a failing command, then read its exit code.",
    task: "Run 'ls /nope' (it will fail), then print its exit code.",
    hint: "ls /nope then echo $? prints the last exit code",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "ls\\s+/nope" },
      { type: "historyMatches", regex: "echo\\s+\\$\\?" },
    ],
  },
  {
    id: "shell-08",
    zone: 8,
    title: "Pack It Up",
    briefing:
      "The project folder must be archived before the reactor work begins. Pack it into a tarball.",
    task: "Archive /home/agent/data/project into /home/agent/data/project.tar.",
    hint: "cd /home/agent/data && tar -cf project.tar project",
    xp: 20,
    setup: {
      dirs: ["/home/agent/data/project"],
      files: {
        "/home/agent/data/project/a.txt": "a",
        "/home/agent/data/project/b.txt": "b",
      },
    },
    verify: [{ type: "fileExists", path: "/home/agent/data/project.tar" }],
  },
  {
    id: "shell-09",
    zone: 8,
    title: "Unpack It",
    briefing:
      "You built project.tar in the last challenge. Now extract it into /home/agent/data/restored/ to prove the archive is good.",
    task: "Extract /home/agent/data/project.tar into /home/agent/data/restored/.",
    hint: "mkdir -p /home/agent/data/restored && tar -xf /home/agent/data/project.tar -C /home/agent/data/restored",
    xp: 20,
    setup: { dirs: ["/home/agent/data/restored"] },
    verify: [{ type: "fileExists", path: "/home/agent/data/restored/project/a.txt" }],
  },
  {
    id: "shell-10",
    zone: 8,
    title: "Find and Destroy",
    briefing:
      "Temp files are scattered through the data tree. Find every .tmp file under /home/agent/data and delete them in one command.",
    task: "Delete all .tmp files under /home/agent/data with a single find command.",
    hint: "find /home/agent/data -name '*.tmp' -delete",
    xp: 20,
    setup: {
      dirs: ["/home/agent/data"],
      files: {
        "/home/agent/data/a.tmp": "x",
        "/home/agent/data/b.tmp": "x",
        "/home/agent/data/keep.txt": "keep me",
      },
    },
    verify: [
      { type: "fileAbsent", path: "/home/agent/data/a.tmp" },
      { type: "fileAbsent", path: "/home/agent/data/b.tmp" },
      { type: "fileExists", path: "/home/agent/data/keep.txt" },
    ],
  },
  {
    id: "shell-11",
    zone: 8,
    title: "Loop It",
    briefing:
      "Three files, one pattern. Write a for loop that creates f1.txt, f2.txt, and f3.txt in /home/agent/data/loop/.",
    task: "Create f1.txt, f2.txt, f3.txt in /home/agent/data/loop/ with one for loop.",
    hint: "for i in 1 2 3; do touch /home/agent/data/loop/f$i.txt; done",
    xp: 30,
    setup: { dirs: ["/home/agent/data/loop"] },
    verify: [
      { type: "fileExists", path: "/home/agent/data/loop/f1.txt" },
      { type: "fileExists", path: "/home/agent/data/loop/f2.txt" },
      { type: "fileExists", path: "/home/agent/data/loop/f3.txt" },
    ],
  },
  {
    id: "shell-12",
    zone: 8,
    title: "Search the Tree",
    briefing:
      "The word 'breach' appears in exactly one file under /home/agent/data, but you do not know which. Search the whole tree recursively.",
    task: "Recursively search /home/agent/data for the word 'breach'.",
    hint: "grep -r searches recursively: grep -r breach /home/agent/data",
    xp: 30,
    setup: {
      dirs: ["/home/agent/data"],
      files: {
        "/home/agent/data/syslog": "all quiet\n",
        "/home/agent/data/alerts": "breach detected at 03:12\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\s+-r" },
      { type: "outputContains", text: "breach" },
    ],
  },
  {
    id: "shell-13",
    zone: 8,
    title: "Write a Script",
    briefing:
      "One-off commands are for emergencies. Write a real script: pingcheck.sh should ping 10.0.0.1 once, and it must be executable.",
    task: "Create /home/agent/data/pingcheck.sh containing 'ping -c 1 10.0.0.1', then make it executable.",
    hint: "echo 'ping -c 1 10.0.0.1' > /home/agent/data/pingcheck.sh && chmod 755 /home/agent/data/pingcheck.sh",
    xp: 30,
    setup: { dirs: ["/home/agent/data"] },
    verify: [
      { type: "fileContains", path: "/home/agent/data/pingcheck.sh", text: "ping -c 1 10.0.0.1" },
      { type: "perm", path: "/home/agent/data/pingcheck.sh", mode: "755" },
    ],
  },
  {
    id: "shell-boss",
    zone: 8,
    title: "Boss: Reactor Restart",
    briefing:
      "Final lockdown drill. Restart sequence: append RESTART to /home/agent/data/reactor.log, archive /home/agent/data into /home/agent/data_backup.tar, and lock the archive to mode 600. Three steps, one timer. You have 180 seconds.",
    task: "Append RESTART to the reactor log, tar /home/agent/data to /home/agent/data_backup.tar, chmod the archive to 600. You have 180 seconds.",
    hint: "echo RESTART >> /home/agent/data/reactor.log && tar -cf /home/agent/data_backup.tar -C /home/agent data && chmod 600 /home/agent/data_backup.tar",
    xp: 50,
    setup: {
      dirs: ["/home/agent/data"],
      files: { "/home/agent/data/reactor.log": "log start\n" },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/data/reactor.log", text: "RESTART" },
      { type: "fileExists", path: "/home/agent/data_backup.tar" },
      { type: "perm", path: "/home/agent/data_backup.tar", mode: "600" },
    ],
  },
];
