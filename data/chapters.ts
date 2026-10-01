// Chapter metadata for NEXUS: Linux Quest.
// Powers the Learn -> Play -> Prove loop: intro cinematic, objectives,
// recap, and the chapter quiz. Voice: AXIOM, dry, a little sarcastic,
// genuinely helpful. No em dashes, no banned words, second person, present tense.

export interface QuizQuestion { q: string; options: string[]; answer: number; explain: string }
export interface ChapterMeta {
  chapter: number;
  name: string;
  introLines: string[];
  objectives: string[];
  recap: string[];
  quiz: QuizQuestion[];
}
export const CHAPTERS: ChapterMeta[] = [
  {
    chapter: 1,
    name: "Dark Halls",
    introLines: [
      "03:12. The alarms are quiet now, which is worse. The lights in the Dark Halls are out, the zone map is gone, and you are standing somewhere in the filesystem with no idea where.",
      "You are the night-shift junior. AXIOM is in your ear. The recovery crew arrives at dawn, whether you are ready or not.",
      "So you start with the only honest question: where am I? Answer that, and you can answer anything.",
      "Learn to move in the dark. By the time you leave, you will cross any filesystem blindfolded.",
    ],
    objectives: [
      "Pinpoint your location at any moment with pwd, no map required",
      "List exactly what is around you with ls, including the hidden files most people miss",
      "Move through the directory tree with cd, using absolute and relative paths",
      "Build directory structures from nothing with mkdir, including nested trees in one shot",
      "Create, copy, move, and rename files with touch, cp, and mv",
      "Delete files and directories with rm while keeping your career intact",
    ],
    recap: [
      "You cross a filesystem blindfolded now: pwd tells you where you are, ls shows what is around you, cd moves you.",
      "mkdir builds, touch creates, cp copies, mv moves or renames, rm removes. rm is permanent. There is no trash can on this station.",
      "The Dark Halls bow to you. The senior crew will find the lights on when they arrive. They will never know how close it was.",
    ],
    quiz: [
      {
        q: "You are lost somewhere in the filesystem. Which command tells you where you are?",
        options: ["pwd", "ls", "cd /", "whoami"],
        answer: 0,
        explain: "pwd prints your working directory, your exact position. ls shows what is around you, but that is useless until you know where around is.",
      },
      {
        q: "You want to go up one directory level. Which command does that?",
        options: ["cd ..", "cd .", "cd ~", "cd -"],
        answer: 0,
        explain: ".. means the parent directory. . means right here, ~ means your home directory, and - means back to wherever you just were.",
      },
      {
        q: "You need to create logs/2026/01 in one command, but logs does not exist yet. What works?",
        options: ["mkdir -p logs/2026/01", "mkdir logs/2026/01", "touch logs/2026/01", "mkdir logs, then mkdir 2026, then mkdir 01"],
        answer: 0,
        explain: "-p creates every missing parent directory in one go. Plain mkdir fails when a parent is missing, and touch makes files, not directories.",
      },
      {
        q: "You typed rm -rf old_stuff and your stomach dropped. Why should it?",
        options: [
          "rm deletes permanently with no undo",
          "rm moves files to a trash folder you can restore",
          "rm only works on empty directories",
          "rm always asks for confirmation first",
        ],
        answer: 0,
        explain: "rm deletes immediately and there is no undo on the command line. -r makes it recursive into directories and -f skips the confirmation questions. Respect it.",
      },
    ],
  },
  {
    chapter: 2,
    name: "Signal Library",
    introLines: [
      "The breach scattered logs across every corner of the station, and the truth about what happened at 03:12 is written in there somewhere.",
      "You do not have time to read them all. You need to read them fast: whole files, slices of files, and the trick of telling a text file from a binary decoy before it wastes your night.",
      "Welcome to the Signal Library. The answers are already here. You just have to read.",
      "AXIOM's advice: read the end first. That is where the bodies are.",
    ],
    objectives: [
      "Dump whole files to the terminal with cat, and know exactly when not to",
      "Page through long files without drowning using less",
      "Read just the beginning or end of a file with head and tail",
      "Follow a live log as it grows with tail -f, like watching the station think",
      "Tell text files from binary decoys at a glance with file",
      "Count lines, words, and bytes with wc, and compare two files line by line with diff",
    ],
    recap: [
      "cat reads whole files, less pages them, head and tail read the edges, and tail -f follows a file as it grows.",
      "file tells you what a file actually is before you trust it, wc counts what is inside, and diff shows exactly what changed between two files.",
      "The Signal Library is quiet now. You read the story of 03:12 the way a mechanic listens to an engine.",
    ],
    quiz: [
      {
        q: "A log file has 200,000 lines and you open it with cat. What actually happens?",
        options: [
          "It dumps all 200,000 lines at once and they scroll straight past you",
          "It shows one page at a time and waits for your keypress",
          "It shows only the last 10 lines",
          "It refuses to open files that large",
        ],
        answer: 0,
        explain: "cat prints the whole file with no mercy and no paging. For big files you want less for paging, or head and tail for the edges.",
      },
      {
        q: "You need to watch a live log as new lines arrive. Which command does that?",
        options: ["tail -f access.log", "head access.log", "cat access.log", "less access.log"],
        answer: 0,
        explain: "-f means follow: tail keeps the file open and prints new lines as they arrive. The others all read a static snapshot and exit.",
      },
      {
        q: "You find a file named notes.txt, but something feels wrong. What do you run before trusting it?",
        options: ["file notes.txt", "cat notes.txt", "wc notes.txt", "chmod 644 notes.txt"],
        answer: 0,
        explain: "file reads the file's actual signature and tells you what it really is. Names lie. Intruders name binaries things like notes.txt on purpose.",
      },
      {
        q: "You have config.old and config.new and you want to see exactly what changed. Which tool?",
        options: ["diff config.old config.new", "cat config.old config.new", "wc config.old config.new", "grep change config.new"],
        answer: 0,
        explain: "diff compares two files line by line and shows the differences. cat would just glue them together, and wc would only count.",
      },
    ],
  },
  {
    chapter: 3,
    name: "Scriptorium",
    introLines: [
      "Five hundred lines of noise. Three lines that matter. The log haystack is waiting.",
      "This is the Scriptorium, where raw text becomes answers. You will search, sort, count, and cut, and you will learn the small regex patterns that find needles in haystacks.",
      "Every great operator is a text surgeon. Scalpel up.",
    ],
    objectives: [
      "Find any needle in any haystack with grep, including real regex patterns",
      "Sort lines into order with sort and collapse duplicates with uniq",
      "Count occurrences and rank them, the classic frequency-analysis move",
      "Slice columns and fields out of structured text with cut",
      "Reach for awk when cut is not enough: fields, patterns, and tiny programs",
      "Transform text in place with sed and tr: replace, delete, translate",
    ],
    recap: [
      "grep finds, sort orders, uniq dedupes, cut slices, awk thinks, sed edits, tr translates.",
      "Chained together, they turn five hundred lines of noise into three lines that matter.",
      "Noise goes in, signal comes out. The logs fear you now, and that is a measurable outcome.",
    ],
    quiz: [
      {
        q: "Which command finds lines containing the word error followed by a 3-digit code, like error 404?",
        options: [
          "grep -E \"error [0-9]{3}\" log.txt",
          "grep \"error [0-9]{3}\" log.txt",
          "grep \"error ???\" log.txt",
          "grep \"error *\" log.txt",
        ],
        answer: 0,
        explain: "-E switches grep to extended regex, where {3} means exactly three of the previous class. Without -E the braces are literal characters, and * means zero or more of the previous character, not a wildcard.",
      },
      {
        q: "You run uniq on a log and duplicate lines remain. What went wrong?",
        options: [
          "The duplicates were not on adjacent lines, and uniq only collapses neighbors",
          "uniq needs a special flag before it works on log files",
          "uniq only works on files smaller than 1MB",
          "uniq deletes every duplicate line in the file, including the first",
        ],
        answer: 0,
        explain: "uniq only removes duplicates that sit next to each other, so the standard move is sort first, then uniq. The classic pipeline is sort file | uniq -c | sort -nr.",
      },
      {
        q: "A line in /etc/passwd reads root:x:0:0:root:/root:/bin/bash. Which command prints just the username?",
        options: ["cut -d: -f1 /etc/passwd", "cut -d, -f1 /etc/passwd", "cut -c1 /etc/passwd", "awk -F: '{print $0}' /etc/passwd"],
        answer: 0,
        explain: "-d: sets the delimiter to a colon and -f1 picks the first field. The delimiter here is a colon, not a comma, and $0 in awk means the whole line, not the first field.",
      },
      {
        q: "Which command replaces every foo with bar in data.txt and saves the result to fixed.txt?",
        options: [
          "sed 's/foo/bar/g' data.txt > fixed.txt",
          "tr 'foo' 'bar' data.txt > fixed.txt",
          "grep foo data.txt > fixed.txt",
          "sed 's/foo/bar/' data.txt, which edits the file directly",
        ],
        answer: 0,
        explain: "sed's s/foo/bar/g substitutes globally and the redirect saves the output. Without a redirect sed prints to the terminal and changes nothing, and tr translates single characters, not words.",
      },
    ],
  },
  {
    chapter: 4,
    name: "The Vault",
    introLines: [
      "Every lock on NEXUS-9 was picked or left open. Some files are readable by everyone, and everyone includes the intruder.",
      "The Vault holds the station's secrets: keys, credentials, configs that should never see daylight. Your job is to re-key every one of them.",
      "You will read permission strings like a second language, lock secrets down to 600, open scripts to 755, and use sudo with respect. It bites.",
    ],
    objectives: [
      "Read permission strings like rwxr-xr-- fluently: who can read, write, and execute what",
      "Translate between octal and symbolic modes: 600, 644, 755, 700, without hesitation",
      "Lock files down with chmod and fix ownership with chown and chgrp",
      "Predict default permissions with umask before a file is even created",
      "Use sudo for root-only work without handing the whole station to a typo",
    ],
    recap: [
      "Permission strings are three groups of rwx: owner, group, others. Octal is the same idea in numbers: 4 is read, 2 is write, 1 is execute.",
      "600 locks a secret to you alone, 755 makes a script runnable by all, and umask decides the starting permissions of everything you create.",
      "The Vault is sealed. The intruder's copies of the keys are decorative now.",
    ],
    quiz: [
      {
        q: "A private key shows -rw-------. What is that in octal, and who can read it?",
        options: ["600, only the owner", "644, everyone", "700, the owner and root", "400, nobody, including the owner"],
        answer: 0,
        explain: "rw------- is read plus write for the owner and nothing for anyone else: 4+2=6, then 0, then 0. Only the owner can read it, which is exactly what a private key needs.",
      },
      {
        q: "You need a script to be executable by everyone but writable only by you. Which mode?",
        options: ["755", "644", "777", "700"],
        answer: 0,
        explain: "755 is rwxr-xr-x: full control for the owner, read plus execute for everyone else. 644 lacks execute, 777 lets anyone rewrite your script, and 700 hides it from everyone but you.",
      },
      {
        q: "Your umask is 022. You create a new file. What permissions does it get?",
        options: ["644", "755", "600", "666"],
        answer: 0,
        explain: "Files start at 666 and the umask removes the write bits for group and others: 666 minus 022 is 644. Directories start at 777, which is why new directories get 755 with the same umask.",
      },
      {
        q: "A junior runs sudo rm -rf / tmp/junk, with a space after the slash. What is the lesson?",
        options: [
          "sudo amplifies typos into disasters, so read the command twice before running it as root",
          "sudo always asks twice before deleting anything",
          "rm refuses to run under sudo",
          "The space is harmless and rm handles it gracefully",
        ],
        answer: 0,
        explain: "That space turns the command into deleting / and then tmp/junk. As root there is no permission barrier left to save you, which is why you read a sudo command twice before pressing enter.",
      },
    ],
  },
  {
    chapter: 5,
    name: "Engine Room",
    introLines: [
      "Rogue processes are squatting on your CPU and holding ports hostage. The Engine Room hums, but it hums wrong.",
      "You will learn to see everything that runs, push your own work into the background, and evict the squatters.",
      "Politely at first. Signal 9 if needed.",
    ],
    objectives: [
      "See every running process with ps and find the exact one you want with pgrep",
      "Watch the machine breathe in real time with top: CPU, memory, and the top offenders",
      "Terminate processes with kill and pkill, choosing TERM before KILL like a professional",
      "Manage your own background work with jobs, bg, fg, and nohup",
      "Tune process priority with nice so heavy jobs stop bullying the station",
    ],
    recap: [
      "ps shows the process list, pgrep finds by name, top watches live, and kill sends signals: 15 asks nicely, 9 does not ask.",
      "jobs, bg, and fg manage your own background work, and nohup keeps it alive after you log out.",
      "The Engine Room hums clean. The squatters are gone, and one of them left a thank-you note. I deleted it.",
    ],
    quiz: [
      {
        q: "You need the PID of every process named miner. Which command gives it to you?",
        options: ["pgrep miner", "ps miner", "kill miner", "top miner"],
        answer: 0,
        explain: "pgrep searches the process list by name and prints matching PIDs. ps needs flags to be useful, kill needs a target, and top is an interactive viewer, not a search tool.",
      },
      {
        q: "A process ignores your kill command. What is the correct next step?",
        options: [
          "kill -9 on its PID, the KILL signal it cannot ignore",
          "Send kill -15 again, but louder",
          "Restart the whole station",
          "Delete the process's binary file from disk",
        ],
        answer: 0,
        explain: "Signal 15 (TERM) asks the process to exit and it can refuse. Signal 9 (KILL) is handled by the kernel itself, so the process gets no vote. You try 15 first, then 9.",
      },
      {
        q: "You start a long backup with ./backup.sh & and get your prompt back while it keeps running. What did the & do?",
        options: [
          "It ran the job in the background and returned your prompt immediately",
          "It ran the job with root privileges",
          "It paused the job until you press enter",
          "It redirected the job's output to a file",
        ],
        answer: 0,
        explain: "& places the job in the background so the shell prompt returns at once. jobs lists your background jobs, fg brings one back to the foreground, and nohup would keep it running after you log out.",
      },
      {
        q: "In top, one process sits at 98% CPU and the station is crawling. Before you kill it, what should you check?",
        options: [
          "What the process actually is, because killing the wrong PID can take down something critical",
          "Nothing, high CPU always means malware",
          "Its nice value, because that is the same thing as its PID",
          "The system clock, because top lies about time",
        ],
        answer: 0,
        explain: "High CPU can be a runaway script, a legitimate compile, or malware, and PIDs get reused. Confirm the process name and what it belongs to first, then evict with confidence.",
      },
    ],
  },
  {
    chapter: 6,
    name: "Antenna Array",
    introLines: [
      "The relays went silent at 03:12. A station that cannot talk is a very expensive paperweight.",
      "The Antenna Array is yours to fix. You will check your own addresses, ping the gateway, read the sockets, and pull the evidence off-station.",
      "The red team wants a full copy. You are going to give them one.",
    ],
    objectives: [
      "Inspect your own network interfaces and addresses with ip addr",
      "Test reachability and read latency with ping, and understand what the replies tell you",
      "List listening sockets and active connections with ss to find what holds each port",
      "Fetch files and talk to APIs over HTTP with curl and wget, and know which to grab when",
      "Log into remote machines securely with ssh and copy evidence off-station with scp",
    ],
    recap: [
      "ip addr shows who you are on the network, ping proves you can reach someone, and ss shows every socket and who holds it.",
      "curl fetches and talks, wget downloads, ssh logs you in, and scp copies files between machines over an encrypted channel.",
      "NEXUS-9 is talking again. The gateway remembers your name, and the evidence is safe off-station.",
    ],
    quiz: [
      {
        q: "You run ip addr and see 10.0.0.9/24 on eth0. What does the /24 tell you?",
        options: [
          "The first 24 bits are the network, so your subnet holds 254 usable addresses",
          "Your address is the 24th address on the network",
          "The interface runs at 24 megabits",
          "Port 24 is open on this host",
        ],
        answer: 0,
        explain: "/24 is CIDR notation for a 255.255.255.0 netmask: 24 network bits, 8 host bits, 254 usable addresses. It describes the subnet size, not speed or ports.",
      },
      {
        q: "ping to the gateway replies with Destination Host Unreachable. What does that most likely mean?",
        options: [
          "A local routing or link problem: your machine cannot even reach the next hop",
          "The gateway is definitely powered off",
          "Your DNS server is down",
          "A firewall on the far end blocked the reply",
        ],
        answer: 0,
        explain: "Destination Host Unreachable comes from your own network stack or the local router saying it has no path to the target. It points at your link or routing table, not at the far end being off.",
      },
      {
        q: "ss -tlnp shows a process listening on 0.0.0.0:4444 that you do not recognize. What is the right move?",
        options: [
          "Investigate the process first, then kill it if it is rogue: an unknown listener on all interfaces is a red flag",
          "Ignore it, port 4444 is always harmless",
          "Restart networking to clear every listener at once",
          "Block it with ping",
        ],
        answer: 0,
        explain: "0.0.0.0 means it listens on every interface, reachable from anywhere, and 4444 is a classic malware port. Confirm what the process is with the PID ss gave you, then evict it. Never ignore an unknown listener.",
      },
      {
        q: "You need to copy evidence.tar.gz from the relay host 10.0.0.2 to your machine. Which command?",
        options: [
          "scp agent@10.0.0.2:/home/agent/evidence.tar.gz .",
          "ssh agent@10.0.0.2 evidence.tar.gz",
          "curl 10.0.0.2 > evidence.tar.gz",
          "wget ssh://10.0.0.2/evidence.tar.gz",
        ],
        answer: 0,
        explain: "scp copies files over SSH: user@host:path as the source, . as the destination. ssh runs commands on the remote host, curl speaks HTTP, and wget does not do SSH.",
      },
    ],
  },
  {
    chapter: 7,
    name: "Observatory",
    introLines: [
      "Before you fix a station, you must know it. The Observatory sees everything, and tonight it is your turn at the telescope.",
      "You will read the whole machine at a glance: disk, memory, uptime, kernel, environment. Your command history is a crime scene by now, so you get to interrogate that too.",
      "Know your station. Then save it.",
    ],
    objectives: [
      "Read disk usage at a glance with df and hunt down space hogs with du",
      "Check memory pressure with free and know used versus free versus cached",
      "Identify the kernel, architecture, and uptime with uname, uptime, and date",
      "Interrogate your own command history to reconstruct exactly what happened",
      "Read the manual with man and inspect your surroundings with env and whoami",
    ],
    recap: [
      "df shows disk free, du shows disk used, free shows memory, uname names the kernel, and uptime tells you how long the station has been awake.",
      "history is your own flight recorder, man is the manual for everything, and env plus whoami tell you who you are and what surrounds you.",
      "You know NEXUS-9 better than the people who built it. Your history is now a textbook. A slightly embarrassing one, but a textbook.",
    ],
    quiz: [
      {
        q: "df says / is 98% full and the station is choking. What is your first investigative command?",
        options: [
          "du -sh /* to find which top-level directory is eating the disk",
          "rm -rf /tmp/* immediately, no questions asked",
          "free -h, because a full disk is a memory problem",
          "Reboot, because full disks fix themselves",
        ],
        answer: 0,
        explain: "du -sh /* summarizes each top-level directory so you can drill into the fat one. Deleting blindly risks killing something the station needs, and free shows memory, which is a different resource.",
      },
      {
        q: "free -h shows 1.2G used, 400M free, and 3.5G in buff/cache. Is the station out of memory?",
        options: [
          "No, the kernel hands cache memory back to programs that need it",
          "Yes, free means free and 400M is almost nothing",
          "Yes, buff/cache is permanently reserved and unusable",
          "No, because swap is never used on this station",
        ],
        answer: 0,
        explain: "Linux uses spare RAM as disk cache and reclaims it instantly when programs need it. The real pressure signal is the available column, not the free column.",
      },
      {
        q: "You need to redo a long command from an hour ago but cannot remember it exactly. What helps?",
        options: [
          "history piped to grep with a keyword you remember, then !number to rerun it",
          "uptime, which logs every command you run",
          "env, which stores your command history",
          "date, which rewinds the shell",
        ],
        answer: 0,
        explain: "history lists your past commands, grep filters them by a keyword, and !number reruns a specific entry. uptime, env, and date have nothing to do with command recall.",
      },
      {
        q: "You are about to use a flag you have never tried on a destructive command. What is the professional move?",
        options: [
          "man the command and read what the flag does before you run it",
          "Try it and see what happens",
          "Ask the intruder for advice",
          "Run it with sudo so it works faster",
        ],
        answer: 0,
        explain: "man is the built-in manual and reading it takes ten seconds. Trying unknown flags on destructive commands is how careers end, and sudo only makes the blast radius bigger.",
      },
    ],
  },
  {
    chapter: 8,
    name: "Reactor Core",
    introLines: [
      "Pipes, redirects, wildcards, variables, exit codes, archives, loops. The Reactor Core is where the training wheels come off.",
      "You will stop typing commands and start commanding the shell. Chain tools into one-liners that would take a script in lesser hands.",
      "The reactor does not forgive sloppy syntax. It rewards clean one-liners. Make it proud.",
    ],
    objectives: [
      "Chain commands into pipelines with |, feeding output straight into the next tool",
      "Redirect streams with >, >>, and 2> into files, logs, and nowhere",
      "Match files in bulk with wildcards and hunt anything down with find",
      "Pack and unpack archives with tar without memorizing the flags from scratch",
      "Store values in variables and read exit codes with $? to make the shell react",
      "Automate repetition with for loops, one line at a time",
    ],
    recap: [
      "Pipes chain tools, redirects steer output into files, wildcards match in bulk, and find hunts down anything by name, size, or age.",
      "tar packs and unpacks, variables remember, $? tells you if the last command succeeded, and loops repeat without complaint.",
      "You do not type commands anymore. You command the shell. One box left to open, junior agent.",
    ],
    quiz: [
      {
        q: "What is the difference between > and >> when writing to a file?",
        options: [
          "> overwrites the file, >> appends to it",
          ">> overwrites the file, > appends to it",
          "They are identical",
          "> only works with text, >> only works with binaries",
        ],
        answer: 0,
        explain: "> truncates the file first, destroying what was there. >> adds to the end and keeps existing content. Mixing them up is how logs get wiped.",
      },
      {
        q: "You run grep error log.txt | wc -l. What does the pipe do here?",
        options: [
          "It feeds grep's output directly into wc as input, with no temporary file",
          "It runs both commands at the exact same millisecond",
          "It saves grep's output to a file named wc",
          "It stops grep from printing anything",
        ],
        answer: 0,
        explain: "The pipe connects grep's standard output to wc's standard input, so the data flows straight through. No intermediate file is created, which is the whole point of a pipeline.",
      },
      {
        q: "A script checks if [ $? -eq 0 ] right after a backup command. What is it testing?",
        options: [
          "Whether the backup command succeeded, since 0 means success",
          "Whether the backup produced zero lines of output",
          "Whether the variable $? is empty",
          "Whether the backup ran in zero seconds",
        ],
        answer: 0,
        explain: "$? holds the exit code of the last command, and by convention 0 means success while anything else names a specific failure. The script branches on success versus failure.",
      },
      {
        q: "You need to compress the whole evidence/ directory into evidence.tar.gz. Which command?",
        options: [
          "tar -czf evidence.tar.gz evidence/",
          "tar -xzf evidence.tar.gz evidence/",
          "tar -tzf evidence.tar.gz evidence/",
          "zip -czf evidence.tar.gz evidence/",
        ],
        answer: 0,
        explain: "-c creates, -z compresses with gzip, -f names the file. -x extracts and -t lists, which are the opposite of what you want here.",
      },
    ],
  },
];
export const ONBOARDING: string[] = [
  "Welcome to NEXUS-9, junior agent. I am AXIOM, the station AI. I will be dry, honest, and occasionally funny. You will be learning Linux.",
  "Every zone runs the same loop. LEARN: read the short lessons. They are brief on purpose, and everything in them is real.",
  "PLAY: solve the challenges in the terminal. The machine is simulated, but the commands are genuine, and the skills transfer to any real Linux box.",
  "PROVE: beat the timed boss drill, the chapter exam with a clock on it. Pass it and the next zone unlocks.",
  "Clear all eight zones and you face Operation Blackout: five flags, fifteen minutes, every skill you own.",
  "The terminal will not judge you. I might. Begin.",
];
