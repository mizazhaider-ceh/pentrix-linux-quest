export interface Zone {
  id: number; // 1-8
  name: string;
  tagline: string;
  description: string; // 2-3 sentences of flavor
  commands: string[]; // commands taught in this zone
}

export const ZONES: Zone[] = [
  {
    id: 1,
    name: "Dark Halls",
    tagline: "Learn to move in the dark.",
    description:
      "The zone map is gone and the lights are out. You will learn where you are, what is around you, and how to build the directory structure the recovery effort needs. Cross any filesystem blindfolded by the time you leave.",
    commands: ["pwd", "ls", "cd", "mkdir", "touch", "rm", "cp", "mv"],
  },
  {
    id: 2,
    name: "Signal Library",
    tagline: "Read what the breach left behind.",
    description:
      "The truth about 03:12 is written in the scattered logs somewhere. You will learn to read files fast: whole files, slices of files, and how to tell a text file from a binary decoy at a glance.",
    commands: ["cat", "less", "head", "tail", "file", "wc", "diff"],
  },
  {
    id: 3,
    name: "Scriptorium",
    tagline: "Carve signal out of noise.",
    description:
      "Five hundred lines of noise, three lines that matter. You will learn to search, sort, count, and cut text, and to wield the small regex patterns that find needles in log haystacks.",
    commands: ["grep", "sort", "uniq", "cut", "awk", "sed", "tr"],
  },
  {
    id: 4,
    name: "The Vault",
    tagline: "Re-key every lock.",
    description:
      "Every lock on the station was picked or left open. You will read permission strings like a second language, lock secrets down to 600, open scripts to 755, and use sudo without hurting yourself.",
    commands: ["chmod", "chown", "chgrp", "umask", "sudo", "ls -l"],
  },
  {
    id: 5,
    name: "Engine Room",
    tagline: "Evict the squatters.",
    description:
      "Rogue processes are squatting on your CPU and holding ports hostage. You will learn to see every running process, push work into the background, and remove anything that does not belong.",
    commands: ["ps", "top", "pgrep", "kill", "pkill", "jobs", "nice", "nohup"],
  },
  {
    id: 6,
    name: "Antenna Array",
    tagline: "Get the station talking again.",
    description:
      "The relays went silent at 03:12. You will check your own addresses, ping the gateway, read the sockets, pull files from the relay, and copy evidence off-station over SSH.",
    commands: ["ip", "ping", "ss", "curl", "wget", "ssh", "scp"],
  },
  {
    id: 7,
    name: "Observatory",
    tagline: "Know your station.",
    description:
      "Before you fix a station, you must know it. You will read the whole machine at a glance: disk, memory, uptime, kernel, environment, and your own command history.",
    commands: ["df", "du", "free", "uname", "uptime", "history", "man", "env", "whoami", "date"],
  },
  {
    id: 8,
    name: "Reactor Core",
    tagline: "This is where agents are made.",
    description:
      "Pipes, redirects, wildcards, variables, exit codes, archives, and loops. You will stop typing commands and start commanding the shell. The reactor does not forgive sloppy syntax, but it rewards clean one-liners.",
    commands: ["pipes (|)", "redirects (>, >>)", "wildcards (*)", "find", "tar", "variables", "exit codes ($?)", "loops"],
  },
];
