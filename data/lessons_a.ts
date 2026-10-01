export interface LessonExample { cmd: string; output: string; note?: string }
export interface LessonMistake { wrong: string; why: string; fix: string }
export interface Lesson {
  id: string;
  chapter: number;
  command: string;
  title: string;
  what: string;
  syntax: string;
  examples: LessonExample[];
  whyMatters: string;
  mistakes: LessonMistake[];
  proTip: string;
}

export const LESSONS_A: Lesson[] = [
  {
    id: "lsn-pwd",
    chapter: 1,
    command: "pwd",
    title: "Where Am I?",
    what: "pwd answers the oldest question in computing: where am I. You will ask it more times than you admit. It prints the full path of the directory you are standing in, starting from the root of the filesystem. That path is called your working directory.",
    syntax: "pwd [-L | -P]",
    examples: [
      {
        cmd: "pwd",
        output: "/home/agent/ops",
        note: "You are inside the ops directory. No guessing, no reading the prompt. Proof.",
      },
      {
        cmd: "cd /var/log\npwd",
        output: "/var/log",
        note: "After moving, pwd confirms the move actually happened. Trust it, not your memory.",
      },
    ],
    whyMatters: "Every relative path you type is measured from here. Type rm *.tmp in the wrong directory and pwd is the command that would have warned you, if you had asked. In incident response, the first thing you establish on a compromised host is where your tools are running, and pwd does that in one word.",
    mistakes: [
      {
        wrong: "pwd",
        why: "You run pwd and it prints a path, but you wanted to see the files. pwd tells you where you are, it never lists what is there. That is ls.",
        fix: "Use ls after pwd when you want to know what is in the directory, not just where it is.",
      },
      {
        wrong: "pwd report.txt",
        why: "pwd takes no file arguments. Extra words after pwd are ignored or cause confusion depending on the shell. It answers one question about your location, nothing else.",
        fix: "Type pwd alone. If you want the path of a file, use realpath report.txt instead.",
      },
    ],
    proTip: "In a directory reached through a symlink, plain pwd shows the path you typed, while pwd -P shows the real physical path on disk. When two paths point at the same place and things behave strangely, pwd -P tells you the truth.",
  },
  {
    id: "lsn-ls",
    chapter: 1,
    command: "ls",
    title: "Look Around",
    what: "ls lists what is inside a directory. It is the command you will run most in your career, full stop. Bare ls shows names. Flags change what you see: -l shows details like size and permissions, -a reveals hidden files that start with a dot, and -h makes sizes human readable.",
    syntax: "ls [OPTION]... [FILE]...",
    examples: [
      {
        cmd: "ls /home/agent/ops",
        output: "alerts\nlogs\nnotes.txt",
        note: "Three entries. Directories and files shown the same way in this plain view.",
      },
      {
        cmd: "ls -lah /home/agent/ops",
        output: "total 24K\ndrwxr-xr-x 3 agent ops 4.0K Oct  1 10:12 .\ndrwxr-xr-x 5 agent ops 4.0K Oct  1 09:58 ..\ndrwxr-xr-x 2 agent ops 4.0K Oct  1 10:05 alerts\ndrwxr-xr-x 2 agent ops 4.0K Oct  1 10:05 logs\n-rw-r--r-- 1 agent ops  312 Oct  1 10:12 notes.txt",
        note: "The -l flag shows permissions, owner, size, and time. -a shows the . and .. entries. -h turns raw byte counts into 4.0K.",
      },
    ],
    whyMatters: "You cannot investigate what you cannot see. Attackers hide backdoors as dotfiles and bury payloads in crowded directories, and ls -la is how you catch them. In forensics, the timestamp column in ls -l is often your first timeline of what an intruder touched.",
    mistakes: [
      {
        wrong: "ls folder/",
        why: "This lists the contents of folder, not folder itself. When you want to check the permissions or size of the directory entry itself, this lies by showing you its children instead.",
        fix: "Use ls -ld folder/ to see the directory entry itself.",
      },
      {
        wrong: "ls /var/log | wc -l",
        why: "Not a mistake in syntax, but a habit to unlearn: piping ls into other tools breaks on filenames with spaces or newlines. It works until it quietly gives you wrong answers.",
        fix: "For scripting, use globs or find instead of parsing ls output.",
      },
      {
        wrong: "ls *.log",
        why: "You typed this in /home/agent and found nothing, because the logs live in /home/agent/ops. A glob only matches files in your current directory.",
        fix: "Give the path explicitly: ls /home/agent/ops/*.log, or cd there first.",
      },
    ],
    proTip: "Add ls -lah to your muscle memory: long format, all files including hidden, human sizes. Most of your investigative life is lived inside that one invocation.",
  },
  {
    id: "lsn-cd",
    chapter: 1,
    command: "cd",
    title: "Move",
    what: "cd changes your working directory. You give it a destination and the shell moves you there. cd with no arguments takes you home. cd .. goes up one level, and cd - jumps back to wherever you just were, like an undo button for navigation.",
    syntax: "cd [DIR]",
    examples: [
      {
        cmd: "cd /home/agent/ops/logs",
        output: "",
        note: "cd is silent on success. No output means it worked. Check with pwd if you doubt it.",
      },
      {
        cmd: "cd ..\ncd -",
        output: "/home/agent/ops/logs",
        note: "First you go up to /home/agent/ops. Then cd - jumps straight back to logs. Two moves, one command each.",
      },
    ],
    whyMatters: "Navigation is the tax you pay before every other command does anything. Absolute paths (/home/agent/ops) always work no matter where you are; relative paths (logs, ..) depend entirely on where you stand. Knowing which kind you are typing is the difference between deleting the right directory and the wrong one.",
    mistakes: [
      {
        wrong: "cd notes.txt",
        why: "notes.txt is a file, not a directory. The shell complains: not a directory. You cannot stand inside a file.",
        fix: "Check with ls first. If you want to read it, use cat or less, not cd.",
      },
      {
        wrong: "cd /home/agent/my reports",
        why: "The space splits your destination into two arguments, /home/agent/my and reports, and cd only accepts one. It fails.",
        fix: "Quote it: cd \"/home/agent/my reports\", or escape the space: cd /home/agent/my\\ reports.",
      },
      {
        wrong: "cd logss",
        why: "A typo, and cd fails with no such file or directory. The shell does not guess what you meant.",
        fix: "Type the first letters and press Tab. Tab completion finishes real directory names and never misspells them.",
      },
    ],
    proTip: "Type cd, a space, then hit Tab twice. The shell lists every directory you can reach from here. It is the fastest way to explore an unfamiliar machine without memorizing paths.",
  },
  {
    id: "lsn-mkdir",
    chapter: 1,
    command: "mkdir",
    title: "Build Rooms",
    what: "mkdir creates directories. One argument, one new directory. The -p flag is the real power: it builds a whole chain of nested directories at once and stays silent if they already exist, so it is safe to run twice.",
    syntax: "mkdir [OPTION]... DIRECTORY...",
    examples: [
      {
        cmd: "mkdir reports",
        output: "",
        note: "A new directory called reports appears in your current location. Silence means success.",
      },
      {
        cmd: "mkdir -p /home/agent/ops/cases/case-042/evidence",
        output: "",
        note: "Three levels deep, created in one shot. Without -p this would fail because the parents do not exist yet.",
      },
    ],
    whyMatters: "Every investigation needs structure: a case directory, an evidence subdirectory, a place for notes. mkdir -p builds that structure in one line, and because it does not error when the directory exists, it is safe inside scripts that run more than once. Organized directories are how evidence stays admissible and how teammates find anything.",
    mistakes: [
      {
        wrong: "mkdir cases/case-042/evidence",
        why: "cases and case-042 do not exist yet, so mkdir refuses: no such file or directory. It only creates the last piece, never the parents.",
        fix: "Add -p: mkdir -p cases/case-042/evidence builds the whole chain.",
      },
      {
        wrong: "mkdir case 042",
        why: "The space makes two arguments, so you get two directories: case and 042. Now your evidence has no home and you have two stray folders.",
        fix: "Quote it or use a dash: mkdir \"case 042\" or mkdir case-042.",
      },
      {
        wrong: "mkdir -p /evidence/case-042",
        why: "Creating directories at the filesystem root needs root privileges, and you do not have them. Permission denied.",
        fix: "Build inside your own tree: mkdir -p /home/agent/ops/cases/case-042.",
      },
    ],
    proTip: "Brace expansion builds whole trees at once: mkdir -p cases/case-042/{evidence,notes,pcaps}. One line, three subdirectories, zero repetition.",
  },
  {
    id: "lsn-touch",
    chapter: 1,
    command: "touch",
    title: "Summon Files",
    what: "touch creates an empty file, or updates the timestamp of one that already exists. touch notes.txt on a missing file creates a zero-byte file. On an existing file it sets the access and modification times to now, without changing a single byte of content.",
    syntax: "touch [OPTION]... FILE...",
    examples: [
      {
        cmd: "touch timeline.txt\nls -l timeline.txt",
        output: "-rw-r--r-- 1 agent ops 0 Oct  1 11:02 timeline.txt",
        note: "timeline.txt now exists with size 0. Empty, but real, and ready to hold data.",
      },
      {
        cmd: "touch /home/agent/ops/notes.txt\nls -l /home/agent/ops/notes.txt",
        output: "-rw-r--r-- 1 agent ops 312 Oct  1 11:04 notes.txt",
        note: "notes.txt still holds its 312 bytes, but its timestamp is now the current time. Content untouched, clock updated.",
      },
    ],
    whyMatters: "Timestamps are evidence. In forensics, modification times build the timeline of an intrusion, and touch is exactly how attackers falsify that timeline, a trick called timestomping. Knowing touch means you understand both how to create placeholder files for your cases and why a file's clock can never be trusted blindly.",
    mistakes: [
      {
        wrong: "touch",
        why: "No filename given, so touch complains about a missing file operand. It cannot create a file with no name.",
        fix: "Name the file: touch report.txt.",
      },
      {
        wrong: "touch my notes.txt",
        why: "The space splits this into two filenames, so you create my and notes.txt. Two empty files instead of one.",
        fix: "Quote the name: touch \"my notes.txt\".",
      },
      {
        wrong: "touch /root/flag.txt",
        why: "You do not own /root and cannot write there. Permission denied. touch obeys the same rules as everything else.",
        fix: "Create the file somewhere you own, like /home/agent/ops/flag.txt.",
      },
    ],
    proTip: "touch -t 202601010000 file sets a specific timestamp instead of now. Useful for testing time-based scripts, and it is the exact mechanism behind timestomping, so remember it when a timestamp looks too convenient.",
  },
  {
    id: "lsn-rm",
    chapter: 1,
    command: "rm",
    title: "Destroy",
    what: "rm deletes files. Permanently. There is no recycle bin, no undo, no recovery prompt by default. rm file removes a file, rm -r directory removes a directory and everything inside it, and rm -i asks before each deletion. Respect this command more than any other on this list.",
    syntax: "rm [OPTION]... FILE...",
    examples: [
      {
        cmd: "rm old-notes.txt",
        output: "",
        note: "The file is gone. No confirmation, no trash. This is the normal, silent behavior.",
      },
      {
        cmd: "rm -ri drafts/",
        output: "rm: descend into directory 'drafts/'? y\nrm: remove regular file 'drafts/a.txt'? y\nrm: remove directory 'drafts/'? y",
        note: "The -i flag makes rm ask at every step. Slower, but every deletion is a conscious choice.",
      },
    ],
    whyMatters: "rm is the number one cause of self-inflicted data loss in the industry, and it is also a core attacker tool for destroying logs to cover tracks. In incident response, the absence of logs is itself evidence, and you need to recognize when rm -rf was used to wipe a trail. Handle it like a loaded tool: verify your target before you pull the trigger.",
    mistakes: [
      {
        wrong: "rm drafts/",
        why: "rm refuses to remove a directory without -r: it is a directory. This refusal is a safety rail, and you should be glad it exists.",
        fix: "Use rm -r drafts/ when you truly mean to delete the directory and its contents, and look inside first with ls.",
      },
      {
        wrong: "rm * .bak",
        why: "The space turns this into two targets: everything (*) plus .bak. The * matches every file in the directory, so you delete all of them while trying to delete one backup pattern.",
        fix: "No space: rm *.bak. Better yet, run ls *.bak first to preview exactly what the glob matches.",
      },
      {
        wrong: "rm -rf / tmp/cleanup",
        why: "The space after / makes / its own argument. You just told the machine to delete the entire filesystem root, recursively, without asking. This is the most famous footgun in computing.",
        fix: "Never put a space after /. Type rm -rf /tmp/cleanup as one path, and double check with pwd and ls first.",
      },
    ],
    proTip: "Before any rm with a wildcard, run the same pattern with ls first. ls *.tmp shows you the victims; only when the list is exactly right do you swap ls for rm.",
  },
  {
    id: "lsn-cp",
    chapter: 1,
    command: "cp",
    title: "Duplicate",
    what: "cp copies files and directories. The order is fixed: source first, destination last. cp report.txt report.bak makes a backup copy. Directories need the -r flag to copy their contents too. The original is never touched; you get an independent second copy.",
    syntax: "cp [OPTION]... SOURCE DEST",
    examples: [
      {
        cmd: "cp /home/agent/ops/notes.txt /home/agent/ops/notes.txt.bak",
        output: "",
        note: "notes.txt.bak is now a byte-for-byte twin of notes.txt. The original is unchanged.",
      },
      {
        cmd: "cp -r /home/agent/ops/logs /home/agent/ops/logs-backup",
        output: "",
        note: "The entire logs directory, with everything inside it, is duplicated. Without -r this fails on directories.",
      },
    ],
    whyMatters: "Copy before you carve. In forensics you never analyze the original evidence; you work on a copy so the original stays pristine and defensible. cp -a preserves timestamps and permissions on that copy, which keeps your evidence timeline intact. Backups before risky operations are the same instinct.",
    mistakes: [
      {
        wrong: "cp /home/agent/ops/backup notes.txt",
        why: "Arguments are backwards. This tries to copy a file called backup (which may not exist) onto notes.txt. Source comes first, destination comes last, always.",
        fix: "Swap them: cp notes.txt /home/agent/ops/backup.",
      },
      {
        wrong: "cp logs logs2",
        why: "logs is a directory and cp refuses without -r: omitting directory. It will not guess that you meant the contents too.",
        fix: "Add -r: cp -r logs logs2.",
      },
      {
        wrong: "cp notes.txt /home/agent/ops/",
        why: "This actually works, it copies notes.txt into the directory keeping its name. The mistake is when ops does not exist as a directory: then cp silently renames your file to a file called ops.",
        fix: "Check the destination exists with ls first, or add the trailing slash deliberately and verify.",
      },
    ],
    proTip: "Use cp -av when copying evidence or configs: -a preserves permissions, timestamps, and symlinks exactly, and -v shows you each file as it copies so nothing happens silently.",
  },
  {
    id: "lsn-mv",
    chapter: 1,
    command: "mv",
    title: "Relocate and Rename",
    what: "mv moves files, and moving a file to a new name in the same place is how you rename things. mv notes.txt archive/ relocates it. mv notes.txt notes-old.txt renames it. It is instant because the file itself never moves on disk, only its directory entry changes, unless it crosses filesystems.",
    syntax: "mv [OPTION]... SOURCE DEST",
    examples: [
      {
        cmd: "mv /home/agent/ops/draft.txt /home/agent/ops/reports/",
        output: "",
        note: "draft.txt now lives in reports/. The original location is empty of it. A move, not a copy.",
      },
      {
        cmd: "mv alert.txt alert-2026-10-01.txt",
        output: "",
        note: "Same directory, new name. This is the rename idiom you will use constantly.",
      },
    ],
    whyMatters: "Attackers rename tools to blend in: a backdoor called ls or a payload named update.sh. When you mv files during triage, you are reorganizing evidence, and every rename should be deliberate and logged. Note that mv across filesystems silently becomes a copy plus delete, which changes timestamps and can matter for forensics.",
    mistakes: [
      {
        wrong: "mv a.txt b.txt c.txt",
        why: "With three sources the destination must be a directory, and c.txt is not one. mv refuses: target is not a directory.",
        fix: "Move them one at a time, or give a real directory as the last argument: mv a.txt b.txt archive/.",
      },
      {
        wrong: "mv report.txt /home/agent/ops/report.txt",
        why: "This is a no-op move onto itself and harmless, but the real mistake is the sibling: mv report.txt /home/agent/ops/REPORT.txt when you meant to organize, and you just renamed it by accident on a case-sensitive filesystem.",
        fix: "Decide first: rename or relocate. Then check the destination with ls before you commit.",
      },
      {
        wrong: "mv *.log archive/",
        why: "archive/ does not exist yet, so mv treats the last .log file as the destination name and renames everything into it, destroying all but one file. This is the classic mv trap.",
        fix: "mkdir -p archive first, then mv *.log archive/.",
      },
    ],
    proTip: "Add -i to mv and cp: mv -i asks before overwriting an existing file. It turns a silent data loss into a question you get to answer.",
  },
  {
    id: "lsn-cat",
    chapter: 2,
    command: "cat",
    title: "Read It All",
    what: "cat prints the entire contents of a file to your screen. cat alert.log dumps the whole file at once. Give it several files and it joins them together in order, which is literally what its name is short for: concatenate.",
    syntax: "cat [OPTION]... [FILE]...",
    examples: [
      {
        cmd: "cat /home/agent/ops/notes.txt",
        output: "03:12 anomaly window\ncheck relay-2 logs\nverify vault checksums",
        note: "The whole file, three lines, printed top to bottom. Nothing hidden, nothing paged.",
      },
      {
        cmd: "cat -n /home/agent/ops/notes.txt",
        output: "     1  03:12 anomaly window\n     2  check relay-2 logs\n     3  verify vault checksums",
        note: "The -n flag numbers each line. When you need to reference line 2 in a report, this is how.",
      },
    ],
    whyMatters: "cat is your fastest way to read small files: configs, notes, short logs, ransom notes left on a compromised box. It is also a forensics red flag when you see it in shell history aimed at /etc/shadow or private keys, because cat is how data gets read before it gets stolen.",
    mistakes: [
      {
        wrong: "cat /var/log/syslog",
        why: "This prints thousands of lines that scroll past faster than you can read. You technically saw the file and learned nothing from it.",
        fix: "Use less /var/log/syslog for big files, or head /var/log/syslog to sample the top.",
      },
      {
        wrong: "cat payload.bin",
        why: "payload.bin is binary, not text. Dumping raw bytes to your terminal can scramble the display and, in rare crafted cases, execute terminal escape sequences. Your terminal may look possessed.",
        fix: "Check the type first with file payload.bin. If it is binary, use strings or a hex viewer instead.",
      },
      {
        wrong: "cat > notes.txt",
        why: "With no input file, cat reads from your keyboard and overwrites notes.txt the moment you redirect into it. Beginners who meant to read the file just erased it.",
        fix: "To read, type cat notes.txt with the filename after cat. The > form is for writing, and it truncates first.",
      },
    ],
    proTip: "cat -A shows invisible characters: $ marks each line ending, ^I marks tabs. When a config looks right but the service refuses to start, cat -A reveals the stray carriage return or trailing space hiding in plain sight.",
  },
  {
    id: "lsn-less",
    chapter: 2,
    command: "less",
    title: "Read Without Drowning",
    what: "less opens a file in a pager: you read one screen at a time and move with the arrow keys. Unlike cat, it never floods your terminal. Inside less, / starts a search, n jumps to the next match, and q quits back to your shell.",
    syntax: "less [OPTION]... FILE",
    examples: [
      {
        cmd: "less /home/agent/ops/logs/auth.log",
        output: "Oct  1 03:12:04 relay-2 sshd[412]: Failed password for root from 185.22.44.10\nOct  1 03:12:05 relay-2 sshd[412]: Failed password for root from 185.22.44.10\n:",
        note: "The colon prompt at the bottom means you are inside less. Arrow keys scroll, /failed searches, q exits.",
      },
      {
        cmd: "dmesg | less",
        output: "[    0.000000] Linux version 6.8.0-41-generic\n[    0.000000] Command line: BOOT_IMAGE=/vmlinuz\n:",
        note: "Piping long command output into less is the standard way to read anything that does not fit on one screen.",
      },
    ],
    whyMatters: "Log files are where intrusions confess. less lets you move through a million-line auth log without loading it all into memory, searching for failed passwords and odd hours as you go. During an incident, less + / is the fastest manual triage loop there is.",
    mistakes: [
      {
        wrong: "less",
        why: "No file given, so less sits waiting for keyboard input with a blank screen. It looks frozen, but it is listening to you.",
        fix: "Press q to quit, then give it a file: less /home/agent/ops/logs/auth.log.",
      },
      {
        wrong: "cat /var/log/auth.log | less",
        why: "This works, but the cat is pointless. less reads files directly, and the extra process is a habit that marks you as a beginner.",
        fix: "Type less /var/log/auth.log. Save the pipe for command output like dmesg | less.",
      },
      {
        wrong: "less auth.log",
        why: "You are in /home/agent, but auth.log is in /home/agent/ops/logs. less reports that the file does not exist because it looks in your current directory.",
        fix: "Give the full path or cd there first: less /home/agent/ops/logs/auth.log.",
      },
    ],
    proTip: "Inside less, press F to enter follow mode: it behaves like tail -f and streams new lines live. Press Ctrl+C to drop back to normal browsing. One tool, two modes.",
  },
  {
    id: "lsn-head",
    chapter: 2,
    command: "head",
    title: "First Look",
    what: "head prints the first lines of a file. By default it shows 10 lines, and -n changes the count. head -n 20 access.log gives you the opening 20 lines. It is the quickest way to sample a file and learn its shape.",
    syntax: "head [OPTION]... [FILE]...",
    examples: [
      {
        cmd: "head /home/agent/ops/logs/access.log",
        output: "185.22.44.10 - - [01/Oct/2026:03:12:04 +0200] \"GET /login HTTP/1.1\" 200 512\n185.22.44.10 - - [01/Oct/2026:03:12:05 +0200] \"POST /login HTTP/1.1\" 401 128\n185.22.44.10 - - [01/Oct/2026:03:12:06 +0200] \"POST /login HTTP/1.1\" 401 128",
        note: "Ten lines by default would follow; the format is what matters. Timestamps, methods, status codes: this is a web access log.",
      },
      {
        cmd: "head -n 3 /home/agent/ops/logs/access.log",
        output: "185.22.44.10 - - [01/Oct/2026:03:12:04 +0200] \"GET /login HTTP/1.1\" 200 512\n185.22.44.10 - - [01/Oct/2026:03:12:05 +0200] \"POST /login HTTP/1.1\" 401 128\n185.22.44.10 - - [01/Oct/2026:03:12:06 +0200] \"POST /login HTTP/1.1\" 401 128",
        note: "Exactly three lines. When you know a log's header or first events matter, -n gives you precision.",
      },
    ],
    whyMatters: "The start of a log tells you the format, the fields, and the earliest events. In forensics, the first lines of a log often hold the initial compromise: the first probe, the first failed login, the moment before everything went wrong. head gets you there in a fraction of a second.",
    mistakes: [
      {
        wrong: "head -20 access.log",
        why: "On some systems this old-style flag still works, on others it errors. The portable form needs the n.",
        fix: "Write head -n 20 access.log. It works everywhere.",
      },
      {
        wrong: "head access.log | tail -n 5",
        why: "This shows lines 6 through 10 of the file, not the last 5 lines of anything. Beginners chain these two and get a slice they did not intend.",
        fix: "Decide what you want: the start (head alone) or the end (tail alone). Mixing them slices the middle.",
      },
      {
        wrong: "head -n 100 huge.pcap",
        why: "A pcap is binary. head will print raw bytes to your terminal and garble the display.",
        fix: "Use file first to confirm it is text. Binary captures need tshark or strings, not head.",
      },
    ],
    proTip: "head -c 200 file prints the first 200 bytes instead of lines. Perfect for peeking at file headers and magic numbers without committing to the whole file.",
  },
  {
    id: "lsn-tail",
    chapter: 2,
    command: "tail",
    title: "Watch the End",
    what: "tail prints the last lines of a file: 10 by default, -n to choose. Its famous trick is -f, follow mode, which keeps the file open and prints new lines as they are written. tail -f on a log is like watching a security camera feed in text.",
    syntax: "tail [OPTION]... [FILE]...",
    examples: [
      {
        cmd: "tail -n 3 /home/agent/ops/logs/auth.log",
        output: "Oct  1 03:14:22 relay-2 sshd[512]: Accepted password for agent from 10.0.4.2\nOct  1 03:14:23 relay-2 sshd[512]: pam_unix(sshd:auth): session opened for user agent\nOct  1 03:15:01 relay-2 CRON[600]: (root) CMD ( /usr/local/bin/sync.sh)",
        note: "The three most recent events. When something just happened, the answer is at the bottom of the log.",
      },
      {
        cmd: "tail -f /home/agent/ops/logs/auth.log",
        output: "Oct  1 03:15:01 relay-2 CRON[600]: (root) CMD ( /usr/local/bin/sync.sh)\nOct  1 03:15:44 relay-2 sshd[700]: Failed password for admin from 185.22.44.10",
        note: "This does not exit. New lines appear as they are written. Press Ctrl+C to stop watching.",
      },
    ],
    whyMatters: "Attacks are happening now, and tail -f is how you watch them land in real time: brute force attempts stacking up, a web shell being probed, a service dying and restarting. Blue teams live in tail -f during incidents. It is the closest thing to a live pulse the command line offers.",
    mistakes: [
      {
        wrong: "tail -f /var/log/auth.log.1",
        why: "That .1 file is rotated and frozen; nothing new will ever be written to it. You will stare at a dead file while the live log fills up elsewhere.",
        fix: "Follow the live file (/var/log/auth.log), or use tail -F, which survives rotation and reopens the new file automatically.",
      },
      {
        wrong: "tail log.txt",
        why: "You expected the whole story but got 10 lines. tail defaults to 10, and beginners assume it shows everything from some point.",
        fix: "Be explicit: tail -n 50 log.txt, or tail -n +1 log.txt for the entire file from line 1.",
      },
      {
        wrong: "tail -f auth.log",
        why: "Closing the terminal or losing SSH kills the tail and you miss what happened next. Follow mode is tied to your session.",
        fix: "For long watches, run it under a persistent session or log to a file: tail -f auth.log >> watch.txt.",
      },
    ],
    proTip: "tail -n +50 file starts printing at line 50 and continues to the end. It is the fastest way to skip a known header or jump past lines you have already reviewed.",
  },
  {
    id: "lsn-file",
    chapter: 2,
    command: "file",
    title: "What Is This, Really?",
    what: "file inspects a file's actual content and tells you what it is: text, image, archive, executable, and more. It reads magic numbers, the signature bytes at the start of a file, so it sees through lies. A malware payload renamed to invoice.pdf does not fool file for a second.",
    syntax: "file [OPTION]... FILE...",
    examples: [
      {
        cmd: "file /home/agent/ops/notes.txt",
        output: "/home/agent/ops/notes.txt: ASCII text",
        note: "Plain text, as advertised. Safe to cat.",
      },
      {
        cmd: "file invoice.pdf payload.jpg",
        output: "invoice.pdf: PDF document, version 1.7\npayload.jpg: ELF 64-bit LSB executable, x86-64",
        note: "The PDF is honest. The JPG is lying: it is actually a Linux executable. This is exactly how malware hides in plain sight.",
      },
    ],
    whyMatters: "Extensions are suggestions, not facts, and attackers exploit that trust constantly: executables named .jpg, scripts named .txt, archives with double extensions. In malware triage, file is step zero: it tells you whether you are holding a document or a weapon before you decide how to handle it.",
    mistakes: [
      {
        wrong: "file *.log",
        why: "You ran this in the wrong directory and file says cannot open: no such file. The glob matched nothing, so file received the literal pattern.",
        fix: "cd to the right directory first, or pass full paths: file /home/agent/ops/logs/*.log.",
      },
      {
        wrong: "file /dev/sda",
        why: "Device files are special, and file reports them as block special, which tells you nothing useful about the disk's contents.",
        fix: "For disks and images, use tools built for them: fdisk -l, or mount the image and inspect the filesystem.",
      },
      {
        wrong: "cat report.txt",
        why: "Not a file mistake exactly, but the classic ordering error: you catted a file that turned out to be binary and trashed your terminal, when file report.txt first would have warned you.",
        fix: "Make it a reflex: file before cat on anything unfamiliar.",
      },
    ],
    proTip: "file -b gives the brief answer without repeating the filename, which keeps scripts and pipelines clean. In triage loops, file -b * | sort | uniq -c shows you the type breakdown of a whole directory at a glance.",
  },
  {
    id: "lsn-wc",
    chapter: 2,
    command: "wc",
    title: "Count Everything",
    what: "wc counts: lines with -l, words with -w, bytes with -c. Plain wc prints all three numbers plus the filename. It reads from files or from a pipe, so it slots into the end of any pipeline to tell you how big the result was.",
    syntax: "wc [OPTION]... [FILE]...",
    examples: [
      {
        cmd: "wc -l /home/agent/ops/logs/auth.log",
        output: "1843 /home/agent/ops/logs/auth.log",
        note: "1843 lines. One number, one filename. This is how you learn the scale of a log before you dive in.",
      },
      {
        cmd: "grep \"Failed password\" /home/agent/ops/logs/auth.log | wc -l",
        output: "1207",
        note: "1207 failed logins. grep finds them, wc counts them. This two-command pipeline is incident response in miniature.",
      },
    ],
    whyMatters: "Counting turns suspicion into evidence. How many failed logins happened overnight? How many hosts did the worm touch? wc -l answers in one number, and that number goes straight into your incident report. Comparing counts across days is also how you spot anomalies: 12 failures yesterday, 1207 today.",
    mistakes: [
      {
        wrong: "wc auth.log",
        why: "You get three numbers, 1843 15211 132408, and beginners guess which is which. The order is lines, words, bytes, but nobody memorizes that under pressure.",
        fix: "Ask for what you want explicitly: wc -l for lines. One flag, one number, no ambiguity.",
      },
      {
        wrong: "wc -l report.txt",
        why: "The file's last line has no trailing newline, so wc -l reports one fewer than the lines you see. wc counts newline characters, not visual lines.",
        fix: "Know this quirk exists. For exactness on odd files, grep -c \"^\" counts lines regardless of the final newline.",
      },
      {
        wrong: "cat big.log | wc -l",
        why: "Works, but the cat is dead weight. wc reads files directly.",
        fix: "wc -l big.log. Save the pipe for when the input truly comes from another command.",
      },
    ],
    proTip: "wc -l *.log | sort -n ranks every log by size with the biggest last. When you land on an unfamiliar machine, this tells you in seconds which log has been the busiest, and busy logs are where the action is.",
  },
  {
    id: "lsn-diff",
    chapter: 2,
    command: "diff",
    title: "Spot the Difference",
    what: "diff compares two files line by line and shows you what changed. Lines starting with < come from the first file, lines with > come from the second. No output means the files are identical, which is itself an answer. diff -u gives the unified format with context lines that patch tools understand.",
    syntax: "diff [OPTION]... FILE1 FILE2",
    examples: [
      {
        cmd: "diff /home/agent/ops/config.bak /home/agent/ops/config",
        output: "3c3\n< PermitRootLogin yes\n---\n> PermitRootLogin no",
        note: "Line 3 changed: root login was allowed in the backup, denied now. The < side is the old file, the > side is the new one.",
      },
      {
        cmd: "diff -u /home/agent/ops/hosts.allow /home/agent/ops/hosts.allow.new",
        output: "--- /home/agent/ops/hosts.allow\n+++ /home/agent/ops/hosts.allow.new\n@@ -1,3 +1,4 @@\n 10.0.4.0/24\n+185.22.44.10\n 10.0.9.0/24",
        note: "Unified format: the + line was added. Someone whitelisted an unknown external IP. That deserves a question.",
      },
    ],
    whyMatters: "Integrity checking is diff's whole job. Compare today's config against yesterday's backup and any unauthorized change screams at you: a new user in passwd, a weakened SSH setting, a firewall rule that opened a port. Intrusion detection systems are, at heart, automated diff with alerts attached.",
    mistakes: [
      {
        wrong: "diff new.conf old.conf",
        why: "You put the files in the wrong order, so every < and > is backwards and you read the change in reverse. You conclude the setting was hardened when it was actually weakened.",
        fix: "Old file first, new file second: diff old.conf new.conf. Then < means removed, > means added.",
      },
      {
        wrong: "diff binary1 binary2",
        why: "diff reports binary files differ and shows nothing useful. It compares text lines, and binaries have none.",
        fix: "Use cmp for binaries, which tells you the first differing byte, or hash both with sha256sum and compare the hashes.",
      },
      {
        wrong: "diff a.txt b.txt",
        why: "The files differ only in trailing whitespace, and plain diff flags every line. You spend twenty minutes hunting a change that is invisible.",
        fix: "Use diff -b to ignore whitespace differences, or diff -w to ignore all whitespace.",
      },
    ],
    proTip: "diff -r dir1 dir2 compares whole directory trees recursively. Snapshot a config directory before a change, snapshot after, and diff -r shows you exactly what moved.",
  },
  {
    id: "lsn-grep",
    chapter: 3,
    command: "grep",
    title: "Find the Needle",
    what: "grep searches text for lines matching a pattern and prints them. grep \"FAILED\" auth.log shows every line containing FAILED. The flags do the heavy lifting: -i ignores case, -n adds line numbers, -c counts matches instead of printing them, and -r searches whole directory trees.",
    syntax: "grep [OPTION]... PATTERN [FILE]...",
    examples: [
      {
        cmd: "grep \"Failed password\" /home/agent/ops/logs/auth.log",
        output: "Oct  1 03:12:04 relay-2 sshd[412]: Failed password for root from 185.22.44.10\nOct  1 03:12:05 relay-2 sshd[412]: Failed password for root from 185.22.44.10",
        note: "Every matching line, printed as found. The quotes keep the two-word pattern together as one argument.",
      },
      {
        cmd: "grep -rin \"password\" /home/agent/ops/notes/",
        output: "/home/agent/ops/notes/todo.txt:3:reset vpn password for relay-2\n/home/agent/ops/notes/creds.txt:1:PASSWORD=correct horse battery staple",
        note: "-r searches every file under notes/, -i catches PASSWORD in any case, -n shows the line numbers. That creds.txt hit should make you nervous.",
      },
    ],
    whyMatters: "grep is the single most used command in security operations. Threat hunting is grep at scale: searching logs for attacker IPs, error strings, and indicators of compromise. Red teams use it to find secrets developers left in code, like passwords and API keys. If you learn one text tool deeply, make it this one.",
    mistakes: [
      {
        wrong: "grep Failed password auth.log",
        why: "Without quotes, the shell splits this into two patterns: Failed and password. grep searches for either word separately and drowns you in matches.",
        fix: "Quote multi-word patterns: grep \"Failed password\" auth.log.",
      },
      {
        wrong: "grep \"192.168.1.1\" access.log",
        why: "The dots are regex wildcards, so this also matches 192x168y1z1 and any similar string. You get false positives mixed with the real hits.",
        fix: "Use grep -F for literal fixed strings, or escape the dots: grep \"192\\.168\\.1\\.1\" access.log.",
      },
      {
        wrong: "grep \"error\" /var/log/*",
        why: "The * glob skips dotfiles and does not descend into subdirectories, so rotated logs and nested directories are never searched. You miss evidence.",
        fix: "Use grep -r \"error\" /var/log/ to search recursively through everything.",
      },
    ],
    proTip: "grep -rn \"pattern\" . --include=\"*.log\" searches only log files in the current tree. When a directory holds mixed file types, --include keeps the search fast and the noise out.",
  },
  {
    id: "lsn-sort",
    chapter: 3,
    command: "sort",
    title: "Bring Order",
    what: "sort arranges lines alphabetically. By default it sorts text as text, which means 10 comes before 2, because 1 comes before 2 as characters. The -n flag sorts numerically instead, and -r reverses the order. sort -u sorts and drops duplicates in one pass.",
    syntax: "sort [OPTION]... [FILE]...",
    examples: [
      {
        cmd: "sort /home/agent/ops/notes.txt",
        output: "03:12 anomaly window\ncheck relay-2 logs\nverify vault checksums",
        note: "Alphabetical by character. Digits sort before letters, which is why the timestamp line leads.",
      },
      {
        cmd: "sort -t: -k3 -n /etc/passwd | head -n 3",
        output: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin",
        note: "-t: splits on colons, -k3 sorts by the third field, -n treats it as a number. This ranks users by their UID.",
      },
    ],
    whyMatters: "Sorted data is analyzable data. Sorting IPs by frequency exposes your top attacker, sorting timestamps orders a scattered timeline, sorting UIDs reveals accounts that were inserted out of sequence. Almost every log analysis pipeline has a sort sitting in the middle of it.",
    mistakes: [
      {
        wrong: "sort counts.txt",
        why: "The file holds 2, 10, 100, and plain sort orders them as 10, 100, 2, because it compares characters left to right. Your top 10 list is now nonsense.",
        fix: "Add -n for numeric sorting: sort -n counts.txt gives 2, 10, 100.",
      },
      {
        wrong: "sort names.txt > names.txt",
        why: "The shell empties names.txt to prepare the redirect before sort ever reads it. sort opens an empty file and writes nothing back. Your data is gone.",
        fix: "Write to a new file, then move it over: sort names.txt > sorted.txt && mv sorted.txt names.txt.",
      },
      {
        wrong: "sort -k3 access.log",
        why: "You sorted by the third whitespace-separated field, but the field you wanted was the IP in field 1. sort counts fields from 1 and splits on blanks by default, which surprises everyone the first time.",
        fix: "Count your fields carefully, and use -t to set the delimiter explicitly when the data has one.",
      },
    ],
    proTip: "sort -u is sort plus uniq in one command: sorted output with duplicates already removed. One process, one pass, cleaner pipelines.",
  },
  {
    id: "lsn-uniq",
    chapter: 3,
    command: "uniq",
    title: "Collapse the Repeats",
    what: "uniq removes adjacent duplicate lines. Adjacent is the keyword: it only collapses repeats that sit next to each other, so unsorted input keeps most of its duplicates. The classic combo is sort first, then uniq. With -c it counts how many times each line repeated, turning a log into a frequency table.",
    syntax: "uniq [OPTION]... [INPUT [OUTPUT]]",
    examples: [
      {
        cmd: "cut -d' ' -f1 /home/agent/ops/logs/access.log | sort | uniq -c | sort -nr",
        output: "    847 185.22.44.10\n     96 10.0.4.2\n     12 10.0.9.7",
        note: "Extract IPs, sort them, count repeats, sort by count descending. One pipeline, and the top attacker is named: 847 requests from 185.22.44.10.",
      },
      {
        cmd: "uniq /home/agent/ops/notes.txt",
        output: "03:12 anomaly window\ncheck relay-2 logs\nverify vault checksums",
        note: "No adjacent duplicates here, so nothing changes. uniq is honest: it only removes what is truly repeated in a row.",
      },
    ],
    whyMatters: "Counting repeats is how you find what is loud. The IP with 847 hits is your brute forcer, the error message repeated 10,000 times is your failing service, the user logging in at 200x the normal rate is your compromised account. sort | uniq -c | sort -nr is the most reused incident-response pipeline in existence.",
    mistakes: [
      {
        wrong: "uniq access.log",
        why: "The duplicate IPs are scattered through the file, not sitting side by side, so uniq removes almost nothing. You conclude the traffic is diverse when it is actually one attacker.",
        fix: "Sort first: sort access.log | uniq. Only sorted input collapses fully.",
      },
      {
        wrong: "uniq -c ips.txt | sort -n",
        why: "You sorted numerically, which puts the smallest counts first and buries your top offender at the bottom of a long list. You stop reading before you reach it.",
        fix: "Sort in reverse: uniq -c ips.txt | sort -nr. Biggest count on top, where your eyes land first.",
      },
      {
        wrong: "sort -u ips.txt | uniq -c",
        why: "sort -u already removed the duplicates, so uniq -c counts every line as 1. The frequency data you wanted was destroyed one step earlier.",
        fix: "Use plain sort before uniq -c: sort ips.txt | uniq -c. Save -u for when you want dedup without counts.",
      },
    ],
    proTip: "uniq -d prints only the lines that were duplicated, and uniq -u prints only lines that appeared once. When you want just the repeat offenders or just the lone wolves, these flags skip the counting step entirely.",
  },
  {
    id: "lsn-cut",
    chapter: 3,
    command: "cut",
    title: "Slice Columns",
    what: "cut extracts columns from each line. With -d you name the delimiter character and with -f you pick which fields to keep. cut -d: -f1 /etc/passwd prints just the usernames. With -c you slice by character position instead, like cut -c1-10 for the first ten characters.",
    syntax: "cut OPTION... [FILE]...",
    examples: [
      {
        cmd: "cut -d: -f1 /etc/passwd",
        output: "root\ndaemon\nbin\nsys\nagent",
        note: "The colon-delimited passwd file, reduced to field 1: the usernames. One column, clean list.",
      },
      {
        cmd: "cut -d' ' -f1,9 /home/agent/ops/logs/access.log",
        output: "185.22.44.10 200\n185.22.44.10 401\n185.22.44.10 401",
        note: "Fields 1 and 9: the client IP and the HTTP status. Instant summary of who got what response.",
      },
    ],
    whyMatters: "Logs are tables wearing a text disguise, and cut is how you pull one column out of the disguise. Extracting usernames from passwd, IPs from access logs, or PIDs from process lists is the first step of nearly every analysis. It is simple, fast, and exactly right when your delimiter is consistent.",
    mistakes: [
      {
        wrong: "cut -d:: -f1 /etc/passwd",
        why: "cut accepts only a single-character delimiter. The double colon is rejected, and cut errors out.",
        fix: "Use one character: cut -d: -f1 /etc/passwd. For multi-character delimiters, switch to awk with -F.",
      },
      {
        wrong: "cut -f1 access.log",
        why: "No delimiter given, so cut defaults to tab. Your space-separated log has no tabs, so each whole line is field 1 and you get the entire line back, unchanged.",
        fix: "Name the delimiter: cut -d' ' -f1 access.log.",
      },
      {
        wrong: "cut -d' ' -f2,1 access.log",
        why: "You asked for fields 2 then 1, but cut always prints fields in line order: 1 then 2. The output order ignores your request and confuses you.",
        fix: "Accept cut's ordering, or use awk '{print $2, $1}' when you need fields rearranged.",
      },
    ],
    proTip: "cut --output-delimiter=' | ' -d: -f1,3 /etc/passwd reprints the fields with a custom separator. Handy when the original delimiter would collide with the data you are extracting.",
  },
  {
    id: "lsn-awk",
    chapter: 3,
    command: "awk",
    title: "The Column Whisperer",
    what: "awk is a tiny programming language for processing columns. It splits each line into fields: $1 is the first, $2 the second, $NF the last, $0 the whole line. awk '{print $1}' prints the first column of every line. Add -F to change the field separator from whitespace to anything else.",
    syntax: "awk [OPTION]... 'PROGRAM' [FILE]...",
    examples: [
      {
        cmd: "awk '{print $1}' /home/agent/ops/logs/access.log",
        output: "185.22.44.10\n185.22.44.10\n185.22.44.10",
        note: "First whitespace-separated field of each line: the client IPs. Same result as cut, with more power waiting behind it.",
      },
      {
        cmd: "awk -F: '$3 == 0 {print $1}' /etc/passwd",
        output: "root",
        note: "Split on colons, test if field 3 (the UID) equals 0, print field 1. This finds every account with root privileges. There should be exactly one.",
      },
    ],
    whyMatters: "awk turns log analysis from manual reading into querying. Counting 404s, summing bytes transferred, filtering by status code, finding rogue UID 0 accounts: these are one-liners in awk and afternoons of work by hand. Attackers also love awk for parsing stolen data, so recognizing it in shell history tells you what someone was extracting.",
    mistakes: [
      {
        wrong: "awk '{print $0}' access.log",
        why: "$0 is the entire line, so this prints the file unchanged. Beginners mix up $0 and $1 and wonder why nothing was extracted.",
        fix: "Fields start at $1. $0 means the whole line, $NF means the last field.",
      },
      {
        wrong: "awk '{print $1}' data.csv",
        why: "The file is comma-separated, but awk splits on whitespace by default. Field 1 becomes the whole line and you get no columns at all.",
        fix: "Set the separator: awk -F, '{print $1}' data.csv.",
      },
      {
        wrong: "awk '{print $1}'",
        why: "No file given, so awk waits on keyboard input. It looks hung, but it is patiently listening to you type.",
        fix: "Press Ctrl+D to end input, then rerun with a file: awk '{print $1}' access.log.",
      },
    ],
    proTip: "awk '$9 == 404 {count++} END {print count}' access.log counts 404 responses in one pass. The pattern before the braces filters, the END block reports. This pattern generalizes to almost any log question.",
  },
  {
    id: "lsn-sed",
    chapter: 3,
    command: "sed",
    title: "Stream Surgeon",
    what: "sed edits text as it flows through, line by line. Its most famous operation is substitution: sed 's/old/new/' replaces text. Without -i it prints the result and leaves the file untouched, which makes it safe to experiment. With -n and p it prints only chosen lines, like sed -n '10,20p' for lines 10 through 20.",
    syntax: "sed [OPTION]... 'SCRIPT' [FILE]...",
    examples: [
      {
        cmd: "sed 's/relay-2/relay-9/' /home/agent/ops/notes.txt",
        output: "03:12 anomaly window\ncheck relay-9 logs\nverify vault checksums",
        note: "The replacement shows on screen, but notes.txt on disk is unchanged. sed edits the stream, not the file, unless you ask.",
      },
      {
        cmd: "sed -n '2p' /home/agent/ops/notes.txt",
        output: "check relay-2 logs",
        note: "-n suppresses normal output, and 2p prints only line 2. A precise scalpel for extracting one line.",
      },
    ],
    whyMatters: "sed is how you rewrite configs, sanitize logs, and redact secrets at scale. Stripping passwords from a log before sharing it, updating an IP across fifty config files, deleting comment lines from a dump: sed does in one line what a text editor does in an hour. In forensics, sed -n extracts exact line ranges from massive logs without loading them.",
    mistakes: [
      {
        wrong: "sed 's/old/new/' config.txt",
        why: "The screen shows the change, but config.txt is untouched. Beginners close the terminal thinking the file is fixed, and it is not.",
        fix: "Add -i to edit in place: sed -i 's/old/new/' config.txt. Test without -i first, then commit with -i.",
      },
      {
        wrong: "sed 's/error/ok/' app.log",
        why: "Without the g flag, sed replaces only the first match per line. Lines with three errors get one fix and two survivors.",
        fix: "Add g for global: sed 's/error/ok/g' app.log replaces every occurrence on every line.",
      },
      {
        wrong: "sed 's//var/log//tmp/' paths.txt",
        why: "The slashes inside your pattern collide with the / delimiters, and sed chokes on the syntax. Unescaped delimiter chaos.",
        fix: "Use a different delimiter: sed 's|/var/log|/tmp|' paths.txt. Any character works as the delimiter.",
      },
    ],
    proTip: "sed -i.bak 's/old/new/' file edits in place but saves the original as file.bak first. You get the edit and a safety net in a single command.",
  },
  {
    id: "lsn-tr",
    chapter: 3,
    command: "tr",
    title: "Character Alchemist",
    what: "tr translates or deletes individual characters. It reads from standard input only, never from files directly. tr 'a-z' 'A-Z' uppercases everything. tr -d '\\r' deletes carriage returns. It works character by character, not on words or patterns.",
    syntax: "tr [OPTION]... SET1 [SET2]",
    examples: [
      {
        cmd: "echo \"stAtion brEach\" | tr 'a-z' 'A-Z'",
        output: "STATION BREACH",
        note: "Every lowercase letter mapped to its uppercase twin. Ranges like a-z are tr's native language.",
      },
      {
        cmd: "tr -d '\\r' < /home/agent/ops/windows-log.txt | head -n 2",
        output: "Oct  1 03:12:04 relay-2 sshd[412]: Failed password\nOct  1 03:12:05 relay-2 sshd[412]: Failed password",
        note: "Windows line endings (carriage return plus newline) break Unix tools. tr -d strips the \\r characters and the log becomes parseable.",
      },
    ],
    whyMatters: "Data from Windows machines, network captures, and attacker tools arrives with weird characters that silently break your analysis: carriage returns, null bytes, mixed case. tr cleans the stream before grep, sort, and awk ever see it. A pipeline that mysteriously misses matches is often fixed by one tr at the front.",
    mistakes: [
      {
        wrong: "tr 'a-z' 'A-Z' file.txt",
        why: "tr takes no filename argument. It ignores file.txt entirely and waits on your keyboard, looking frozen.",
        fix: "Feed it with a redirect or pipe: tr 'a-z' 'A-Z' < file.txt.",
      },
      {
        wrong: "tr 'error' 'fixed' < app.log",
        why: "tr maps characters, not words: every e becomes f, every r becomes i, and so on. Your log becomes alphabet soup instead of having one word replaced.",
        fix: "For word replacement use sed: sed 's/error/fixed/g' app.log. tr is for characters, sed is for strings.",
      },
      {
        wrong: "echo hello | tr 'A-Z' 'a-z' | tr 'a-z' 'A-Z'",
        why: "Two translations that cancel out, leaving HELLO. Beginners stack tr commands without noticing the second undoes the first.",
        fix: "Plan the transformation once. One tr with the right sets beats two fighting each other.",
      },
    ],
    proTip: "tr -s ' ' squeezes repeated spaces into one. Logs with ragged column alignment become clean and cuttable after a single squeeze.",
  },
  {
    id: "lsn-chmod",
    chapter: 4,
    command: "chmod",
    title: "Set the Locks",
    what: "chmod changes who can read, write, and execute a file. Permissions are three groups, owner, group, others, each with read (4), write (2), execute (1). chmod 600 secret.key gives the owner read and write and everyone else nothing. chmod 755 deploy.sh makes a script runnable by all but writable only by its owner.",
    syntax: "chmod [OPTION]... MODE FILE...",
    examples: [
      {
        cmd: "chmod 600 /home/agent/ops/vault.key\nls -l /home/agent/ops/vault.key",
        output: "-rw------- 1 agent ops 32 Oct  1 11:20 vault.key",
        note: "Owner reads and writes, group and others get nothing. This is the correct posture for any private key or secret.",
      },
      {
        cmd: "chmod 755 /home/agent/ops/deploy.sh\nls -l /home/agent/ops/deploy.sh",
        output: "-rwxr-xr-x 1 agent ops 128 Oct  1 11:21 deploy.sh",
        note: "Owner can do everything, everyone else can read and execute. The standard mode for scripts you intend to run.",
      },
    ],
    whyMatters: "Permissions are the locks on every door of the system. A private key at 644 is readable by every user on the box, which is how lateral movement starts. chmod 600 on secrets and 755 on scripts is not tidiness, it is the baseline of hardening. Auditors check these numbers first because attackers check them first.",
    mistakes: [
      {
        wrong: "chmod 777 app.sh",
        why: "777 gives every user on the system full read, write, and execute. Anyone can now replace your script with malware, and the next run executes it as you. This is never the fix.",
        fix: "Use 755 for scripts others must run, 700 if only you run it. If something needs write access, grant it to one group, not the world.",
      },
      {
        wrong: "chmod -R 777 /home/agent/ops",
        why: "Recursive 777 opens every file and directory under ops to everyone, including private keys and case notes. You just removed every lock in the building at once.",
        fix: "Be surgical: chmod 600 on the secret files, 755 on the scripts. Never recurse a permission change you have not scoped first.",
      },
      {
        wrong: "chmod +x notes.txt",
        why: "You made a text file executable. It does no harm sitting there, but the next person to run it gets a confusing error, and executable text files are exactly what phishing payloads look like.",
        fix: "Reserve +x for actual scripts and binaries. Text stays 644, secrets stay 600.",
      },
    ],
    proTip: "chmod u=rw,go= secret.key sets exact permissions instead of adding or removing: owner gets read-write, group and others get nothing. Symbolic modes like this say what you mean with zero arithmetic.",
  },
  {
    id: "lsn-chown",
    chapter: 4,
    command: "chown",
    title: "Change the Owner",
    what: "chown changes who owns a file. chown agent:ops report.txt makes agent the owner and ops the group. Ownership decides whose permission bits apply to you, so changing the owner changes who the file answers to. You need root privileges to give away ownership, because otherwise anyone could dodge disk quotas by gifting files around.",
    syntax: "chown [OPTION]... [OWNER][:[GROUP]] FILE...",
    examples: [
      {
        cmd: "sudo chown agent:ops /home/agent/ops/report.txt\nls -l /home/agent/ops/report.txt",
        output: "-rw-r--r-- 1 agent ops 512 Oct  1 11:25 report.txt",
        note: "Owner is now agent, group is now ops. The third and fourth columns of ls -l are the whole story of this command.",
      },
      {
        cmd: "sudo chown -R agent:ops /home/agent/ops/cases/",
        output: "",
        note: "Recursive: every file and subdirectory under cases/ now belongs to agent:ops. Used when restoring ownership after a messy copy.",
      },
    ],
    whyMatters: "Unexpected ownership is a classic intrusion signal. A system binary owned by a regular user, or a cron script owned by nobody, means someone has been rearranging the furniture. chown is also how you repair damage: files copied by root into a user's tree come back to the user with one chown -R.",
    mistakes: [
      {
        wrong: "chown agent ops/report.txt",
        why: "The space makes ops/report.txt look like a second file argument. chown tries to change the owner of two files and errors on the path that does not exist.",
        fix: "Owner and group are joined by a colon with no spaces: chown agent:ops report.txt.",
      },
      {
        wrong: "chown agent report.txt",
        why: "This runs fine as root, but as a normal user it fails with operation not permitted. Only root can change ownership, and beginners discover this mid-task.",
        fix: "Prefix with sudo: sudo chown agent report.txt. If you only need to change the group, chgrp may not need root.",
      },
      {
        wrong: "sudo chown -R agent /",
        why: "Recursive chown from the root directory reassigns ownership of the entire system. Services break, the system may not boot, and recovery is a reinstall. This is catastrophic.",
        fix: "Never recurse from /. Scope every -R to the exact subtree you mean: sudo chown -R agent /home/agent/ops/.",
      },
    ],
    proTip: "chown --reference=good.txt bad.txt copies the owner and group from a known-good file. When one file's ownership looks wrong, clone the ownership of its healthy neighbor instead of guessing.",
  },
  {
    id: "lsn-chgrp",
    chapter: 4,
    command: "chgrp",
    title: "Change the Crew",
    what: "chgrp changes a file's group without touching its owner. chgrp ops shared.txt assigns the file to the ops group. Group ownership is how teams share files: the group permission bits apply to every member of that group. Unlike chown, you can usually change the group yourself if you belong to the target group.",
    syntax: "chgrp [OPTION]... GROUP FILE...",
    examples: [
      {
        cmd: "chgrp ops /home/agent/ops/shared-notes.txt\nls -l /home/agent/ops/shared-notes.txt",
        output: "-rw-rw---- 1 agent ops 256 Oct  1 11:30 shared-notes.txt",
        note: "Group is now ops, and the group permission bits (rw-) apply to every ops member. Owner agent is untouched.",
      },
      {
        cmd: "chgrp -R ops /home/agent/ops/cases/case-042/",
        output: "",
        note: "The whole case directory tree now belongs to group ops, so the team shares consistent access to all of it.",
      },
    ],
    whyMatters: "Shared directories run on group ownership: an incident-response team needs one group with write access to the case folder, not a pile of individually permissioned files. Misassigned groups are also a finding: a sensitive file owned by group users instead of group ops means the wrong crowd can read it.",
    mistakes: [
      {
        wrong: "chgrp admins report.txt",
        why: "You are not a member of admins, so the system refuses: operation not permitted. You can only assign groups you belong to, unless you are root.",
        fix: "Use a group you are in (check with groups), or ask root: sudo chgrp admins report.txt.",
      },
      {
        wrong: "chgrp ops",
        why: "No file given, so chgrp complains about a missing operand. It changed nothing.",
        fix: "Name the target: chgrp ops report.txt.",
      },
      {
        wrong: "chgrp -R ops /home/agent/ops",
        why: "This works, but it also reassigns your private files like vault.key to group ops. If those files are group-readable, the whole team can now read your secrets.",
        fix: "Scope the recursion to the shared tree only, then verify secrets separately with ls -l.",
      },
    ],
    proTip: "Combine chgrp with the setgid bit: chmod g+s shared/ makes every new file inside shared/ inherit the directory's group automatically. The team never has to fix group ownership by hand again.",
  },
  {
    id: "lsn-umask",
    chapter: 4,
    command: "umask",
    title: "Default Locks",
    what: "umask sets the default permissions for files you create. It is a mask: bits set in the umask are removed from the defaults. Files start at 666 and directories at 777, then the umask subtracts. A umask of 022 gives new files 644 and new directories 755. A umask of 027 gives files 640 and directories 750, hiding them from other users.",
    syntax: "umask [OPTION] [MASK]",
    examples: [
      {
        cmd: "umask 027\ntouch private.txt\nmkdir private-dir\nls -ld private.txt private-dir",
        output: "-rw-r----- 1 agent ops 0 Oct  1 11:35 private.txt\ndrwxr-x--- 2 agent ops 4096 Oct  1 11:35 private-dir",
        note: "The mask 027 stripped write for group and everything for others. New files arrive locked down by default.",
      },
      {
        cmd: "umask",
        output: "0027",
        note: "Bare umask prints the current mask. Check it before you create anything sensitive.",
      },
    ],
    whyMatters: "umask is your standing security posture. A loose umask of 000 means every file you create is world-readable until you remember to chmod it, and nobody remembers every time. On multi-user systems and shared servers, umask 027 is the difference between your case notes being yours and being everyone's reading material.",
    mistakes: [
      {
        wrong: "umask 777",
        why: "This masks everything: new files get 000, unreadable and unwritable even by you. You lock yourself out of your own creations.",
        fix: "Use 022 for standard sharing or 027 for privacy. If you already set 777, just run umask 022 to restore sanity.",
      },
      {
        wrong: "umask 027",
        why: "You set this in one terminal, opened another, and your files are world-readable again. umask is per-shell, not system-wide, so it did not carry over.",
        fix: "Put umask 027 in ~/.bashrc or ~/.profile so every new shell inherits it.",
      },
      {
        wrong: "umask 777 private.txt",
        why: "umask takes no filename. The extra argument is ignored or errors, and the file's permissions do not change at all.",
        fix: "umask only affects files created after it is set. To fix an existing file, use chmod 600 private.txt.",
      },
    ],
    proTip: "Check the umask before starting sensitive work: run umask and confirm it reads 0027 or stricter. Ten seconds of checking beats discovering your evidence was world-readable for a week.",
  },
  {
    id: "lsn-sudo",
    chapter: 4,
    command: "sudo",
    title: "Borrowed Power",
    what: "sudo runs one command with root privileges. sudo systemctl restart nginx restarts the web server as root, then drops you back to normal. It asks for your password, checks that you are allowed, and logs everything. You get the power for one command without living as root.",
    syntax: "sudo [OPTION]... COMMAND",
    examples: [
      {
        cmd: "sudo ls /root/",
        output: "evidence.img",
        note: "Your normal user cannot read /root, but sudo borrows root's eyes for this one listing. Power used, power returned.",
      },
      {
        cmd: "sudo -i",
        output: "",
        note: "This opens a root shell. The prompt changes, usually to #. Every command now runs as root until you type exit. Use sparingly.",
      },
    ],
    whyMatters: "Privilege is the currency of both attack and defense. Attackers escalate to root because root can read everything, change anything, and hide anywhere. Defenders use sudo because it grants least privilege per command and leaves an audit trail in the logs. Every sudo invocation is recorded, which is exactly what you want when reconstructing who did what.",
    mistakes: [
      {
        wrong: "sudo rm -rf /tmp/cleanup",
        why: "A typo under sudo does not ask for forgiveness. As root, rm -rf has no safety rails, and one wrong path can gut the system. Sudo amplifies mistakes, not just commands.",
        fix: "Preview destructive commands without sudo first using ls or echo, then add sudo only when the target is verified.",
      },
      {
        wrong: "sudo ./mystery.sh",
        why: "You downloaded a script and ran it as root without reading it. If it is malicious, you just handed it the keys to the entire machine.",
        fix: "Read it first: less mystery.sh. Understand every line, or run it as your normal user if root is not truly needed.",
      },
      {
        wrong: "sudo su",
        why: "This drops you into a permanent root shell where every typo is a system-level event and nothing is logged per command. You lose both the safety and the audit trail.",
        fix: "Prefer sudo for single commands, or sudo -i when you truly need a root shell, and exit the moment the task is done.",
      },
    ],
    proTip: "Forgot sudo on a long command? Type sudo !! and the shell reruns your last command with sudo prepended. Also remember: edit the sudoers file only with visudo, never by hand, because one syntax error locks everyone out of sudo.",
  },
  {
    id: "lsn-ls-l",
    chapter: 4,
    command: "ls -l",
    title: "Read the Locks",
    what: "ls -l shows the long listing: permissions, owner, group, size, and timestamp for every entry. A line like -rw-r--r-- 1 agent ops 312 Oct 1 11:40 notes.txt tells a complete story. The first ten characters are the permission string, and learning to read it fluently is a core security skill.",
    syntax: "ls -l [OPTION]... [FILE]...",
    examples: [
      {
        cmd: "ls -l /home/agent/ops/",
        output: "total 16\ndrwxr-xr-x 2 agent ops 4096 Oct  1 11:40 cases\n-rw------- 1 agent ops   32 Oct  1 11:20 vault.key\n-rwxr-xr-x 1 agent ops  128 Oct  1 11:21 deploy.sh\n-rw-rw---- 1 agent ops  256 Oct  1 11:30 shared-notes.txt",
        note: "Read each line: type and permissions, owner, group, size, date, name. vault.key is locked to its owner, deploy.sh is executable, shared-notes.txt is group-writable.",
      },
      {
        cmd: "ls -l /usr/bin/passwd",
        output: "-rwsr-xr-x 1 root root 59976 Sep 12 12:00 /usr/bin/passwd",
        note: "The s in the owner's execute slot means setuid: this program runs as root no matter who launches it. Legitimate here, but every setuid binary on a system deserves scrutiny.",
      },
    ],
    whyMatters: "The permission string is the first thing you read on any unfamiliar system, and the first thing attackers try to change. A world-writable /etc/passwd, a setuid shell in /tmp, a private key readable by all: ls -l surfaces all of these in seconds. Fluency here turns a directory listing into a security audit.",
    mistakes: [
      {
        wrong: "ls -l",
        why: "You read the third column as the owner, but it is the group. The owner is the second column. Misreading this means you blame the wrong account for a permission problem.",
        fix: "Memorize the order: permissions, links, owner, group, size, date, name. Say it until it is automatic.",
      },
      {
        wrong: "ls -l script.sh",
        why: "The line shows -rw-r--r-- with no x anywhere, and you try to run it anyway. The shell refuses: permission denied. The listing already told you it was not executable.",
        fix: "Read the permission string first. No x means no execution: add it with chmod +x script.sh if the file should run.",
      },
      {
        wrong: "ls -l /tmp/",
        why: "You see a suspicious file owned by root in /tmp and assume it is legitimate because root owns it. Attackers plant files with forged ownership cues and odd timestamps precisely to pass this glance.",
        fix: "Read the whole line: permissions, timestamps, and size together. A setuid binary in /tmp modified at 03:12 is guilty until proven innocent.",
      },
    ],
    proTip: "ls -l --time-style=full-iso shows timestamps down to the second, like 2026-10-01 11:40:22. In forensics, the difference between 03:12:04 and 03:12:59 can be the whole case.",
  },
];
