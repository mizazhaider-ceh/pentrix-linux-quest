import type { Challenge } from "./challenges";

/* Zone 2 expansion: read-20 .. read-124 (105 challenges).
 * Helpers to build repetitive log content exactly. */
const p2 = (n: number): string => String(n).padStart(2, "0");
const p3 = (n: number): string => String(n).padStart(3, "0");
const L = (from: number, to: number, f: (n: number) => string): string => {
  const out: string[] = [];
  for (let n = from; n <= to; n++) out.push(f(n));
  return out.join("\n") + "\n";
};
const rep = (s: string, n: number): string => s.repeat(n);

export const CHALLENGES_READ_X: Challenge[] = [
  {
    id: "read-20",
    zone: 2,
    title: "Read the Top Ten",
    briefing:
      "The night log is forty lines of station noise. AXIOM wants the first ten on your screen. Head shows ten lines when you ask for nothing in particular.",
    task: "Display the first 10 lines of /home/agent/read/logs/night.log.",
    hint: "head prints the top of a file, ten lines by default: head /home/agent/read/logs/night.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night.log": L(1, 40, (n) => `log line ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*head\\s+/home/agent/read/logs/night\\.log" },
      { type: "outputContains", text: "log line 10" },
    ],
  },
  {
    id: "read-21",
    zone: 2,
    title: "Read the Bottom Ten",
    briefing:
      "Endings matter more than beginnings on a night like this. The last ten lines of the night log hold the sign-off. Tail also defaults to ten.",
    task: "Display the last 10 lines of /home/agent/read/logs/night.log.",
    hint: "tail prints the end of a file, ten lines by default: tail /home/agent/read/logs/night.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night.log": L(1, 40, (n) => `log line ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*tail\\s+/home/agent/read/logs/night\\.log" },
      { type: "outputContains", text: "log line 40" },
    ],
  },
  {
    id: "read-22",
    zone: 2,
    title: "The Very First Line",
    briefing:
      "The access log opens before the trouble starts. One line is all AXIOM needs: the moment the shift began.",
    task: "Show only the first line of /home/agent/read/logs/access.log.",
    hint: "head -n 1 prints a single line from the top: head -n 1 /home/agent/read/logs/access.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: {
        "/home/agent/read/logs/access.log":
          "03:01:11 shift start, deck lights on\n03:02:40 auth ok, user agent\n03:05:12 auth ok, user ops\n03:09:55 door cycle, deck A\n03:12:00 airlock forced, deck C\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+1\\b" },
      { type: "outputContains", text: "03:01:11" },
    ],
  },
  {
    id: "read-23",
    zone: 2,
    title: "The Very Last Line",
    briefing:
      "Same log, other end. The final line was written while the airlock was still warm. Read just that one.",
    task: "Show only the last line of /home/agent/read/logs/access.log.",
    hint: "tail -n 1 prints a single line from the end: tail -n 1 /home/agent/read/logs/access.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: {
        "/home/agent/read/logs/access.log":
          "03:01:11 shift start, deck lights on\n03:02:40 auth ok, user agent\n03:05:12 auth ok, user ops\n03:09:55 door cycle, deck A\n03:12:00 airlock forced, deck C\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+1\\b" },
      { type: "outputContains", text: "airlock forced" },
    ],
  },
  {
    id: "read-24",
    zone: 2,
    title: "Seven Lines In",
    briefing:
      "Radio checks came in all night. The seventh one mentions static on deck C. Print the first seven and find it.",
    task: "Show the first 7 lines of /home/agent/read/logs/radio.log.",
    hint: "head -n 7 takes the top seven: head -n 7 /home/agent/read/logs/radio.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/radio.log": L(1, 10, (n) => `radio check ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+7\\b" },
      { type: "outputContains", text: "radio check 07" },
    ],
  },
  {
    id: "read-25",
    zone: 2,
    title: "Twelve Lines Deep",
    briefing:
      "The drill log runs twenty entries. The interesting part is the dozen at the end, when the drill stopped being a drill.",
    task: "Show the last 12 lines of /home/agent/read/logs/drill.log.",
    hint: "tail -n 12 takes the bottom twelve: tail -n 12 /home/agent/read/logs/drill.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/drill.log": L(1, 20, (n) => `drill entry ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+12\\b" },
      { type: "outputContains", text: "drill entry 20" },
    ],
  },
  {
    id: "read-26",
    zone: 2,
    title: "Last Forty Bytes",
    briefing:
      "A burst transmission sits in comms, and its ending is the part that matters. Count back forty bytes from the end and read them.",
    task: "Show the last 40 bytes of /home/agent/read/comms/burst.txt.",
    hint: "tail -c counts bytes instead of lines: tail -c 40 /home/agent/read/comms/burst.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/burst.txt": "line one\nline two\nline three ends at OVERLORD\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-c\\s+40\\b" },
      { type: "outputContains", text: "OVERLORD" },
    ],
  },
  {
    id: "read-27",
    zone: 2,
    title: "First Byte Slice",
    briefing:
      "Every transmission opens with a magic header. You only need the first thirty bytes to confirm this one is genuine.",
    task: "Show the first 30 bytes of /home/agent/read/comms/header.txt.",
    hint: "head -c counts bytes instead of lines: head -c 30 /home/agent/read/comms/header.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/header.txt": "MAGIC=0x9F3A;proto=nexus;seq=0001\npayload follows below\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-c\\s+30\\b" },
      { type: "outputContains", text: "MAGIC=0x9F3A" },
    ],
  },
  {
    id: "read-28",
    zone: 2,
    title: "From Line Eight On",
    briefing:
      "The system log opens with seven lines of boot noise. Line eight is where the intrusion alarm first appears. Start there and read to the end.",
    task: "Display /home/agent/read/logs/sys.log starting from line 8.",
    hint: "tail -n +8 starts at line 8 instead of counting from the end: tail -n +8 /home/agent/read/logs/sys.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: {
        "/home/agent/read/logs/sys.log":
          "boot ok, core online\nboot ok, relay online\nboot ok, sensors online\nboot ok, doors sealed\nboot ok, cameras online\nboot ok, uplink ready\nboot ok, crew awake\nINTRUSION detected, deck C\ncamera loop engaged\nairlock cycled\ntrace started\ntrace complete\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b[^\\n]*\\+8" },
      { type: "outputContains", text: "INTRUSION detected" },
    ],
  },
  {
    id: "read-29",
    zone: 2,
    title: "Lose the Last Two",
    briefing:
      "The trace log ends with two lines of corrupted junk. Print the whole file minus those two, and keep the real trace.",
    task: "Print /home/agent/read/logs/trace.log without its last 2 lines.",
    hint: "head -n -2 drops the last two lines: head -n -2 /home/agent/read/logs/trace.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/trace.log": L(1, 10, (n) => `trace ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+-2" },
      { type: "outputContains", text: "trace 08" },
    ],
  },
  {
    id: "read-30",
    zone: 2,
    title: "Skip the Header Row",
    briefing:
      "The cargo manifest opens with a header row: id, status, note. The data starts on line two. Skip the header.",
    task: "Display /home/agent/read/comms/manifest.csv starting from line 2.",
    hint: "tail -n +2 skips the first line: tail -n +2 /home/agent/read/comms/manifest.csv",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: {
        "/home/agent/read/comms/manifest.csv": "id,status,note\n001,ok,dock sensor\n002,ok,relay uplink\n003,BREACH,deck C airlock\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b[^\\n]*\\+2" },
      { type: "outputContains", text: "BREACH" },
    ],
  },
  {
    id: "read-31",
    zone: 2,
    title: "Changed Port",
    briefing:
      "Two relay configs, one quiet edit. The intruder changed a single port and hoped nobody would diff. Prove them wrong.",
    task: "Show the differences between /home/agent/read/config/relay_a.conf and /home/agent/read/config/relay_b.conf.",
    hint: "diff compares two files line by line: diff /home/agent/read/config/relay_a.conf /home/agent/read/config/relay_b.conf",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/relay_a.conf": "host=10.0.0.2\nport=22\nmode=auto\n",
        "/home/agent/read/config/relay_b.conf": "host=10.0.0.2\nport=2222\nmode=auto\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/relay_a\\.conf" },
      { type: "outputContains", text: "2222" },
    ],
  },
  {
    id: "read-32",
    zone: 2,
    title: "Just Say If Changed",
    briefing:
      "Sometimes you do not need the details, only the verdict. Ask diff for a yes-or-no answer on these two mode files.",
    task: "Use diff in quiet mode on /home/agent/read/config/mode_a.conf and /home/agent/read/config/mode_b.conf.",
    hint: "diff -q only reports whether files differ: diff -q /home/agent/read/config/mode_a.conf /home/agent/read/config/mode_b.conf",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/mode_a.conf": "mode=auto\n",
        "/home/agent/read/config/mode_b.conf": "mode=manual\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bdiff\\s+-q\\b" },
      { type: "outputContains", text: "differ" },
    ],
  },
  {
    id: "read-33",
    zone: 2,
    title: "A Unified Look",
    briefing:
      "The firewall rules changed overnight. Uplink wants the difference in unified format, the one with the @@ markers, so analysts can scan it fast.",
    task: "Show a unified diff between /home/agent/read/config/fw_old.rules and /home/agent/read/config/fw_new.rules.",
    hint: "diff -u prints the unified format: diff -u /home/agent/read/config/fw_old.rules /home/agent/read/config/fw_new.rules",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/fw_old.rules": "ALLOW 443/tcp\nALLOW 80/tcp\nDENY 23/tcp\n",
        "/home/agent/read/config/fw_new.rules": "ALLOW 443/tcp\nALLOW 8080/tcp\nDENY 23/tcp\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bdiff\\s+-u\\b" },
      { type: "outputContains", text: "@@" },
    ],
  },
  {
    id: "read-34",
    zone: 2,
    title: "The Quiet Files",
    briefing:
      "Two snapshots, one truth. Run diff on them and listen to the silence. Empty output is a passing grade here.",
    task: "Run diff on /home/agent/read/config/snap_a.txt and /home/agent/read/config/snap_b.txt to confirm they are identical.",
    hint: "diff prints nothing when files match: diff /home/agent/read/config/snap_a.txt /home/agent/read/config/snap_b.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/snap_a.txt": "snapshot ok\nline2\n",
        "/home/agent/read/config/snap_b.txt": "snapshot ok\nline2\n",
      },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/snap_a\\.txt\\s+/home/agent/read/config/snap_b\\.txt" }],
  },
  {
    id: "read-35",
    zone: 2,
    title: "One Line Added",
    briefing:
      "The app config grew by exactly one line during the breach. Find the addition. It smells like a backdoor flag.",
    task: "Show the differences between /home/agent/read/config/app_a.conf and /home/agent/read/config/app_b.conf.",
    hint: "diff marks added lines with >: diff /home/agent/read/config/app_a.conf /home/agent/read/config/app_b.conf",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/app_a.conf": "host=nexus-9\nport=443\n",
        "/home/agent/read/config/app_b.conf": "host=nexus-9\nport=443\ndebug=true\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/app_a\\.conf" },
      { type: "outputContains", text: "debug=true" },
    ],
  },
  {
    id: "read-36",
    zone: 2,
    title: "Plain Text Proof",
    briefing:
      "A note in the vault claims to be a field report. Verify the claim: ask the system what the file really is.",
    task: "Identify the file type of /home/agent/read/vault/note.txt.",
    hint: "file names the true type: file /home/agent/read/vault/note.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/vault"],
      files: { "/home/agent/read/vault/note.txt": "Field note: the intruder knew the camera blind spots.\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault/note\\.txt" },
      { type: "outputContains", text: "ASCII text" },
    ],
  },
  {
    id: "read-37",
    zone: 2,
    title: "The Binary Decoy",
    briefing:
      "This blob is named to look boring. Names lie on NEXUS-9. Ask file what it actually contains.",
    task: "Identify the file type of /home/agent/read/vault/blob.bin.",
    hint: "file sees through the name: file /home/agent/read/vault/blob.bin",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/vault"],
      files: { "/home/agent/read/vault/blob.bin": "junk\u00a0binary" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault/blob\\.bin" },
      { type: "outputContains", text: "data" },
    ],
  },
  {
    id: "read-38",
    zone: 2,
    title: "It Is a Directory",
    briefing:
      "Someone tried to cat the vault itself. It is not a file. Confirm what it is before you do something embarrassing.",
    task: "Identify the file type of /home/agent/read/vault.",
    hint: "file works on directories too: file /home/agent/read/vault",
    xp: 10,
    setup: { dirs: ["/home/agent/read/vault"] },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault\\s*$" },
      { type: "outputContains", text: "directory" },
    ],
  },
  {
    id: "read-39",
    zone: 2,
    title: "Nothing Here",
    briefing:
      "An empty file sits in the vault, zero bytes of nothing. Confirm it is exactly as empty as it looks.",
    task: "Identify the file type of /home/agent/read/vault/empty.txt.",
    hint: "file calls an empty file empty: file /home/agent/read/vault/empty.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/vault"],
      files: { "/home/agent/read/vault/empty.txt": "" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault/empty\\.txt" },
      { type: "outputContains", text: "empty" },
    ],
  },
  {
    id: "read-40",
    zone: 2,
    title: "A Script in Disguise",
    briefing:
      "run.sh opens with a shebang line. That makes it a script, not a plain text file, and scripts get executed. Know what you are holding.",
    task: "Identify the file type of /home/agent/read/vault/run.sh.",
    hint: "file spots the shebang: file /home/agent/read/vault/run.sh",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/vault"],
      files: { "/home/agent/read/vault/run.sh": "#!/bin/sh\necho sweeping\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault/run\\.sh" },
      { type: "outputContains", text: "script" },
    ],
  },
  {
    id: "read-41",
    zone: 2,
    title: "Honestly Executable",
    briefing:
      "agent.bin does not pretend to be text. Its first bytes spell ELF, the signature of a real executable. Confirm it.",
    task: "Identify the file type of /home/agent/read/vault/agent.bin.",
    hint: "file reads magic bytes: file /home/agent/read/vault/agent.bin",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/vault"],
      files: { "/home/agent/read/vault/agent.bin": "\u007fELFheader-bytes-here" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault/agent\\.bin" },
      { type: "outputContains", text: "ELF" },
    ],
  },
  {
    id: "read-42",
    zone: 2,
    title: "Sort the Whole Vault",
    briefing:
      "Three files, three stories: one text, one binary, one empty. Identify all of them with a single command.",
    task: "Run file on every file in /home/agent/read/vault2.",
    hint: "file takes a glob: file /home/agent/read/vault2/*",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/vault2"],
      files: {
        "/home/agent/read/vault2/memo.txt": "plain words\n",
        "/home/agent/read/vault2/junk.bin": "junk\u00a0",
        "/home/agent/read/vault2/blank.txt": "",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bfile\\s+/home/agent/read/vault2/\\*" },
      { type: "outputContains", text: "ASCII text" },
    ],
  },
  {
    id: "read-43",
    zone: 2,
    title: "Line Ledger",
    briefing:
      "The timeline reconstruction has fourteen entries, or so AXIOM claims. Count the lines and check the claim.",
    task: "Count the lines in /home/agent/read/reports/timeline.txt.",
    hint: "wc -l counts lines: wc -l /home/agent/read/reports/timeline.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: { "/home/agent/read/reports/timeline.txt": L(1, 14, (n) => `t${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-l\\s+/home/agent/read/reports/timeline\\.txt" },
      { type: "outputContains", text: "14" },
    ],
  },
  {
    id: "read-44",
    zone: 2,
    title: "Count the Words Again",
    briefing:
      "The shift memo is short. AXIOM wants an exact word count for the report, because AXIOM is like that.",
    task: "Count the words in /home/agent/read/reports/memo2.txt.",
    hint: "wc -w counts words: wc -w /home/agent/read/reports/memo2.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: { "/home/agent/read/reports/memo2.txt": "Shift change at 06:00. Station quiet. All decks report.\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-w\\s+/home/agent/read/reports/memo2\\.txt" },
      { type: "outputContains", text: "9" },
    ],
  },
  {
    id: "read-45",
    zone: 2,
    title: "Exact Byte Count",
    briefing:
      "The uplink token must be exactly fifteen bytes. One byte off and the relay rejects it. Measure it.",
    task: "Show the size of /home/agent/read/comms/token.txt in bytes.",
    hint: "wc -c counts bytes exactly: wc -c /home/agent/read/comms/token.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/token.txt": "TOKEN-7F3A-2210" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\b[^\\n]*-[A-Za-z]*c\\s+/home/agent/read/comms/token\\.txt" },
      { type: "outputContains", text: "15" },
    ],
  },
  {
    id: "read-46",
    zone: 2,
    title: "Character Ledger",
    briefing:
      "The callsign file holds one line. Count its characters, newline included, and log the number.",
    task: "Count the characters in /home/agent/read/comms/callsign.txt.",
    hint: "wc -m counts characters: wc -m /home/agent/read/comms/callsign.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/callsign.txt": "callsign=ODYSSEY\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-m\\s+/home/agent/read/comms/callsign\\.txt" },
      { type: "outputContains", text: "17" },
    ],
  },
  {
    id: "read-47",
    zone: 2,
    title: "The Full Stats",
    briefing:
      "AXIOM wants the full picture on the brief log: lines, words, bytes, everything. One command gives all three.",
    task: "Show full wc stats for /home/agent/read/logs/brief.log.",
    hint: "bare wc prints lines, words, and bytes: wc /home/agent/read/logs/brief.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/brief.log": L(1, 6, (n) => `brief ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*wc\\s+/home/agent/read/logs/brief\\.log" },
      { type: "outputContains", text: "brief.log" },
    ],
  },
  {
    id: "read-48",
    zone: 2,
    title: "Count From the Pipe",
    briefing:
      "The hits log is already flowing through your terminal. Count its lines without naming the file twice.",
    task: "Count the lines of /home/agent/read/logs/hits.log by piping cat into wc -l.",
    hint: "pipes chain readers: cat /home/agent/read/logs/hits.log | wc -l",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/hits.log": L(1, 11, (n) => `hit ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-l\\b" },
      { type: "outputContains", text: "11" },
    ],
  },
  {
    id: "read-49",
    zone: 2,
    title: "Three Pages, One Read",
    briefing:
      "The incident report was split across three pages. Read them back as one document, in order.",
    task: "Display /home/agent/read/reports/part1.txt, part2.txt, and part3.txt together in one command, in order.",
    hint: "cat joins files in the order you list them: cat /home/agent/read/reports/part1.txt /home/agent/read/reports/part2.txt /home/agent/read/reports/part3.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: {
        "/home/agent/read/reports/part1.txt": "Report page 1: airlock cycled at 03:12.\n",
        "/home/agent/read/reports/part2.txt": "Report page 2: camera loop engaged at 03:13.\n",
        "/home/agent/read/reports/part3.txt": "Report page 3: intruder reached the relay room.\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "cat\\s+/home/agent/read/reports/part1\\.txt\\s+/home/agent/read/reports/part2\\.txt\\s+/home/agent/read/reports/part3\\.txt" },
      { type: "outputContains", text: "relay room" },
    ],
  },
  {
    id: "read-50",
    zone: 2,
    title: "Read the Whole Stack",
    briefing:
      "Three memos, one stack. Read them all with a single glob instead of typing three names.",
    task: "Display every memo in /home/agent/read/notes/memo_*.txt at once.",
    hint: "cat takes a glob: cat /home/agent/read/notes/memo_*.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/notes"],
      files: {
        "/home/agent/read/notes/memo_a.txt": "memo A: dock quiet\n",
        "/home/agent/read/notes/memo_b.txt": "memo B: relay humming\n",
        "/home/agent/read/notes/memo_c.txt": "memo C: intruder in vent shaft\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+/home/agent/read/notes/memo_\\*\\.txt" },
      { type: "outputContains", text: "vent shaft" },
    ],
  },
  {
    id: "read-51",
    zone: 2,
    title: "Number the Evidence",
    briefing:
      "Five lines of evidence, and AXIOM wants each one numbered for the report. Number them as you read.",
    task: "Display /home/agent/read/reports/evidence.txt with line numbers.",
    hint: "cat -n numbers every line: cat -n /home/agent/read/reports/evidence.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: {
        "/home/agent/read/reports/evidence.txt":
          "boot sequence nominal\nrelay handshake ok\nintruder fingerprint found\ncamera loop engaged\nairlock forced\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+-n\\s+/home/agent/read/reports/evidence\\.txt" },
      { type: "outputContains", text: "intruder fingerprint" },
    ],
  },
  {
    id: "read-52",
    zone: 2,
    title: "Trailing Ghosts",
    briefing:
      "The config looks clean, but the parser disagrees. Invisible trailing spaces are haunting it. Expose every line ending.",
    task: "Display /home/agent/read/hidden/trailing.txt with all hidden characters revealed.",
    hint: "cat -A marks each line end with $: cat -A /home/agent/read/hidden/trailing.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/hidden"],
      files: { "/home/agent/read/hidden/trailing.txt": "config line one   \nconfig line two\nconfig line three  \n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\b[^\\n]*-[A-Za-z]*A\\s+/home/agent/read/hidden/trailing\\.txt" },
      { type: "outputContains", text: "$" },
    ],
  },
  {
    id: "read-53",
    zone: 2,
    title: "Tabs Exposed",
    briefing:
      "This two-column file uses tabs, or spaces, and nobody will admit which. Settle it: reveal the tabs.",
    task: "Display /home/agent/read/hidden/tabbed.txt with all hidden characters revealed.",
    hint: "cat -A shows tabs as ^I: cat -A /home/agent/read/hidden/tabbed.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/hidden"],
      files: { "/home/agent/read/hidden/tabbed.txt": "name\tvalue\npath\t/deck/c\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\b[^\\n]*-[A-Za-z]*A\\s+/home/agent/read/hidden/tabbed\\.txt" },
      { type: "outputContains", text: "^I" },
    ],
  },
  {
    id: "read-54",
    zone: 2,
    title: "The Older Pager",
    briefing:
      "The protocol doc is long enough to deserve a pager. Open it the old-fashioned way, with more.",
    task: "Open /home/agent/read/manuals/protocol.txt in the more pager.",
    hint: "more pages a file: more /home/agent/read/manuals/protocol.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/manuals"],
      files: { "/home/agent/read/manuals/protocol.txt": "protocol line 1\nprotocol line 2\n" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*more\\s+/home/agent/read/manuals/protocol\\.txt" }],
  },
  {
    id: "read-55",
    zone: 2,
    title: "Page the Procedures",
    briefing:
      "Emergency procedures, two calm lines of them. Page through with less.",
    task: "Open /home/agent/read/manuals/procedures.txt in the less pager.",
    hint: "less pages a file: less /home/agent/read/manuals/procedures.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/manuals"],
      files: { "/home/agent/read/manuals/procedures.txt": "step one: stay calm\nstep two: read the log\n" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*less\\s+/home/agent/read/manuals/procedures\\.txt" }],
  },
  {
    id: "read-56",
    zone: 2,
    title: "Fifteen Lines of Night",
    briefing:
      "The second drill log runs thirty entries. Read the first half and tell AXIOM how the drill began.",
    task: "Show the first 15 lines of /home/agent/read/logs/drill2.log.",
    hint: "head -n 15 takes the top fifteen: head -n 15 /home/agent/read/logs/drill2.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/drill2.log": L(1, 30, (n) => `drill2 line ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+15\\b" },
      { type: "outputContains", text: "drill2 line 15" },
    ],
  },
  {
    id: "read-57",
    zone: 2,
    title: "Twenty Lines of Dawn",
    briefing:
      "Same drill log, other end. The last twenty entries cover the part where the drill stopped being a drill.",
    task: "Show the last 20 lines of /home/agent/read/logs/drill2.log.",
    hint: "tail -n 20 takes the bottom twenty: tail -n 20 /home/agent/read/logs/drill2.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/drill2.log": L(1, 30, (n) => `drill2 line ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+20\\b" },
      { type: "outputContains", text: "drill2 line 30" },
    ],
  },
  {
    id: "read-58",
    zone: 2,
    title: "Skip the Title Line",
    briefing:
      "The shift notes open with a title line, then the real entries. Start reading at line two.",
    task: "Display /home/agent/read/notes/shift.txt starting from line 2.",
    hint: "tail -n +2 starts at line two: tail -n +2 /home/agent/read/notes/shift.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/notes"],
      files: {
        "/home/agent/read/notes/shift.txt": "shift notes, do not lose\n08:00 handover complete\n20:00 patrol deck B\n03:12 incident, deck C\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b[^\\n]*\\+2" },
      { type: "outputContains", text: "handover" },
    ],
  },
  {
    id: "read-59",
    zone: 2,
    title: "All But the Last",
    briefing:
      "The ping log's final line is a timeout, not data. Print the log without it.",
    task: "Print /home/agent/read/logs/pings.log without its last line.",
    hint: "head -n -1 drops the final line: head -n -1 /home/agent/read/logs/pings.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/pings.log": L(1, 5, (n) => `ping ${p2(n)} ok`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+-1" },
      { type: "outputContains", text: "ping 04 ok" },
    ],
  },
  {
    id: "read-60",
    zone: 2,
    title: "A Packed Surprise",
    briefing:
      "bundle.tar sits in the vault with no label. Archives have a signature. Ask file what this one really is.",
    task: "Identify the file type of /home/agent/read/vault/bundle.tar.",
    hint: "file recognizes archives: file /home/agent/read/vault/bundle.tar",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/vault"],
      files: { "/home/agent/read/vault/bundle.tar": "NXSTAR1\n{\"files\":[\"a\"]}\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault/bundle\\.tar" },
      { type: "outputContains", text: "tar archive" },
    ],
  },
  {
    id: "read-61",
    zone: 2,
    title: "Both Files Counted",
    briefing:
      "Two audit logs, one command. Count the lines in both and let the total line do the addition for you.",
    task: "Show line counts for /home/agent/read/logs/audit_a.log and /home/agent/read/logs/audit_b.log together.",
    hint: "wc counts every file you hand it: wc -l /home/agent/read/logs/audit_a.log /home/agent/read/logs/audit_b.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: {
        "/home/agent/read/logs/audit_a.log": L(1, 4, (n) => `a${n}`),
        "/home/agent/read/logs/audit_b.log": L(1, 6, (n) => `b${n}`),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-l\\s+/home/agent/read/logs/audit_a\\.log" },
      { type: "outputContains", text: "total" },
    ],
  },
  {
    id: "read-62",
    zone: 2,
    title: "Bytes of Two",
    briefing:
      "Two packet captures, and the uplink cares about bytes. Weigh both at once.",
    task: "Show byte counts for /home/agent/read/comms/pack_a.bin and /home/agent/read/comms/pack_b.bin together.",
    hint: "wc -c weighs every file you hand it: wc -c /home/agent/read/comms/pack_a.bin /home/agent/read/comms/pack_b.bin",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: {
        "/home/agent/read/comms/pack_a.bin": "PACKETA",
        "/home/agent/read/comms/pack_b.bin": "PACKETB12",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-c\\s+/home/agent/read/comms/pack_a\\.bin" },
      { type: "outputContains", text: "total" },
    ],
  },
  {
    id: "read-63",
    zone: 2,
    title: "The Short List",
    briefing:
      "Six crew on the roster, but AXIOM only needs the first four names. Read the top of the list.",
    task: "Show the first 4 lines of /home/agent/read/notes/roster.txt.",
    hint: "head -n 4 takes the top four: head -n 4 /home/agent/read/notes/roster.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/notes"],
      files: {
        "/home/agent/read/notes/roster.txt": "Reyes, comms\nOkafor, engineering\nVex, security\nLindqvist, medic\nMarsh, pilot\nIbarra, science\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+4\\b" },
      { type: "outputContains", text: "Lindqvist" },
    ],
  },
  {
    id: "read-64",
    zone: 2,
    title: "The Long Goodbye",
    briefing:
      "Same roster, other end. The last four names are the night shift. Read them.",
    task: "Show the last 4 lines of /home/agent/read/notes/roster.txt.",
    hint: "tail -n 4 takes the bottom four: tail -n 4 /home/agent/read/notes/roster.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/read/notes"],
      files: {
        "/home/agent/read/notes/roster.txt": "Reyes, comms\nOkafor, engineering\nVex, security\nLindqvist, medic\nMarsh, pilot\nIbarra, science\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+4\\b" },
      { type: "outputContains", text: "Ibarra" },
    ],
  },
  {
    id: "read-65",
    zone: 2,
    title: "Middle of the Night",
    briefing:
      "Lines 11 through 15 of the night log cover the quiet hour before everything broke. Slice exactly that window.",
    task: "Print lines 11 to 15 of /home/agent/read/logs/night2.log.",
    hint: "head takes the top, tail trims it: head -n 15 /home/agent/read/logs/night2.log | tail -n 5",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night2.log": L(1, 30, (n) => `log line ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+15\\b" },
      { type: "outputContains", text: "log line 15" },
    ],
  },
  {
    id: "read-66",
    zone: 2,
    title: "The Missing Middle",
    briefing:
      "Ten lines in, two junk lines at each end. Cut the first two and the last two, and read what survives.",
    task: "Print /home/agent/read/logs/night3.log without its first 2 or last 2 lines.",
    hint: "tail skips the start, head drops the end: tail -n +3 /home/agent/read/logs/night3.log | head -n -2",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night3.log": L(1, 10, (n) => `line ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b[^\\n]*\\+3" },
      { type: "outputContains", text: "line 08" },
    ],
  },
  {
    id: "read-67",
    zone: 2,
    title: "Byte Window",
    briefing:
      "The serial file is twenty bytes, no newline. The useful half is the second one. Carve out the last ten bytes.",
    task: "Show the last 10 bytes of /home/agent/read/comms/serial.txt.",
    hint: "head takes bytes, tail trims them: head -c 20 /home/agent/read/comms/serial.txt | tail -c 10",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/serial.txt": "0123456789ABCDEFGHIJ" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-c\\s+10\\b" },
      { type: "outputContains", text: "ABCDEFGHIJ" },
    ],
  },
  {
    id: "read-68",
    zone: 2,
    title: "Identify Then Read",
    briefing:
      "Two files in vault3: one locked blob, one letter. Identify the blob, then read the letter. In that order.",
    task: "Run file on /home/agent/read/vault3/lock.bin, then display /home/agent/read/vault3/letter.txt.",
    hint: "two commands, in order: file /home/agent/read/vault3/lock.bin, then cat /home/agent/read/vault3/letter.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/vault3"],
      files: {
        "/home/agent/read/vault3/lock.bin": "\u00a0blob-1",
        "/home/agent/read/vault3/letter.txt": "Dear crew: the relay password was never changed.\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault3/lock\\.bin" },
      { type: "outputContains", text: "relay password" },
    ],
  },
  {
    id: "read-69",
    zone: 2,
    title: "Lines and Words",
    briefing:
      "One memo, two numbers. Get its line count and word count together, and skip the byte count.",
    task: "Show line and word counts for /home/agent/read/reports/memo3.txt.",
    hint: "wc flags combine: wc -lw /home/agent/read/reports/memo3.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: { "/home/agent/read/reports/memo3.txt": "The intruder came through the vents at 03:12 and left through the airlock.\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-lw\\s+/home/agent/read/reports/memo3\\.txt" },
      { type: "outputContains", text: "13" },
    ],
  },
  {
    id: "read-70",
    zone: 2,
    title: "The Word Ledger",
    briefing:
      "Two lines, twelve words, if AXIOM's arithmetic holds. Count the words and check.",
    task: "Count the words in /home/agent/read/reports/memo4.txt.",
    hint: "wc -w counts words: wc -w /home/agent/read/reports/memo4.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: { "/home/agent/read/reports/memo4.txt": "First line has five words here.\nSecond line also has five words.\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-w\\s+/home/agent/read/reports/memo4\\.txt" },
      { type: "outputContains", text: "12" },
    ],
  },
  {
    id: "read-71",
    zone: 2,
    title: "Unified Context",
    briefing:
      "The network config changed by one address. Show the unified diff so the change sits in its context.",
    task: "Show a unified diff between /home/agent/read/config/net_old.conf and /home/agent/read/config/net_new.conf.",
    hint: "diff -u prints unified format: diff -u /home/agent/read/config/net_old.conf /home/agent/read/config/net_new.conf",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/net_old.conf": "iface=eth0\naddr=10.0.0.5\ngw=10.0.0.1\ndns=10.0.0.1\n",
        "/home/agent/read/config/net_new.conf": "iface=eth0\naddr=10.0.0.9\ngw=10.0.0.1\ndns=10.0.0.1\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bdiff\\s+-u\\s+/home/agent/read/config/net_old\\.conf" },
      { type: "outputContains", text: "@@" },
    ],
  },
  {
    id: "read-72",
    zone: 2,
    title: "Changed Only the Key",
    briefing:
      "The API key was rotated during the breach, or stolen. Either way, diff the two key files and read the new value.",
    task: "Show the differences between /home/agent/read/config/key_old.conf and /home/agent/read/config/key_new.conf.",
    hint: "diff shows the changed line: diff /home/agent/read/config/key_old.conf /home/agent/read/config/key_new.conf",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/key_old.conf": "api_key=AAAA\n",
        "/home/agent/read/config/key_new.conf": "api_key=ZZZZ\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/key_old\\.conf" },
      { type: "outputContains", text: "ZZZZ" },
    ],
  },
  {
    id: "read-73",
    zone: 2,
    title: "The Numbered Slice",
    briefing:
      "Line 21 of the night log names the intruder's hour. Print lines 20 through 22 with numbers, so the citation is exact.",
    task: "Display lines 20 to 22 of /home/agent/read/logs/night4.log with line numbers.",
    hint: "number it, take the top, trim the tail: cat -n /home/agent/read/logs/night4.log | head -n 22 | tail -n 3",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: {
        "/home/agent/read/logs/night4.log": L(1, 22, (n) => (n === 21 ? "21 intruder at 03:12, deck C" : `${p2(n)} quiet`)),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+-n\\b" },
      { type: "outputContains", text: "intruder at 03:12" },
    ],
  },
  {
    id: "read-74",
    zone: 2,
    title: "Every Line Ends",
    briefing:
      "Three lines, three endings. Prove every line in this file actually terminates by revealing the markers.",
    task: "Display /home/agent/read/hidden/ends.txt with all hidden characters revealed.",
    hint: "cat -A marks each line end with $: cat -A /home/agent/read/hidden/ends.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/hidden"],
      files: { "/home/agent/read/hidden/ends.txt": "alpha\nbeta\ngamma\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+-A\\s+/home/agent/read/hidden/ends\\.txt" },
      { type: "outputContains", text: "gamma$" },
    ],
  },
  {
    id: "read-75",
    zone: 2,
    title: "Three Generations",
    briefing:
      "relay_a and relay_c are two generations apart: different port, different mode. Diff the oldest against the newest.",
    task: "Show the differences between /home/agent/read/config/relay_a.conf and /home/agent/read/config/relay_c.conf.",
    hint: "diff the first and the third: diff /home/agent/read/config/relay_a.conf /home/agent/read/config/relay_c.conf",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/relay_a.conf": "host=10.0.0.2\nport=22\nmode=auto\n",
        "/home/agent/read/config/relay_c.conf": "host=10.0.0.2\nport=2222\nmode=manual\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/relay_a\\.conf" },
      { type: "outputContains", text: "manual" },
    ],
  },
  {
    id: "read-76",
    zone: 2,
    title: "What Changed Twice",
    briefing:
      "Three relay configs, two edits between them. Diff a against b, then b against c, and watch the story unfold.",
    task: "Diff relay_a.conf against relay_b.conf, then relay_b.conf against relay_c.conf.",
    hint: "two diffs, in order: diff /home/agent/read/config/relay_a.conf /home/agent/read/config/relay_b.conf, then diff /home/agent/read/config/relay_b.conf /home/agent/read/config/relay_c.conf",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/relay_a.conf": "host=10.0.0.2\nport=22\nmode=auto\n",
        "/home/agent/read/config/relay_b.conf": "host=10.0.0.2\nport=2222\nmode=auto\n",
        "/home/agent/read/config/relay_c.conf": "host=10.0.0.2\nport=2222\nmode=manual\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\b" },
      { type: "outputContains", text: "manual" },
    ],
  },
  {
    id: "read-77",
    zone: 2,
    title: "The Longest Memo",
    briefing:
      "Three memos, and one of them rambles. Count the words in all three at once and let the total settle it.",
    task: "Show word counts for all three memos in /home/agent/read/memos.",
    hint: "wc -w takes a glob: wc -w /home/agent/read/memos/*.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/memos"],
      files: {
        "/home/agent/read/memos/m1.txt": "m1 one\nm1 two\nm1 three\n",
        "/home/agent/read/memos/m2.txt": L(1, 8, (n) => `m2 word${n}`),
        "/home/agent/read/memos/m3.txt": L(1, 5, (n) => `m3 word${n}`),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-w\\s+/home/agent/read/memos/\\*\\.txt" },
      { type: "outputContains", text: "total" },
    ],
  },
  {
    id: "read-78",
    zone: 2,
    title: "Paging the Long Manual",
    briefing:
      "The long manual is twenty-five lines of procedure. Open it in the pager and scroll like you mean it.",
    task: "Open /home/agent/read/manuals/long_manual.txt in the less pager.",
    hint: "less pages a file: less /home/agent/read/manuals/long_manual.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/manuals"],
      files: { "/home/agent/read/manuals/long_manual.txt": L(1, 25, (n) => `manual line ${p2(n)}`) },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*less\\s+/home/agent/read/manuals/long_manual\\.txt" }],
  },
  {
    id: "read-79",
    zone: 2,
    title: "More of the Same",
    briefing:
      "The field guide is another long read. Page through it with more, the pager your grandfather used.",
    task: "Open /home/agent/read/manuals/field_guide.txt in the more pager.",
    hint: "more pages a file: more /home/agent/read/manuals/field_guide.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/manuals"],
      files: { "/home/agent/read/manuals/field_guide.txt": "guide line 1\nguide line 2\nguide line 3\n" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*more\\s+/home/agent/read/manuals/field_guide\\.txt" }],
  },
  {
    id: "read-80",
    zone: 2,
    title: "Read Every Fragment",
    briefing:
      "The breach narrative arrived in fragments. Read every fragment file as one stream, in glob order.",
    task: "Display all fragment logs in /home/agent/read/frags at once.",
    hint: "cat takes a glob: cat /home/agent/read/frags/*.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/frags"],
      files: {
        "/home/agent/read/frags/f1.log": "fragment one: breach at 03:12\n",
        "/home/agent/read/frags/f2.log": "fragment two: cameras looped\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+/home/agent/read/frags/\\*\\.log" },
      { type: "outputContains", text: "cameras looped" },
    ],
  },
  {
    id: "read-81",
    zone: 2,
    title: "Head of the Pack",
    briefing:
      "Three small logs, and you want the top three lines of each. Head handles many files, and labels each one.",
    task: "Show the first 3 lines of every .log file in /home/agent/read/logs/headpack.",
    hint: "head labels each file it reads: head -n 3 /home/agent/read/logs/headpack/*.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs/headpack"],
      files: {
        "/home/agent/read/logs/headpack/h1.log": "h1 a\nh1 b\n",
        "/home/agent/read/logs/headpack/h2.log": "h2 a\nh2 b\n",
        "/home/agent/read/logs/headpack/h3.log": "h3 a\nh3 b\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+3\\s+/home/agent/read/logs/headpack/\\*\\.log" },
      { type: "outputContains", text: "==>" },
    ],
  },
  {
    id: "read-82",
    zone: 2,
    title: "Tail Follows Suit",
    briefing:
      "Two logs, bottom two lines each. Tail labels its work too, so you can tell the endings apart.",
    task: "Show the last 2 lines of every .log file in /home/agent/read/logs/tailpack.",
    hint: "tail labels each file it reads: tail -n 2 /home/agent/read/logs/tailpack/*.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs/tailpack"],
      files: {
        "/home/agent/read/logs/tailpack/t1.log": "t1 x\nt1 y\nt1 z\n",
        "/home/agent/read/logs/tailpack/t2.log": "t2 x\nt2 y\nt2 z\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+2\\s+/home/agent/read/logs/tailpack/\\*\\.log" },
      { type: "outputContains", text: "==>" },
    ],
  },
  {
    id: "read-83",
    zone: 2,
    title: "First of Many Bytes",
    briefing:
      "The dump file is noise with a START marker up front. Read the first hundred bytes and confirm it.",
    task: "Show the first 100 bytes of /home/agent/read/comms/dump.txt.",
    hint: "head -c limits by bytes: head -c 100 /home/agent/read/comms/dump.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/dump.txt": "START" + rep("0123456789", 19) + "END" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-c\\s+100\\b" },
      { type: "outputContains", text: "START" },
    ],
  },
  {
    id: "read-84",
    zone: 2,
    title: "Last of Many Bytes",
    briefing:
      "Same idea, other end: a FINISH marker hides in the last hundred bytes of the second dump. Read the tail of the bytes.",
    task: "Show the last 100 bytes of /home/agent/read/comms/dump2.txt.",
    hint: "tail -c limits by bytes: tail -c 100 /home/agent/read/comms/dump2.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/dump2.txt": rep("0123456789", 19) + "FINISH" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-c\\s+100\\b" },
      { type: "outputContains", text: "FINISH" },
    ],
  },
  {
    id: "read-85",
    zone: 2,
    title: "Empty Versus Full",
    briefing:
      "An empty config against a full one. Diff them and watch every line of the full file show up as an addition.",
    task: "Show the differences between /home/agent/read/config/empty.conf and /home/agent/read/config/full.conf.",
    hint: "diff against an empty file: diff /home/agent/read/config/empty.conf /home/agent/read/config/full.conf",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/empty.conf": "",
        "/home/agent/read/config/full.conf": "setting=on\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/empty\\.conf" },
      { type: "outputContains", text: "setting=on" },
    ],
  },
  {
    id: "read-86",
    zone: 2,
    title: "The Quiet Pair",
    briefing:
      "Two files that should match, and you want the quiet verdict. Ask diff -q and accept the silence.",
    task: "Use diff in quiet mode on /home/agent/read/config/pair_a.txt and /home/agent/read/config/pair_b.txt.",
    hint: "diff -q stays silent when files match: diff -q /home/agent/read/config/pair_a.txt /home/agent/read/config/pair_b.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/pair_a.txt": "same\n",
        "/home/agent/read/config/pair_b.txt": "same\n",
      },
    },
    verify: [{ type: "historyMatches", regex: "\\bdiff\\s+-q\\s+/home/agent/read/config/pair_a\\.txt" }],
  },
  {
    id: "read-87",
    zone: 2,
    title: "Word Ledger for Two",
    briefing:
      "Two memos, one word count each, plus a total. Weigh the words.",
    task: "Show word counts for /home/agent/read/memos/m1.txt and /home/agent/read/memos/m2.txt together.",
    hint: "wc -w counts every file you hand it: wc -w /home/agent/read/memos/m1.txt /home/agent/read/memos/m2.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/memos"],
      files: {
        "/home/agent/read/memos/m1.txt": "m1 one\nm1 two\nm1 three\n",
        "/home/agent/read/memos/m2.txt": L(1, 8, (n) => `m2 word${n}`),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-w\\s+/home/agent/read/memos/m1\\.txt" },
      { type: "outputContains", text: "total" },
    ],
  },
  {
    id: "read-88",
    zone: 2,
    title: "Byte Ledger for Two",
    briefing:
      "Two packet files, and bytes are the currency. Weigh both and read the total.",
    task: "Show byte counts for /home/agent/read/comms/p1.bin and /home/agent/read/comms/p2.bin together.",
    hint: "wc -c weighs every file you hand it: wc -c /home/agent/read/comms/p1.bin /home/agent/read/comms/p2.bin",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: {
        "/home/agent/read/comms/p1.bin": "AAAA",
        "/home/agent/read/comms/p2.bin": "BBBBBB",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-c\\s+/home/agent/read/comms/p1\\.bin" },
      { type: "outputContains", text: "total" },
    ],
  },
  {
    id: "read-89",
    zone: 2,
    title: "The Script Collection",
    briefing:
      "Two shell scripts sit in vault4. Confirm they are both scripts before anyone gets clever and runs them.",
    task: "Identify the file type of every .sh file in /home/agent/read/vault4.",
    hint: "file takes a glob: file /home/agent/read/vault4/*.sh",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/vault4"],
      files: {
        "/home/agent/read/vault4/clean.sh": "#!/bin/sh\necho ok\n",
        "/home/agent/read/vault4/boot.sh": "#!/bin/bash\necho boot\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bfile\\s+/home/agent/read/vault4/\\*\\.sh" },
      { type: "outputContains", text: "script" },
    ],
  },
  {
    id: "read-90",
    zone: 2,
    title: "Text Versus Data",
    briefing:
      "One readable note, one binary core dump. Run file across the pair and sort them.",
    task: "Identify the file type of every file in /home/agent/read/mixed2.",
    hint: "file takes a glob: file /home/agent/read/mixed2/*",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/mixed2"],
      files: {
        "/home/agent/read/mixed2/note.txt": "readable\n",
        "/home/agent/read/mixed2/core.bin": "\u00a0blob-2",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bfile\\s+/home/agent/read/mixed2/\\*" },
      { type: "outputContains", text: "data" },
    ],
  },
  {
    id: "read-91",
    zone: 2,
    title: "The Five Line Window",
    briefing:
      "Twenty lines of night, and the interesting five sit at lines 6 through 10. Cut that window out.",
    task: "Print lines 6 to 10 of /home/agent/read/logs/night5.log.",
    hint: "head takes the top, tail trims it: head -n 10 /home/agent/read/logs/night5.log | tail -n 5",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night5.log": L(1, 20, (n) => `n5 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+10\\b" },
      { type: "outputContains", text: "n5 10" },
    ],
  },
  {
    id: "read-92",
    zone: 2,
    title: "Skip Two, Take Three",
    briefing:
      "Twelve lines, and you want lines 3, 4, and 5. Skip two from the top, keep three.",
    task: "Print lines 3 to 5 of /home/agent/read/logs/night6.log.",
    hint: "tail skips the start, head keeps the rest: tail -n +3 /home/agent/read/logs/night6.log | head -n 3",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night6.log": L(1, 12, (n) => `n6 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b[^\\n]*\\+3" },
      { type: "outputContains", text: "n6 05" },
    ],
  },
  {
    id: "read-93",
    zone: 2,
    title: "Numbered Lines Five and Six",
    briefing:
      "Items five and six on the list are the ones AXIOM flagged. Print just those two, numbered.",
    task: "Display lines 5 and 6 of /home/agent/read/reports/numbered_long.txt with line numbers.",
    hint: "number it, take the top, trim the tail: cat -n /home/agent/read/reports/numbered_long.txt | head -n 6 | tail -n 2",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: { "/home/agent/read/reports/numbered_long.txt": L(1, 10, (n) => `item ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+-n\\b" },
      { type: "outputContains", text: "item 06" },
    ],
  },
  {
    id: "read-94",
    zone: 2,
    title: "Compare the Backups",
    briefing:
      "Two firewall backups, an hour apart. The unified diff will show exactly which rules moved.",
    task: "Show a unified diff between /home/agent/read/config/fw_v1.rules and /home/agent/read/config/fw_v2.rules.",
    hint: "diff -u prints the unified format: diff -u /home/agent/read/config/fw_v1.rules /home/agent/read/config/fw_v2.rules",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/fw_v1.rules": "ALLOW 443\nALLOW 80\nDENY 23\nLOG off\n",
        "/home/agent/read/config/fw_v2.rules": "ALLOW 443\nALLOW 8080\nDENY 23\nLOG on\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bdiff\\s+-u\\s+/home/agent/read/config/fw_v1\\.rules" },
      { type: "outputContains", text: "@@" },
    ],
  },
  {
    id: "read-95",
    zone: 2,
    title: "A Directory Full of Text",
    briefing:
      "Every file in textonly claims to be plain text. Trust, but verify, all of them at once.",
    task: "Identify the file type of every file in /home/agent/read/textonly.",
    hint: "file takes a glob: file /home/agent/read/textonly/*",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/textonly"],
      files: {
        "/home/agent/read/textonly/a.txt": "alpha\n",
        "/home/agent/read/textonly/b.txt": "beta\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bfile\\s+/home/agent/read/textonly/\\*" },
      { type: "outputContains", text: "ASCII text" },
    ],
  },
  {
    id: "read-96",
    zone: 2,
    title: "The Decoy Row",
    briefing:
      "Four files in vault5, three of them binary decoys. One is real text. Use file to expose which.",
    task: "Run file on every file in /home/agent/read/vault5 and find the text one.",
    hint: "file takes a glob: file /home/agent/read/vault5/*",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/vault5"],
      files: {
        "/home/agent/read/vault5/d1.dat": "\u00a0blob-1",
        "/home/agent/read/vault5/d2.dat": "\u00a0blob-2",
        "/home/agent/read/vault5/real.txt": "the code is 4417\n",
        "/home/agent/read/vault5/d3.dat": "\u00a0blob-3",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bfile\\s+/home/agent/read/vault5/\\*" },
      { type: "outputContains", text: "ASCII text" },
    ],
  },
  {
    id: "read-97",
    zone: 2,
    title: "The Second Half",
    briefing:
      "Twenty lines of night. Count them first, then read the second half.",
    task: "Count the lines of /home/agent/read/logs/night7.log, then show its last 10 lines.",
    hint: "count, then tail: wc -l /home/agent/read/logs/night7.log, then tail -n 10 /home/agent/read/logs/night7.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night7.log": L(1, 20, (n) => `n7 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+10\\b" },
      { type: "outputContains", text: "n7 20" },
    ],
  },
  {
    id: "read-98",
    zone: 2,
    title: "The First Half Too",
    briefing:
      "Same log, first half this time. You already know it is twenty lines. Read the top ten.",
    task: "Count the lines of /home/agent/read/logs/night7.log, then show its first 10 lines.",
    hint: "count, then head: wc -l /home/agent/read/logs/night7.log, then head -n 10 /home/agent/read/logs/night7.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night7.log": L(1, 20, (n) => `n7 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+10\\b" },
      { type: "outputContains", text: "n7 10" },
    ],
  },
  {
    id: "read-99",
    zone: 2,
    title: "Before the Footer",
    briefing:
      "Fifteen lines, and the last five are a corrupted footer. Print everything above the garbage.",
    task: "Print /home/agent/read/logs/night8.log without its last 5 lines.",
    hint: "head -n -5 drops the last five: head -n -5 /home/agent/read/logs/night8.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night8.log": L(1, 15, (n) => `n8 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+-5" },
      { type: "outputContains", text: "n8 10" },
    ],
  },
  {
    id: "read-100",
    zone: 2,
    title: "The Scattered Confession",
    briefing:
      "Ten files in vault6, five of them binary decoys. Find the five text files with file, then cat them in one command, c1 through c5. The vault code is in there.",
    task: "Identify the text files in /home/agent/read/vault6 with file, then display c1.txt through c5.txt at once.",
    hint: "file /home/agent/read/vault6/* finds the text files, then: cat /home/agent/read/vault6/c1.txt /home/agent/read/vault6/c2.txt /home/agent/read/vault6/c3.txt /home/agent/read/vault6/c4.txt /home/agent/read/vault6/c5.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/vault6"],
      files: {
        "/home/agent/read/vault6/b1.dat": "\u00a0blob-1",
        "/home/agent/read/vault6/b2.dat": "\u00a0blob-2",
        "/home/agent/read/vault6/c1.txt": "the vault code\n",
        "/home/agent/read/vault6/c2.txt": "is 7-7-3-9.\n",
        "/home/agent/read/vault6/c3.txt": "burn after reading.\n",
        "/home/agent/read/vault6/b3.dat": "\u00a0blob-3",
        "/home/agent/read/vault6/c4.txt": "AXIOM was here.\n",
        "/home/agent/read/vault6/c5.txt": "tell no one.\n",
        "/home/agent/read/vault6/b4.dat": "\u00a0blob-4",
        "/home/agent/read/vault6/b5.dat": "\u00a0blob-5",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault6/\\*" },
      { type: "outputContains", text: "7-7-3-9" },
    ],
  },
  {
    id: "read-101",
    zone: 2,
    title: "Reconstruct the Timeline",
    briefing:
      "Three timestamped fragments, scattered out of order on disk. Read them in timeline order: t1, t2, t3.",
    task: "Display /home/agent/read/timeline/t1.txt, t2.txt, and t3.txt together in order.",
    hint: "cat joins files in the order you list them: cat /home/agent/read/timeline/t1.txt /home/agent/read/timeline/t2.txt /home/agent/read/timeline/t3.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/timeline"],
      files: {
        "/home/agent/read/timeline/t1.txt": "03:10 cameras nominal\n",
        "/home/agent/read/timeline/t2.txt": "03:12 airlock forced\n",
        "/home/agent/read/timeline/t3.txt": "03:14 relay dark\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "cat\\s+/home/agent/read/timeline/t1\\.txt\\s+/home/agent/read/timeline/t2\\.txt\\s+/home/agent/read/timeline/t3\\.txt" },
      { type: "outputContains", text: "relay dark" },
    ],
  },
  {
    id: "read-102",
    zone: 2,
    title: "The Window at 03:12",
    briefing:
      "Forty-five events, and the breach window sits at lines 40 through 45. Slice exactly that window and read what happened at 03:12.",
    task: "Print lines 40 to 45 of /home/agent/read/logs/incident.log.",
    hint: "head takes the top, tail trims it: head -n 45 /home/agent/read/logs/incident.log | tail -n 6",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: {
        "/home/agent/read/logs/incident.log": L(1, 45, (n) =>
          n === 40 ? "evt 40 03:11:58 motion, deck C" :
          n === 41 ? "evt 41 03:12:00 airlock forced" :
          n === 42 ? "evt 42 03:12:03 camera loop engaged" :
          n === 43 ? "evt 43 03:12:20 relay went dark" :
          n === 44 ? "evt 44 03:13:01 trace started" :
          n === 45 ? "evt 45 03:14:00 station quiet" :
          `evt ${p2(n)}`),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+45\\b" },
      { type: "outputContains", text: "03:12:00" },
    ],
  },
  {
    id: "read-103",
    zone: 2,
    title: "Except the Edges",
    briefing:
      "Thirty lines of night, five junk lines at each end. Cut both edges and read the twenty that survive.",
    task: "Print /home/agent/read/logs/night9.log without its first 5 or last 5 lines.",
    hint: "tail skips the start, head drops the end: tail -n +6 /home/agent/read/logs/night9.log | head -n -5",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night9.log": L(1, 30, (n) => `n9 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b[^\\n]*\\+6" },
      { type: "outputContains", text: "n9 25" },
    ],
  },
  {
    id: "read-104",
    zone: 2,
    title: "Four Generations of Config",
    briefing:
      "gen1 is the original config, gen4 is what the intruder left behind. Show the unified diff across the drift.",
    task: "Show a unified diff between /home/agent/read/config/gen1.conf and /home/agent/read/config/gen4.conf.",
    hint: "diff -u shows the full drift: diff -u /home/agent/read/config/gen1.conf /home/agent/read/config/gen4.conf",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/gen1.conf": "v=1\nmode=auto\n",
        "/home/agent/read/config/gen4.conf": "v=4\nmode=lockdown\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bdiff\\s+-u\\s+/home/agent/read/config/gen1\\.conf" },
      { type: "outputContains", text: "lockdown" },
      { type: "outputContains", text: "@@" },
    ],
  },
  {
    id: "read-105",
    zone: 2,
    title: "The Byte-Exact Token",
    briefing:
      "The token is exactly thirty-two bytes, no newline. Read the last eight bytes, the part the relay actually checks.",
    task: "Show the last 8 bytes of /home/agent/read/comms/token32.txt.",
    hint: "take all thirty-two bytes, keep the last eight: head -c 32 /home/agent/read/comms/token32.txt | tail -c 8",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/token32.txt": "ABCDEFGHIJ0123456789abcdefghij12" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-c\\s+8\\b" },
      { type: "outputContains", text: "efghij12" },
    ],
  },
  {
    id: "read-106",
    zone: 2,
    title: "Numbered Evidence, Lines 50 to 52",
    briefing:
      "Sixty lines of notes, and line 51 is where the intruder signed the log. Print lines 50 through 52, numbered, for the citation.",
    task: "Display lines 50 to 52 of /home/agent/read/reports/longnote.txt with line numbers.",
    hint: "number it, take the top, trim the tail: cat -n /home/agent/read/reports/longnote.txt | head -n 52 | tail -n 3",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: {
        "/home/agent/read/reports/longnote.txt": L(1, 60, (n) => (n === 51 ? "note 51 the intruder signed the log" : `note ${p2(n)}`)),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+-n\\b" },
      { type: "outputContains", text: "intruder signed" },
    ],
  },
  {
    id: "read-107",
    zone: 2,
    title: "Every Hidden Character",
    briefing:
      "The credentials file mixes tabs and trailing spaces, and the parser hates both. Expose every hidden character.",
    task: "Display /home/agent/read/hidden/mixed.txt with all hidden characters revealed.",
    hint: "cat -A reveals tabs as ^I and marks each line end with $: cat -A /home/agent/read/hidden/mixed.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/hidden"],
      files: { "/home/agent/read/hidden/mixed.txt": "user\tadmin\npass\ts3cret  \nnote plain\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\b[^\\n]*-[A-Za-z]*A\\s+/home/agent/read/hidden/mixed\\.txt" },
      { type: "outputContains", text: "^I" },
    ],
  },
  {
    id: "read-108",
    zone: 2,
    title: "The Whole Vault Read",
    briefing:
      "Four files in vault7, two of them binary. Identify the pair, then read the two text files together.",
    task: "Run file on every file in /home/agent/read/vault7, then display a.txt and b.txt at once.",
    hint: "identify, then read: file /home/agent/read/vault7/*, then cat /home/agent/read/vault7/a.txt /home/agent/read/vault7/b.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/vault7"],
      files: {
        "/home/agent/read/vault7/x.bin": "\u00a0blob-1",
        "/home/agent/read/vault7/a.txt": "first: the airlock\n",
        "/home/agent/read/vault7/b.txt": "second: the cameras\n",
        "/home/agent/read/vault7/y.bin": "\u00a0blob-2",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/vault7/\\*" },
      { type: "outputContains", text: "the cameras" },
    ],
  },
  {
    id: "read-109",
    zone: 2,
    title: "Compare All Three",
    briefing:
      "Three revisions of the same config. Diff r1 against r2, then r1 against r3, and spot which value the intruder touched.",
    task: "Diff r1.conf against r2.conf, then r1.conf against r3.conf, in /home/agent/read/config.",
    hint: "two diffs: diff /home/agent/read/config/r1.conf /home/agent/read/config/r2.conf, then diff /home/agent/read/config/r1.conf /home/agent/read/config/r3.conf",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/r1.conf": "a=1\nb=2\n",
        "/home/agent/read/config/r2.conf": "a=1\nb=3\n",
        "/home/agent/read/config/r3.conf": "a=9\nb=3\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/r1\\.conf" },
      { type: "outputContains", text: "a=9" },
    ],
  },
  {
    id: "read-110",
    zone: 2,
    title: "The Biggest Log",
    briefing:
      "Three logs, three sizes. Count the lines in all of them at once. The longest one holds forty-two lines.",
    task: "Show line counts for every .log file in /home/agent/read/size_logs.",
    hint: "wc -l takes a glob and adds a total: wc -l /home/agent/read/size_logs/*.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/size_logs"],
      files: {
        "/home/agent/read/size_logs/s1.log": L(1, 12, (n) => `s1 ${p2(n)}`),
        "/home/agent/read/size_logs/s2.log": L(1, 42, (n) => `s2 ${p2(n)}`),
        "/home/agent/read/size_logs/s3.log": L(1, 7, (n) => `s3 ${n}`),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\s+-l\\s+/home/agent/read/size_logs/\\*\\.log" },
      { type: "outputContains", text: "42" },
    ],
  },
  {
    id: "read-111",
    zone: 2,
    title: "The Middle Third",
    briefing:
      "Thirty lines, three thirds. The middle third is lines 11 through 20. Cut it out.",
    task: "Print lines 11 to 20 of /home/agent/read/logs/night10.log.",
    hint: "head takes the top, tail trims it: head -n 20 /home/agent/read/logs/night10.log | tail -n 10",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night10.log": L(1, 30, (n) => `n10 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+20\\b" },
      { type: "outputContains", text: "n10 20" },
    ],
  },
  {
    id: "read-112",
    zone: 2,
    title: "Patch Notes",
    briefing:
      "The firewall patch rewrote three rules at once. The unified diff header tells you which files you are comparing. Read it.",
    task: "Show a unified diff between /home/agent/read/config/patch_old.conf and /home/agent/read/config/patch_new.conf.",
    hint: "diff -u prints --- and +++ headers: diff -u /home/agent/read/config/patch_old.conf /home/agent/read/config/patch_new.conf",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/patch_old.conf": "# firewall\nALLOW 22\nALLOW 80\n# end\n",
        "/home/agent/read/config/patch_new.conf": "# firewall\nALLOW 2222\nALLOW 8080\nALLOW 443\n# end\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bdiff\\s+-u\\s+/home/agent/read/config/patch_old\\.conf" },
      { type: "outputContains", text: "+++" },
    ],
  },
  {
    id: "read-113",
    zone: 2,
    title: "The Invisible Tab Stop",
    briefing:
      "Three clean-looking lines, one of them hiding a tab. Find the guilty line with cat -A.",
    task: "Display /home/agent/read/hidden/sneaky.txt with all hidden characters revealed.",
    hint: "cat -A shows tabs as ^I: cat -A /home/agent/read/hidden/sneaky.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/hidden"],
      files: { "/home/agent/read/hidden/sneaky.txt": "clean line\nsneaky\tline\nalso clean\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\b[^\\n]*-[A-Za-z]*A\\s+/home/agent/read/hidden/sneaky\\.txt" },
      { type: "outputContains", text: "^I" },
    ],
  },
  {
    id: "read-114",
    zone: 2,
    title: "The Mixed Vault",
    briefing:
      "A text file, a longer text file, and a binary decoy share a vault. Identify them all, weigh the text files, then read the bigger one.",
    task: "Run file on /home/agent/read/mixed3/*, weigh m1.txt and m2.txt with wc -c, then display the bigger file.",
    hint: "three commands: file /home/agent/read/mixed3/*, then wc -c /home/agent/read/mixed3/m1.txt /home/agent/read/mixed3/m2.txt, then cat /home/agent/read/mixed3/m2.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/mixed3"],
      files: {
        "/home/agent/read/mixed3/m1.txt": "alpha text\n",
        "/home/agent/read/mixed3/m2.txt": "beta text is longer here\n",
        "/home/agent/read/mixed3/d.bin": "\u00a0blob-3",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*file\\s+/home/agent/read/mixed3/\\*" },
      { type: "outputContains", text: "beta text is longer" },
    ],
  },
  {
    id: "read-115",
    zone: 2,
    title: "The Config Archaeologist",
    briefing:
      "Four generations of the same config, one step changed at a time. Diff each generation against the next and watch the drift accumulate.",
    task: "Diff arch1.conf against arch2.conf, arch2.conf against arch3.conf, and arch3.conf against arch4.conf, in /home/agent/read/config.",
    hint: "three diffs in order: diff /home/agent/read/config/arch1.conf /home/agent/read/config/arch2.conf, then diff /home/agent/read/config/arch2.conf /home/agent/read/config/arch3.conf, then diff /home/agent/read/config/arch3.conf /home/agent/read/config/arch4.conf",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/config"],
      files: {
        "/home/agent/read/config/arch1.conf": "step=1\n",
        "/home/agent/read/config/arch2.conf": "step=2\n",
        "/home/agent/read/config/arch3.conf": "step=3\n",
        "/home/agent/read/config/arch4.conf": "step=4\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*diff\\s+/home/agent/read/config/arch1\\.conf" },
      { type: "outputContains", text: "step=4" },
    ],
  },
  {
    id: "read-116",
    zone: 2,
    title: "Head, Tail, Head",
    briefing:
      "Twenty lines, and you want lines 8 through 10. Take ten from the top, keep three from the bottom of that.",
    task: "Print lines 8 to 10 of /home/agent/read/logs/night11.log.",
    hint: "head takes the top, tail trims it: head -n 10 /home/agent/read/logs/night11.log | tail -n 3",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night11.log": L(1, 20, (n) => `n11 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-n\\s+10\\b" },
      { type: "outputContains", text: "n11 10" },
    ],
  },
  {
    id: "read-117",
    zone: 2,
    title: "Tail, Head, Tail",
    briefing:
      "Same log, deeper cut: lines 15 through 17. Take six from the bottom, keep three from the top of that.",
    task: "Print lines 15 to 17 of /home/agent/read/logs/night11.log.",
    hint: "tail takes the bottom, head trims it: tail -n 6 /home/agent/read/logs/night11.log | head -n 3",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/night11.log": L(1, 20, (n) => `n11 ${p2(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+6\\b" },
      { type: "outputContains", text: "n11 17" },
    ],
  },
  {
    id: "read-118",
    zone: 2,
    title: "The Numbered Confession",
    briefing:
      "Forty lines of notes, and line 36 is a confession. Print lines 34 through 38, numbered, so nobody can claim a misquote.",
    task: "Display lines 34 to 38 of /home/agent/read/reports/confession.txt with line numbers.",
    hint: "number it, skip to 34, keep five: cat -n /home/agent/read/reports/confession.txt | tail -n +34 | head -n 5",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: {
        "/home/agent/read/reports/confession.txt": L(1, 40, (n) => (n === 36 ? "c36 I confess: I looped the cameras" : `c${p2(n)}`)),
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcat\\s+-n\\b" },
      { type: "outputContains", text: "I confess" },
    ],
  },
  {
    id: "read-119",
    zone: 2,
    title: "Binary or Text, Eight Files",
    briefing:
      "Eight files, half of them decoys. Run file across all eight and sort the honest text from the binary lies.",
    task: "Identify the file type of every file in /home/agent/read/vault8.",
    hint: "file takes a glob: file /home/agent/read/vault8/*",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/vault8"],
      files: {
        "/home/agent/read/vault8/t1.txt": "one\n",
        "/home/agent/read/vault8/b1.bin": "\u00a0blob-1",
        "/home/agent/read/vault8/t2.txt": "two\n",
        "/home/agent/read/vault8/b2.bin": "\u00a0blob-2",
        "/home/agent/read/vault8/t3.txt": "three\n",
        "/home/agent/read/vault8/b3.bin": "\u00a0blob-3",
        "/home/agent/read/vault8/t4.txt": "four\n",
        "/home/agent/read/vault8/b4.bin": "\u00a0blob-4",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bfile\\s+/home/agent/read/vault8/\\*" },
      { type: "outputContains", text: "ASCII text" },
      { type: "outputContains", text: "data" },
    ],
  },
  {
    id: "read-120",
    zone: 2,
    title: "The Truncated Read",
    briefing:
      "The serial file runs two hundred characters. You only get the first fifty. Read them.",
    task: "Show the first 50 bytes of /home/agent/read/comms/longserial.txt.",
    hint: "head -c limits by bytes: head -c 50 /home/agent/read/comms/longserial.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/longserial.txt": rep("0123456789", 20) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-c\\s+50\\b" },
      { type: "outputContains", text: "7890123456" },
    ],
  },
  {
    id: "read-121",
    zone: 2,
    title: "The Hundred Line Log",
    briefing:
      "One hundred entries, and the ending is the part that counts. Count them all, then read the last twenty-five.",
    task: "Count the lines of /home/agent/read/logs/biglog.log, then show its last 25 lines.",
    hint: "count, then tail: wc -l /home/agent/read/logs/biglog.log, then tail -n 25 /home/agent/read/logs/biglog.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/logs"],
      files: { "/home/agent/read/logs/biglog.log": L(1, 100, (n) => `entry ${p3(n)}`) },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\s+-n\\s+25\\b" },
      { type: "outputContains", text: "entry 100" },
    ],
  },
  {
    id: "read-122",
    zone: 2,
    title: "The Final Read",
    briefing:
      "The last three pages of the incident report. Read them as one document, in order, and close the file on this night.",
    task: "Display /home/agent/read/reports/final1.txt, final2.txt, and final3.txt together in order.",
    hint: "cat joins files in the order you list them: cat /home/agent/read/reports/final1.txt /home/agent/read/reports/final2.txt /home/agent/read/reports/final3.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: {
        "/home/agent/read/reports/final1.txt": "final page one: the station held\n",
        "/home/agent/read/reports/final2.txt": "final page two: the crew held\n",
        "/home/agent/read/reports/final3.txt": "final page three: AXIOM held the line\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "cat\\s+/home/agent/read/reports/final1\\.txt\\s+/home/agent/read/reports/final2\\.txt\\s+/home/agent/read/reports/final3\\.txt" },
      { type: "outputContains", text: "held the line" },
    ],
  },
  {
    id: "read-123",
    zone: 2,
    title: "Packet Window",
    briefing:
      "One hundred twenty bytes of packet, and the payload window sits at bytes 41 through 80. Carve it out.",
    task: "Show bytes 41 through 80 of /home/agent/read/comms/packet2.bin.",
    hint: "take eighty bytes, keep the last forty: head -c 80 /home/agent/read/comms/packet2.bin | tail -c 40",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/comms"],
      files: { "/home/agent/read/comms/packet2.bin": rep("0123456789", 12) },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\s+-c\\s+80\\b" },
      { type: "outputContains", text: "8901234567" },
    ],
  },
  {
    id: "read-124",
    zone: 2,
    title: "The Last Word",
    briefing:
      "You read the whole night. The epilogue is short. Read it, agent. You earned it.",
    task: "Display the full contents of /home/agent/read/reports/epilogue.txt.",
    hint: "cat prints a whole file: cat /home/agent/read/reports/epilogue.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/read/reports"],
      files: { "/home/agent/read/reports/epilogue.txt": "You read the whole night. The intruder left at 03:14. AXIOM nods. Case closed.\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*cat\\s+/home/agent/read/reports/epilogue\\.txt" },
      { type: "outputContains", text: "Case closed" },
    ],
  },
];

export const SOLUTIONS_READ_X: Record<string, string[]> = {
  "read-20": ["head /home/agent/read/logs/night.log"],
  "read-21": ["tail /home/agent/read/logs/night.log"],
  "read-22": ["head -n 1 /home/agent/read/logs/access.log"],
  "read-23": ["tail -n 1 /home/agent/read/logs/access.log"],
  "read-24": ["head -n 7 /home/agent/read/logs/radio.log"],
  "read-25": ["tail -n 12 /home/agent/read/logs/drill.log"],
  "read-26": ["tail -c 40 /home/agent/read/comms/burst.txt"],
  "read-27": ["head -c 30 /home/agent/read/comms/header.txt"],
  "read-28": ["tail -n +8 /home/agent/read/logs/sys.log"],
  "read-29": ["head -n -2 /home/agent/read/logs/trace.log"],
  "read-30": ["tail -n +2 /home/agent/read/comms/manifest.csv"],
  "read-31": ["diff /home/agent/read/config/relay_a.conf /home/agent/read/config/relay_b.conf"],
  "read-32": ["diff -q /home/agent/read/config/mode_a.conf /home/agent/read/config/mode_b.conf"],
  "read-33": ["diff -u /home/agent/read/config/fw_old.rules /home/agent/read/config/fw_new.rules"],
  "read-34": ["diff /home/agent/read/config/snap_a.txt /home/agent/read/config/snap_b.txt"],
  "read-35": ["diff /home/agent/read/config/app_a.conf /home/agent/read/config/app_b.conf"],
  "read-36": ["file /home/agent/read/vault/note.txt"],
  "read-37": ["file /home/agent/read/vault/blob.bin"],
  "read-38": ["file /home/agent/read/vault"],
  "read-39": ["file /home/agent/read/vault/empty.txt"],
  "read-40": ["file /home/agent/read/vault/run.sh"],
  "read-41": ["file /home/agent/read/vault/agent.bin"],
  "read-42": ["file /home/agent/read/vault2/*"],
  "read-43": ["wc -l /home/agent/read/reports/timeline.txt"],
  "read-44": ["wc -w /home/agent/read/reports/memo2.txt"],
  "read-45": ["wc -c /home/agent/read/comms/token.txt"],
  "read-46": ["wc -m /home/agent/read/comms/callsign.txt"],
  "read-47": ["wc /home/agent/read/logs/brief.log"],
  "read-48": ["cat /home/agent/read/logs/hits.log | wc -l"],
  "read-49": ["cat /home/agent/read/reports/part1.txt /home/agent/read/reports/part2.txt /home/agent/read/reports/part3.txt"],
  "read-50": ["cat /home/agent/read/notes/memo_*.txt"],
  "read-51": ["cat -n /home/agent/read/reports/evidence.txt"],
  "read-52": ["cat -A /home/agent/read/hidden/trailing.txt"],
  "read-53": ["cat -A /home/agent/read/hidden/tabbed.txt"],
  "read-54": ["more /home/agent/read/manuals/protocol.txt"],
  "read-55": ["less /home/agent/read/manuals/procedures.txt"],
  "read-56": ["head -n 15 /home/agent/read/logs/drill2.log"],
  "read-57": ["tail -n 20 /home/agent/read/logs/drill2.log"],
  "read-58": ["tail -n +2 /home/agent/read/notes/shift.txt"],
  "read-59": ["head -n -1 /home/agent/read/logs/pings.log"],
  "read-60": ["file /home/agent/read/vault/bundle.tar"],
  "read-61": ["wc -l /home/agent/read/logs/audit_a.log /home/agent/read/logs/audit_b.log"],
  "read-62": ["wc -c /home/agent/read/comms/pack_a.bin /home/agent/read/comms/pack_b.bin"],
  "read-63": ["head -n 4 /home/agent/read/notes/roster.txt"],
  "read-64": ["tail -n 4 /home/agent/read/notes/roster.txt"],
  "read-65": ["head -n 15 /home/agent/read/logs/night2.log | tail -n 5"],
  "read-66": ["tail -n +3 /home/agent/read/logs/night3.log | head -n -2"],
  "read-67": ["head -c 20 /home/agent/read/comms/serial.txt | tail -c 10"],
  "read-68": ["file /home/agent/read/vault3/lock.bin", "cat /home/agent/read/vault3/letter.txt"],
  "read-69": ["wc -lw /home/agent/read/reports/memo3.txt"],
  "read-70": ["wc -w /home/agent/read/reports/memo4.txt"],
  "read-71": ["diff -u /home/agent/read/config/net_old.conf /home/agent/read/config/net_new.conf"],
  "read-72": ["diff /home/agent/read/config/key_old.conf /home/agent/read/config/key_new.conf"],
  "read-73": ["cat -n /home/agent/read/logs/night4.log | head -n 22 | tail -n 3"],
  "read-74": ["cat -A /home/agent/read/hidden/ends.txt"],
  "read-75": ["diff /home/agent/read/config/relay_a.conf /home/agent/read/config/relay_c.conf"],
  "read-76": ["diff /home/agent/read/config/relay_a.conf /home/agent/read/config/relay_b.conf", "diff /home/agent/read/config/relay_b.conf /home/agent/read/config/relay_c.conf"],
  "read-77": ["wc -w /home/agent/read/memos/*.txt"],
  "read-78": ["less /home/agent/read/manuals/long_manual.txt"],
  "read-79": ["more /home/agent/read/manuals/field_guide.txt"],
  "read-80": ["cat /home/agent/read/frags/*.log"],
  "read-81": ["head -n 3 /home/agent/read/logs/headpack/*.log"],
  "read-82": ["tail -n 2 /home/agent/read/logs/tailpack/*.log"],
  "read-83": ["head -c 100 /home/agent/read/comms/dump.txt"],
  "read-84": ["tail -c 100 /home/agent/read/comms/dump2.txt"],
  "read-85": ["diff /home/agent/read/config/empty.conf /home/agent/read/config/full.conf"],
  "read-86": ["diff -q /home/agent/read/config/pair_a.txt /home/agent/read/config/pair_b.txt"],
  "read-87": ["wc -w /home/agent/read/memos/m1.txt /home/agent/read/memos/m2.txt"],
  "read-88": ["wc -c /home/agent/read/comms/p1.bin /home/agent/read/comms/p2.bin"],
  "read-89": ["file /home/agent/read/vault4/*.sh"],
  "read-90": ["file /home/agent/read/mixed2/*"],
  "read-91": ["head -n 10 /home/agent/read/logs/night5.log | tail -n 5"],
  "read-92": ["tail -n +3 /home/agent/read/logs/night6.log | head -n 3"],
  "read-93": ["cat -n /home/agent/read/reports/numbered_long.txt | head -n 6 | tail -n 2"],
  "read-94": ["diff -u /home/agent/read/config/fw_v1.rules /home/agent/read/config/fw_v2.rules"],
  "read-95": ["file /home/agent/read/textonly/*"],
  "read-96": ["file /home/agent/read/vault5/*"],
  "read-97": ["wc -l /home/agent/read/logs/night7.log", "tail -n 10 /home/agent/read/logs/night7.log"],
  "read-98": ["wc -l /home/agent/read/logs/night7.log", "head -n 10 /home/agent/read/logs/night7.log"],
  "read-99": ["head -n -5 /home/agent/read/logs/night8.log"],
  "read-100": ["file /home/agent/read/vault6/*", "cat /home/agent/read/vault6/c1.txt /home/agent/read/vault6/c2.txt /home/agent/read/vault6/c3.txt /home/agent/read/vault6/c4.txt /home/agent/read/vault6/c5.txt"],
  "read-101": ["cat /home/agent/read/timeline/t1.txt /home/agent/read/timeline/t2.txt /home/agent/read/timeline/t3.txt"],
  "read-102": ["head -n 45 /home/agent/read/logs/incident.log | tail -n 6"],
  "read-103": ["tail -n +6 /home/agent/read/logs/night9.log | head -n -5"],
  "read-104": ["diff -u /home/agent/read/config/gen1.conf /home/agent/read/config/gen4.conf"],
  "read-105": ["head -c 32 /home/agent/read/comms/token32.txt | tail -c 8"],
  "read-106": ["cat -n /home/agent/read/reports/longnote.txt | head -n 52 | tail -n 3"],
  "read-107": ["cat -A /home/agent/read/hidden/mixed.txt"],
  "read-108": ["file /home/agent/read/vault7/*", "cat /home/agent/read/vault7/a.txt /home/agent/read/vault7/b.txt"],
  "read-109": ["diff /home/agent/read/config/r1.conf /home/agent/read/config/r2.conf", "diff /home/agent/read/config/r1.conf /home/agent/read/config/r3.conf"],
  "read-110": ["wc -l /home/agent/read/size_logs/*.log"],
  "read-111": ["head -n 20 /home/agent/read/logs/night10.log | tail -n 10"],
  "read-112": ["diff -u /home/agent/read/config/patch_old.conf /home/agent/read/config/patch_new.conf"],
  "read-113": ["cat -A /home/agent/read/hidden/sneaky.txt"],
  "read-114": ["file /home/agent/read/mixed3/*", "wc -c /home/agent/read/mixed3/m1.txt /home/agent/read/mixed3/m2.txt", "cat /home/agent/read/mixed3/m2.txt"],
  "read-115": ["diff /home/agent/read/config/arch1.conf /home/agent/read/config/arch2.conf", "diff /home/agent/read/config/arch2.conf /home/agent/read/config/arch3.conf", "diff /home/agent/read/config/arch3.conf /home/agent/read/config/arch4.conf"],
  "read-116": ["head -n 10 /home/agent/read/logs/night11.log | tail -n 3"],
  "read-117": ["tail -n 6 /home/agent/read/logs/night11.log | head -n 3"],
  "read-118": ["cat -n /home/agent/read/reports/confession.txt | tail -n +34 | head -n 5"],
  "read-119": ["file /home/agent/read/vault8/*"],
  "read-120": ["head -c 50 /home/agent/read/comms/longserial.txt"],
  "read-121": ["wc -l /home/agent/read/logs/biglog.log", "tail -n 25 /home/agent/read/logs/biglog.log"],
  "read-122": ["cat /home/agent/read/reports/final1.txt /home/agent/read/reports/final2.txt /home/agent/read/reports/final3.txt"],
  "read-123": ["head -c 80 /home/agent/read/comms/packet2.bin | tail -c 40"],
  "read-124": ["cat /home/agent/read/reports/epilogue.txt"],
};
