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

export const LESSONS_B: Lesson[] = [
  // ================= CHAPTER 5: ENGINE ROOM (processes) =================
  {
    id: "lsn-ps",
    chapter: 5,
    command: "ps",
    title: "Take the Station Census",
    what: "ps prints a snapshot of every process running on the machine right now. A process is just a running program, and the kernel hands each one a number called a PID. Think of ps as the station roll call: name, number, who started it, how long it has been running. Run bare, ps only shows your own processes in this terminal, so the flags are what make it powerful.",
    syntax: "ps [options]",
    examples: [
      {
        cmd: "ps aux",
        output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 167524  8420 ?        Ss   May01   0:31 /sbin/init
axiom      842  0.0  0.0   8036  3204 pts/0    R+   11:40   0:00 ps aux
root      2048 97.2  4.8 412080 388112 ?      Sl   03:12  412:09 /tmp/.hidden/miner`,
        note: "aux shows every process from every user. PID is the process ID, %CPU and %MEM show resource use, STAT shows the state, COMMAND shows what is running. That miner at 97% CPU since 03:12 did not get there by accident.",
      },
      {
        cmd: "ps -ef",
        output: `UID    PID  PPID  C STIME TTY          TIME CMD
root     1     0  0 May01 ?        00:00:31 /sbin/init
root  2048  1902 99 03:12 ?        06:52:09 /tmp/.hidden/miner
axiom  842  801   0 11:40 pts/0    00:00:00 ps -ef`,
        note: "PPID is the parent process ID. Every process has a parent, so this view shows you the family tree. A miner whose parent is a web server is a very different story from one whose parent is a cron job.",
      },
      {
        cmd: "ps aux | grep miner",
        output: `root      2048 97.2  4.8 412080 388112 ?      Sl   03:12 412:09 /tmp/.hidden/miner
axiom     3150  0.0  0.0   8900   2304 pts/0    S+   11:41   0:00 grep miner`,
        note: "Searching the census by name. This list-then-filter pattern is the basic move of process hunting.",
      },
    ],
    whyMatters:
      "When the machine is slow, ps tells you exactly which process is eating it. In security, ps is a first responder tool: you list processes looking for things that do not belong, like a miner or a reverse shell hiding under a familiar name. Attackers know you will look, so they disguise names and paths, which is why you always compare what you see against what should be there.",
    mistakes: [
      {
        wrong: "ps",
        why: "Bare ps shows only processes attached to your terminal. You will conclude the machine is clean while the rogue process runs happily in the background.",
        fix: "Use ps aux or ps -ef to see every process from every user.",
      },
      {
        wrong: "ps aux | grep sshd, then killing the PID on the grep line",
        why: "grep itself appears in the output as a process matching the pattern. Kill that PID and you kill nothing useful while the real target survives.",
        fix: "Use pgrep sshd to get clean PIDs without the grep line, or filter with grep -v grep.",
      },
      {
        wrong: "kill 1",
        why: "PID 1 is init, the parent of everything. The kernel protects it, but reaching for it proves you never checked what you were killing.",
        fix: "Always verify first: ps -p <PID> -o pid,comm shows you the name behind the number.",
      },
    ],
    proTip: "ps aux --sort=-%mem | head -11 prints the ten hungriest memory consumers with a header. Sorting is half the battle.",
  },
  {
    id: "lsn-top",
    chapter: 5,
    command: "top",
    title: "Watch the Engine Breathe",
    what: "top is ps that never stops updating. It opens a live dashboard of the machine: load, CPU, memory, and the top processes refreshing every few seconds. It is interactive, so you steer it with single keys while it runs. This is the control room monitor for your processes.",
    syntax: "top",
    examples: [
      {
        cmd: "top",
        output: `top - 11:41:02 up 14 days,  3:22,  1 user,  load average: 0.12, 0.08, 0.05
Tasks: 112 total,   1 running, 111 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.1 sy,  0.0 ni, 96.4 id,  0.0 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :   7962.3 total,   5123.1 free,    982.4 used,   1856.8 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   6681.2 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 2048 root      20   0  402480 379112  12440 S  97.2   4.6 412:09.44 miner`,
        note: "Press q to quit. The top block is the machine summary, the table below is live processes sorted by CPU. That miner parked at 97.2% CPU is your squatter.",
      },
      {
        cmd: "top -b -n 1",
        output: `(one full snapshot of the same dashboard, then exits)`,
        note: "-b is batch mode, -n 1 means one snapshot. Use this in scripts or over ssh when you want output you can pipe instead of an interactive screen.",
      },
      {
        cmd: "Inside top, press M",
        output: `(the process table re-sorts by memory use)`,
        note: "Single keys steer the live view, no Enter needed. P sorts by CPU, M by memory, k kills a process by PID, 1 shows per-core CPU bars.",
      },
    ],
    whyMatters:
      "top is how you catch a CPU thief in the act: the rogue process sits at the top of the list at 99% while everything else idles. The load average tells you whether the machine is actually struggling or just busy for a moment. In incident response you open top first and let it run, because a live view catches short-lived processes that a single ps snapshot misses entirely.",
    mistakes: [
      {
        wrong: "Closing the whole terminal to escape top",
        why: "top takes over the screen and never shows a prompt, so beginners panic and kill the terminal.",
        fix: "Press q. That is the entire escape hatch.",
      },
      {
        wrong: "top | grep nginx",
        why: "top refreshes forever, so the pipe never ends and you flood the terminal with an infinite stream.",
        fix: "Use top -b -n 1 | grep nginx for a single snapshot, or use ps for this job.",
      },
      {
        wrong: "Judging the machine by the first two seconds",
        why: "CPU percentages spike at startup before settling. You will chase a process that is already finished.",
        fix: "Let it run through a few refresh cycles before you decide anything is wrong.",
      },
    ],
    proTip: "Press 1 inside top to see per-core CPU bars. A miner lighting up one core while the rest idle is a classic sight.",
  },
  {
    id: "lsn-pgrep",
    chapter: 5,
    command: "pgrep",
    title: "Find Processes by Name",
    what: "pgrep searches the process list by name and prints only the matching PIDs. It is grep for processes minus the noise: no headers, no grep line matching itself, just numbers. You almost always use pgrep to get PIDs you plan to hand to kill.",
    syntax: "pgrep [options] pattern",
    examples: [
      {
        cmd: "pgrep -l sshd",
        output: `421 sshd
905 sshd`,
        note: "-l adds the process name next to each PID, so you can confirm you matched the right thing before you act on the numbers.",
      },
      {
        cmd: "pgrep -a miner",
        output: `2048 /tmp/.hidden/miner --pool xmr.pool:4444`,
        note: "-a shows the full command line. Malware hides behind innocent names, so always check the full path before you decide what it is.",
      },
      {
        cmd: "pgrep -u axiom nginx",
        output: `3110
3112`,
        note: "-u filters by user. Handy when you only care about processes your own user started and want to ignore the system noise.",
      },
    ],
    whyMatters:
      "pgrep turns a name into a PID, which is the currency of process control. In threat hunting you sweep for known-bad names: miners, reverse shells, oddly named python processes. Because it is scriptable and silent, pgrep is the finder half of every automated hunt-and-kill loop you will ever write.",
    mistakes: [
      {
        wrong: "pgrep ssh",
        why: "This matches sshd, ssh-agent, and anything else containing 'ssh'. You get a pile of PIDs you never wanted.",
        fix: "Use pgrep -x sshd to match the exact name and nothing more.",
      },
      {
        wrong: "pgrep -f http",
        why: "-f matches the full command line, so this matches half the machine: every process with 'http' anywhere in its arguments.",
        fix: "Drop -f unless you truly need it, and prefer pgrep -x for exact names.",
      },
      {
        wrong: "pgrep Miner",
        why: "pgrep is case sensitive, so 'Miner' finds nothing when the process is actually called 'miner'.",
        fix: "Use pgrep -i Miner for case-insensitive matching.",
      },
    ],
    proTip: "pgrep -c sshd prints just the count of matches. Perfect for scripts: test whether a service died without parsing any text.",
  },
  {
    id: "lsn-kill",
    chapter: 5,
    command: "kill",
    title: "Ask a Process to Die",
    what: "kill sends a signal to a process, and the default signal politely asks it to shut down. Despite the name, kill does not always kill: it delivers a message, and the process decides what to do with it. Signal 15 (TERM) is the polite request; signal 9 (KILL) is the one that cannot be refused.",
    syntax: "kill [-signal] PID",
    examples: [
      {
        cmd: "kill 2048",
        output: ``,
        note: "No output means success. Signal 15 was sent and the process is expected to clean up and exit on its own.",
      },
      {
        cmd: "kill -9 2048",
        output: ``,
        note: "Signal 9 kills immediately with no cleanup and no chance to argue. The nuclear option, reserved for processes that ignore the polite request.",
      },
      {
        cmd: "kill -l",
        output: ` 1) SIGHUP       2) SIGINT       3) SIGQUIT       4) SIGILL
 9) SIGKILL     15) SIGTERM     18) SIGCONT     19) SIGSTOP`,
        note: "Lists every signal by number and name. TERM, KILL, HUP, and STOP are the four you will actually use.",
      },
    ],
    whyMatters:
      "kill is how you evict the squatter: the rogue process hogging CPU or holding a port hostage. TERM first, because it lets the process close files and save state; KILL only when TERM is ignored, because a -9 kill can leave corrupted files behind. In security, killing a malicious process is containment step one, but it does nothing about persistence: the malware restarts unless you also remove however it got launched.",
    mistakes: [
      {
        wrong: "kill -9 2048",
        why: "Leading with signal 9 gives the process no chance to flush buffers or close files, so you risk corrupting data for no reason.",
        fix: "Send kill 2048 first and wait a few seconds. Reach for -9 only if the process is still there.",
      },
      {
        wrong: "kill miner",
        why: "kill takes PIDs, not names. This fails with an error, or matches nothing at all.",
        fix: "Find the PID first with pgrep miner, then kill the number.",
      },
      {
        wrong: "kill 2048 without checking",
        why: "PIDs get reused. The 2048 you saw five minutes ago might belong to a different process now.",
        fix: "Verify right before you kill: ps -p 2048 -o pid,comm and confirm the name matches your target.",
      },
    ],
    proTip: "kill -0 2048 sends no signal at all; it only checks whether the PID exists. A silent way to test if a process is still alive.",
  },
  {
    id: "lsn-pkill",
    chapter: 5,
    command: "pkill",
    title: "Kill by Name, Carefully",
    what: "pkill is kill plus pgrep in one step: you give it a name pattern and it signals every matching process. It skips the PID lookup, which is convenient and exactly why it is dangerous. A sloppy pattern can take down processes you never meant to touch.",
    syntax: "pkill [-signal] pattern",
    examples: [
      {
        cmd: "pkill miner",
        output: ``,
        note: "Sends TERM to every process matching 'miner'. Always preview first with pgrep -l miner to see exactly what would die.",
      },
      {
        cmd: "pkill -9 -x badproc",
        output: ``,
        note: "-x demands an exact name match and -9 forces the kill. Precise and final: the two flags that make pkill safe to use.",
      },
      {
        cmd: "pkill -HUP nginx",
        output: ``,
        note: "Signals are not only about killing. HUP tells nginx to reload its config without dropping connections.",
      },
    ],
    whyMatters:
      "pkill is the fastest way to sweep a whole class of processes: every miner, every stale session, every hung worker. In an incident you pkill the malware family by name to stop the bleeding fast. The warning is real though: pkill matches patterns, and a pattern like 'sh' will murder half the system, so you always preview the match first.",
    mistakes: [
      {
        wrong: "pkill sh",
        why: "Matches ssh, bash, sshd, and everything containing 'sh'. You will kill your own shell and lock yourself out mid-session.",
        fix: "Preview with pgrep -l sh first, and use pkill -x for exact names.",
      },
      {
        wrong: "pkill python",
        why: "Kills every python process: your script, the system tooling, everything. On a shared box this is sabotage.",
        fix: "Narrow it with -f to the full command line of the bad one: pkill -f 'python /tmp/.hidden/miner.py'.",
      },
      {
        wrong: "pkill -9 as a reflex",
        why: "Same corruption risk as kill -9, multiplied across every match at once.",
        fix: "Default TERM first, confirm the targets are gone with pgrep, then escalate to -9 only for survivors.",
      },
    ],
    proTip: "Run pgrep -l <pattern> immediately before pkill <pattern>. It takes one second and has saved more shells than any backup.",
  },
  {
    id: "lsn-jobs",
    chapter: 5,
    command: "jobs",
    title: "Your Background Crew",
    what: "jobs lists the jobs you started from this shell that are running in the background or paused. Every job gets a number in brackets, like [1], which is different from a PID: the job number exists only inside your shell. This is your personal task board for work you pushed aside.",
    syntax: "jobs",
    examples: [
      {
        cmd: "tail -f /var/log/syslog &",
        output: `[1] 3150`,
        note: "The & launches the command in the background. The shell prints the job number [1] and its PID 3150.",
      },
      {
        cmd: "jobs",
        output: `[1]+  Running                 tail -f /var/log/syslog &
[2]-  Stopped                 vim notes.txt`,
        note: "+ marks the current job, - marks the previous one. Stopped means you paused it with Ctrl+Z and can resume it later.",
      },
      {
        cmd: "fg %2",
        output: `(vim opens in the foreground, ready to edit)`,
        note: "fg %2 brings job 2 back to the foreground. %1 and %2 are job numbers, not PIDs: the percent sign is the difference.",
      },
    ],
    whyMatters:
      "Long scans and log tails run for hours; jobs let you keep working while they run. In real work you background a scan, keep investigating, and check the results later. Security-wise, jobs live only in your shell: close the terminal and they die, which is why long evidence collection uses nohup instead.",
    mistakes: [
      {
        wrong: "kill 1    # meant job [1]",
        why: "Job numbers and PIDs are different namespaces. kill 1 targets PID 1 (init), not your background job.",
        fix: "Use kill %1 for jobs, or look up the real PID with jobs -l.",
      },
      {
        wrong: "Closing the terminal while jobs run",
        why: "Background jobs get a hangup signal when the shell exits and die with it. Your overnight scan ran for thirty seconds.",
        fix: "Use nohup or disown for work that must outlive the terminal.",
      },
      {
        wrong: "fg 2",
        why: "fg expects a job spec like %2, not a bare number. Without the percent sign it does not find your job.",
        fix: "Type fg %2, with the percent sign.",
      },
    ],
    proTip: "jobs -l shows the PID next to each job number. One command, both namespaces, zero confusion.",
  },
  {
    id: "lsn-nice",
    chapter: 5,
    command: "nice",
    title: "Set the Priority Queue",
    what: "nice launches a command with a scheduling priority, called its niceness. Niceness runs from -20 (very important, needs root) to 19 (very polite, runs last), and the default is 0. A higher niceness means the process politely yields CPU to everything else.",
    syntax: "nice [-n adjustment] command",
    examples: [
      {
        cmd: "nice -n 10 ./render.sh",
        output: ``,
        note: "The render now yields CPU to your shell and everything else. It takes longer, but the machine stays responsive while it works.",
      },
      {
        cmd: "nice -n 19 tar -czf backup.tar.gz /data",
        output: ``,
        note: "19 is maximum politeness: the backup soaks up only idle CPU and never disturbs real work.",
      },
      {
        cmd: "ps -o pid,ni,comm -p 3150",
        output: `  PID  NI COMMAND
 3150  10 render.sh`,
        note: "NI is the niceness column. Check the priority you actually got instead of assuming the flag worked.",
      },
    ],
    whyMatters:
      "nice keeps the station usable: you run heavy batch work at nice 19 so interactive work stays snappy. In security, defenders notice when malware sets itself to nice -20 to hog CPU, and attackers use nice 19 to keep miners quiet under casual observation. Priority is a dial both sides can turn.",
    mistakes: [
      {
        wrong: "nice -20 ./render.sh",
        why: "Only root can set negative niceness. As a normal user this fails with permission denied.",
        fix: "Use sudo nice -n -20 ./render.sh if you truly need it, or stick to positive values.",
      },
      {
        wrong: "nice 2048",
        why: "nice only sets priority at launch. This tries to run a command literally called '2048', which does not exist.",
        fix: "For a process that is already running, use renice -n 10 -p 2048.",
      },
      {
        wrong: "nice -n 19 on urgent work",
        why: "Maximum politeness on a job that needs to finish now means it barely runs while anything else is busy.",
        fix: "Match the niceness to the job: 19 for background chores, 0 for real work, negative only for emergencies with sudo.",
      },
    ],
    proTip: "renice -n 10 -p $(pgrep render) adjusts a running process without restarting it. No kill, no relaunch, just a quieter process.",
  },
  {
    id: "lsn-nohup",
    chapter: 5,
    command: "nohup",
    title: "Survive the Hangup",
    what: "nohup runs a command immune to the hangup signal, so it keeps running after you log out or close the terminal. Normal background jobs die with the shell; nohup detaches them from that fate. Output that would go to the terminal is redirected to a file called nohup.out.",
    syntax: "nohup command &",
    examples: [
      {
        cmd: "nohup ./long_backup.sh &",
        output: `[1] 3180
appending output to nohup.out`,
        note: "The shell reports the job and PID, then nohup tells you where the output is going. The job now outlives your session.",
      },
      {
        cmd: "cat nohup.out",
        output: `Backup started at 11:40
Copying /data... 12%`,
        note: "nohup.out is your window into the running job. Tail it any time to watch progress.",
      },
      {
        cmd: "nohup ./scan.sh > scan.log 2>&1 &",
        output: `[1] 3201`,
        note: "Redirecting output yourself skips nohup.out and gives you a named log. The 2>&1 sends errors to the same file.",
      },
    ],
    whyMatters:
      "Evidence collection and long scans must survive a dropped ssh connection, and nohup is the simplest way to guarantee that. You start the job, log out, and the work continues. Security angle: attackers love nohup too, because their backdoors and miners survive your logout. When you see nohup in a process command line, ask who started it and why.",
    mistakes: [
      {
        wrong: "nohup ./backup.sh",
        why: "Without &, nohup runs in the foreground and the terminal still blocks. You gained nothing.",
        fix: "Always end with &: nohup ./backup.sh &",
      },
      {
        wrong: "nohup ./backup.sh > /dev/null &",
        why: "Throwing away all output means you can never check what the job did or why it failed.",
        fix: "Log to a real file: nohup ./backup.sh > backup.log 2>&1 &",
      },
      {
        wrong: "Looking for nohup.out in the wrong directory",
        why: "nohup writes nohup.out to the current directory, or to $HOME if the current directory is not writable. Beginners search in the wrong place.",
        fix: "Check $HOME/nohup.out if it is not where you expected, or just name your own log file from the start.",
      },
    ],
    proTip: "Combine the trio: nohup ./job.sh > job.log 2>&1 & disown. The disown removes it from the job table so even shell exit warnings stay silent.",
  },
  // ================= CHAPTER 6: ANTENNA ARRAY (networking) =================
  {
    id: "lsn-ip",
    chapter: 6,
    command: "ip",
    title: "Read Your Own Wires",
    what: "ip shows and controls the network interfaces on your machine: their names, addresses, and state. It replaced the older ifconfig, which still exists on some systems but is retired. If the station cannot talk, ip is where you start looking.",
    syntax: "ip [object] [command]",
    examples: [
      {
        cmd: "ip addr",
        output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 10.0.4.21/24 brd 10.0.4.255 scope global dynamic noprefixroute eth0
    inet6 fe80::a00:27ff:fe4b:12ab/64 scope link noprefixroute`,
        note: "inet is your IPv4 address, eth0 is the interface name, UP means the link is live. No inet line means no address, which means no network.",
      },
      {
        cmd: "ip route",
        output: `default via 10.0.4.1 dev eth0 proto dhcp metric 100
10.0.4.0/24 dev eth0 proto kernel scope link src 10.0.4.21`,
        note: "'default via 10.0.4.1' is your gateway: where all outside traffic goes. No default route, no internet.",
      },
      {
        cmd: "ip link",
        output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000`,
        note: "lo is loopback, the machine talking to itself. DOWN state on eth0 means the cable is unplugged or the interface is switched off.",
      },
    ],
    whyMatters:
      "Every network diagnosis starts with two questions: do I have an address, and do I have a route. In security, ip reveals rogue interfaces, unexpected addresses, and interfaces in promiscuous mode that suggest sniffing. An interface you did not configure is a finding, not a mystery.",
    mistakes: [
      {
        wrong: "ifconfig",
        why: "Deprecated and often not installed. On modern minimal systems the command simply does not exist.",
        fix: "Use ip addr instead. Same information, current tool.",
      },
      {
        wrong: "ip addr show etho",
        why: "Typo: etho with the letter o instead of eth0 with a zero. Interface names are exact and unforgiving.",
        fix: "Copy the name from ip link output instead of typing it from memory.",
      },
      {
        wrong: "ip addr del 10.0.4.21/24 dev eth0",
        why: "This deletes your own address and kills your connection, including the ssh session you are typing in.",
        fix: "Read freely with ip addr, but change addresses with extreme care, and never delete the address of your own session.",
      },
    ],
    proTip: "ip -br addr gives a one-line-per-interface summary. The whole network picture in three lines.",
  },
  {
    id: "lsn-ping",
    chapter: 6,
    command: "ping",
    title: "Knock on the Door",
    what: "ping sends ICMP echo requests to a host and reports the replies. It answers the simplest network question: is that machine reachable, and how slow is the path. Each reply shows the round-trip time in milliseconds.",
    syntax: "ping [options] host",
    examples: [
      {
        cmd: "ping -c 4 10.0.4.1",
        output: `PING 10.0.4.1 (10.0.4.1) 56(84) bytes of data.
64 bytes from 10.0.4.1: icmp_seq=1 ttl=64 time=0.412 ms
64 bytes from 10.0.4.1: icmp_seq=2 ttl=64 time=0.301 ms
64 bytes from 10.0.4.1: icmp_seq=3 ttl=64 time=0.355 ms
64 bytes from 10.0.4.1: icmp_seq=4 ttl=64 time=0.380 ms

--- 10.0.4.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3003ms
rtt min/avg/max/mdev = 0.301/0.362/0.412/0.045 ms`,
        note: "-c 4 sends exactly four packets then stops. Zero packet loss and sub-millisecond times mean a healthy local link.",
      },
      {
        cmd: "ping -c 2 relay.station",
        output: `PING relay.station (10.0.9.2) 56(84) bytes of data.
64 bytes from 10.0.9.2: icmp_seq=1 ttl=63 time=1.204 ms

--- relay.station ping statistics ---
2 packets transmitted, 2 received, 0% packet loss`,
        note: "ping resolves the name first, so it also tests DNS. 'Name or service not known' means DNS is broken, not the network.",
      },
      {
        cmd: "ping -c 4 8.8.8.8",
        output: `(replies received, 0% packet loss)`,
        note: "If names fail but 8.8.8.8 replies, the network is fine and DNS is the problem. This split test is the classic diagnosis move.",
      },
    ],
    whyMatters:
      "ping is triage: reachable or not, fast or slow, and roughly where the break sits. Security teams watch ping because attackers ping-sweep whole subnets to map live hosts, and many networks block ICMP at the border for exactly that reason. A host that does not answer ping is not necessarily down; it might just be ignoring you.",
    mistakes: [
      {
        wrong: "ping relay.station",
        why: "Without -c, ping runs forever until you Ctrl+C it. Beginners leave it running and wonder why the prompt never returns.",
        fix: "Always use -c 4 for a quick test.",
      },
      {
        wrong: "ping http://relay.station",
        why: "ping takes a hostname or IP, not a URL. The http:// breaks name resolution.",
        fix: "Use ping relay.station with no scheme.",
      },
      {
        wrong: "Declaring the host dead from ping alone",
        why: "Firewalls commonly drop ICMP while the host serves traffic perfectly well. Silence is not proof of death.",
        fix: "Follow up with a real connection test: curl or ssh to the actual service port.",
      },
    ],
    proTip: "ping -D adds timestamps to every line. When you are correlating packet drops with log entries, timestamps are everything.",
  },
  {
    id: "lsn-ss",
    chapter: 6,
    command: "ss",
    title: "Read the Sockets",
    what: "ss lists the network sockets on your machine: who is listening on which port and who is connected to whom. It replaced the older netstat. If a port is open, ss will show you, and it will show you which process opened it.",
    syntax: "ss [options]",
    examples: [
      {
        cmd: "ss -tlnp",
        output: `State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
LISTEN 0      128    0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=421,fd=3))
LISTEN 0      100    127.0.0.1:3306       0.0.0.0:*          users:(("mysqld",pid=688,fd=22))`,
        note: "-t is TCP, -l is listening, -n skips DNS lookups so it is fast, -p shows the owning process. Port 22 on 0.0.0.0 means ssh accepts connections from anywhere.",
      },
      {
        cmd: "ss -tun state established",
        output: `tcp  0  0  10.0.4.21:22   10.0.4.50:51234  ESTABLISHED
tcp  0  0  10.0.4.21:443   10.0.9.2:38190   ESTABLISHED`,
        note: "Only live connections, no clutter. This shows who is connected to your machine right now.",
      },
      {
        cmd: "ss -tlnp | grep 4444",
        output: `LISTEN 0  128  0.0.0.0:4444  0.0.0.0:*  users:(("miner",pid=2048,fd=9))`,
        note: "An unknown process listening on a high port is a classic backdoor sign. The -p flag names the culprit, and here it names your squatter.",
      },
    ],
    whyMatters:
      "ss is how you find rogue listeners: backdoors, miners with command servers, quiet exfiltration channels. Every open port should have a known owner; an unknown one is an incident until proven otherwise. Pair it with pgrep and ps: ss names the port, ps names the process, and together they name the intruder.",
    mistakes: [
      {
        wrong: "netstat -tlnp",
        why: "netstat is deprecated and often missing. On minimal systems the command is simply not there.",
        fix: "Use ss -tlnp. Same idea, current tool, faster.",
      },
      {
        wrong: "ss -tln",
        why: "You see the open port but not which process owns it, and the owner is the one fact that matters in an investigation.",
        fix: "Add -p. You need the process name, and note that -p needs sudo for processes you do not own.",
      },
      {
        wrong: "ss | grep ESTAB",
        why: "ss without flags shows a wall of unix sockets and headers, burying the TCP connections you actually wanted.",
        fix: "Use ss -tun state established for a clean list of live TCP and UDP connections.",
      },
    ],
    proTip: "ss -tlnp runs in milliseconds and needs no DNS. It is the fastest honest answer to the question 'what is listening on this box'.",
  },
  {
    id: "lsn-curl",
    chapter: 6,
    command: "curl",
    title: "Talk to the Web, Raw",
    what: "curl fetches URLs and shows you exactly what the server sent back: headers, body, errors, everything. It is the multi-tool of HTTP: downloads, API calls, POST requests, header inspection. What a browser hides, curl shows.",
    syntax: "curl [options] URL",
    examples: [
      {
        cmd: "curl -I https://relay.station/health",
        output: `HTTP/2 200
content-type: application/json
content-length: 41`,
        note: "-I fetches headers only. HTTP 200 means the service is alive; 404 or 500 means it is not.",
      },
      {
        cmd: "curl https://relay.station/api/status",
        output: `{"status":"ok","uptime_s":1209600,"relay":"online"}`,
        note: "The raw body, no rendering. This is how you talk to APIs and check what they really return.",
      },
      {
        cmd: "curl -s -o engine.log https://relay.station/logs/engine.log",
        output: ``,
        note: "-s silences the progress meter and -o saves to a file. Silent and scriptable: the download just happens.",
      },
    ],
    whyMatters:
      "curl is how you verify services, pull threat intel feeds, and test APIs without a browser in the way. Attackers use curl too: to download payloads, exfiltrate data to paste sites, and probe your web apps. In logs, a curl user-agent hitting odd URLs is always worth a second look.",
    mistakes: [
      {
        wrong: "curl relay.station",
        why: "curl needs the scheme. Without https:// it may guess wrong or fail outright.",
        fix: "Always include it: curl https://relay.station",
      },
      {
        wrong: "curl https://relay.station/install.sh | sh",
        why: "This pipes a remote script straight into your shell. If that server is compromised, you just ran attacker code as yourself.",
        fix: "Download first, read the file, then run it: curl -o install.sh URL, inspect it, then bash install.sh.",
      },
      {
        wrong: "curl -o log.txt https://relay.station/log (no -s, inside a script)",
        why: "The progress meter writes to stderr and pollutes scripted output and logs.",
        fix: "Use -s for silent mode in scripts, and add -S if you still want errors shown.",
      },
    ],
    proTip: "curl -v shows the full request and response, TLS handshake included. When a connection fails mysteriously, -v is where the answer hides.",
  },
  {
    id: "lsn-wget",
    chapter: 6,
    command: "wget",
    title: "Download, Then Walk Away",
    what: "wget downloads files from the web and is built for unattended work: it retries on failure, resumes broken downloads, and mirrors whole directories. Where curl is a conversation, wget is a delivery truck. Give it a URL and it brings the file home.",
    syntax: "wget [options] URL",
    examples: [
      {
        cmd: "wget https://relay.station/logs/engine.log",
        output: `--2026-10-01 11:40:12--  https://relay.station/logs/engine.log
Length: 4821120 (4.6M) [text/plain]
Saving to: 'engine.log'

engine.log  100%[==================>]   4.60M  12.3MB/s    in 0.4s`,
        note: "Downloads to the current directory under the original filename. The progress bar and speed tell you it is working.",
      },
      {
        cmd: "wget -c https://relay.station/iso/station.iso",
        output: `Continuing in 0s ... 62%[======>            ] 1.24G / 2.00G`,
        note: "-c resumes where a broken download stopped. For multi-gigabyte files this saves hours of re-downloading.",
      },
      {
        cmd: "wget -r -np -l 2 https://relay.station/docs/",
        output: `(downloads the docs tree, two levels deep, staying inside /docs/)`,
        note: "-r mirrors recursively, -np stays inside the directory, -l 2 limits the depth. A whole doc tree, one command, fenced in.",
      },
    ],
    whyMatters:
      "wget is how you pull datasets, ISOs, and evidence archives reliably, including over flaky links that would kill a browser download. Forensics teams wget disk images and log bundles from remote hosts. The same power cuts the other way: malware droppers use wget to fetch stage-two payloads, so unexpected wget processes in your logs deserve attention.",
    mistakes: [
      {
        wrong: "wget relay.station/logs/engine.log",
        why: "wget needs the scheme too. Without it, wget treats the string as a local filename.",
        fix: "Use the full URL: wget https://relay.station/logs/engine.log",
      },
      {
        wrong: "wget -r https://relay.station/",
        why: "Unrestricted recursion can crawl the entire site upward and download far more than you wanted, for hours.",
        fix: "Add -np (no parent) and -l 2 (two levels deep) to fence the mirror in.",
      },
      {
        wrong: "Using wget for APIs and curl for big files",
        why: "Backwards. curl speaks HTTP fluently: headers, methods, auth. wget just downloads well.",
        fix: "APIs and header work: curl. Big plain downloads and mirrors: wget.",
      },
    ],
    proTip: "wget -q --show-progress keeps the bar but drops the chatter. Clean logs, visible progress, best of both.",
  },
  {
    id: "lsn-ssh",
    chapter: 6,
    command: "ssh",
    title: "The Secure Tunnel",
    what: "ssh opens an encrypted shell on a remote machine. Everything you type and everything the server sends back travels inside that encryption. It is the single most important remote administration tool on Linux, and the one attackers want most.",
    syntax: "ssh [user@]host",
    examples: [
      {
        cmd: "ssh axiom@relay.station",
        output: `axiom@relay.station's password:
Last login: Wed Sep 30 22:14:01 2026 from 10.0.4.21
axiom@relay:~$`,
        note: "You are now typing on the relay, not your station. The changed prompt is your proof of where you are.",
      },
      {
        cmd: "ssh -i ~/.ssh/id_ed25519 axiom@relay.station",
        output: `Last login: Thu Oct  1 11:38:44 2026 from 10.0.4.21
axiom@relay:~$`,
        note: "-i picks your key file. Key login beats passwords: no typing, no interception, and the server can disable passwords entirely.",
      },
      {
        cmd: "ssh axiom@relay.station 'ps aux | grep miner'",
        output: `root  2048 97.2  4.8 412080 388112 ?  Sl  03:12 412:09 /tmp/.hidden/miner`,
        note: "A command in quotes runs on the remote host and the output comes back to you. Remote execution without an interactive session.",
      },
    ],
    whyMatters:
      "ssh is how you administer every server you will ever touch, and how you reach a compromised box to pull evidence. It is also the prime target on the internet: brute-forced passwords, stolen keys, and hijacked sessions are daily events. Key-only auth, no root login, and fail2ban are the baseline defenses you will set up on anything you own.",
    mistakes: [
      {
        wrong: "ssh root@relay.station",
        why: "Logging in as root directly is banned on sane servers, and it hides who did what in the logs.",
        fix: "Log in as your user, then sudo when you need root.",
      },
      {
        wrong: "Typing your password for every login",
        why: "Passwords get phished, keylogged, and brute-forced. Typing them constantly normalizes a bad habit.",
        fix: "Set up key auth: ssh-keygen, then ssh-copy-id axiom@relay.station, then disable password login on the server.",
      },
      {
        wrong: "Typing yes to a changed host key warning",
        why: "ssh warns when a server's fingerprint changes. That can mean a reinstall, or a machine in the middle of your connection.",
        fix: "Verify the fingerprint through a trusted channel before accepting. Never blindly accept a changed key on a production host.",
      },
    ],
    proTip: "ssh -J axiom@jump.host axiom@inner.host hops through a jump server in one command. No nested sessions, one clean tunnel.",
  },
  {
    id: "lsn-scp",
    chapter: 6,
    command: "scp",
    title: "Copy Files Through the Tunnel",
    what: "scp copies files between machines over ssh, so the transfer is encrypted end to end. The syntax mirrors cp, but either the source or the destination (or both) can be remote, written as user@host:path. It is the simplest secure file mover you have.",
    syntax: "scp source destination",
    examples: [
      {
        cmd: "scp /var/log/engine.log axiom@relay.station:/evidence/",
        output: `engine.log   100%  4618KB   8.2MB/s   00:00`,
        note: "Local file to remote directory. The colon marks the remote side; everything before it is user@host.",
      },
      {
        cmd: "scp -r /etc/config/ axiom@relay.station:/backup/",
        output: `config.yaml  100%   12KB  12.0KB/s   00:00
hosts        100%  234B 234.0B/s   00:00`,
        note: "-r copies directories recursively. Configs, log trees, whole evidence folders in one command.",
      },
      {
        cmd: "scp axiom@relay.station:/evidence/dump.pcap .",
        output: `dump.pcap    100%  248MB  24.1MB/s   00:10`,
        note: "Remote to local: the dot means here. Pulling evidence down for analysis.",
      },
    ],
    whyMatters:
      "scp is how evidence leaves a compromised host safely: encrypted, authenticated, no middleman reading it in transit. It is also how data leaves during a breach: attackers scp stolen databases to their own servers, which is why egress monitoring watches for odd scp sessions. Same tool, two directions, very different meanings.",
    mistakes: [
      {
        wrong: "scp engine.log relay.station:/evidence/",
        why: "Missing user@. scp reads 'relay.station:' as a weird local path and fails.",
        fix: "Always use user@host: scp engine.log axiom@relay.station:/evidence/",
      },
      {
        wrong: "scp -r axiom@relay.station:/evidence/* /backup/",
        why: "The unquoted * expands in your local shell, not the remote one, so it matches local files or nothing at all.",
        fix: "Quote the remote pattern: scp -r 'axiom@relay.station:/evidence/*' /backup/",
      },
      {
        wrong: "scp /evidence/dump.pcap axiom@relay.station",
        why: "Argument order is source then destination. This uploads your local file instead of downloading the remote one you wanted.",
        fix: "Remote first when pulling: scp axiom@relay.station:/evidence/dump.pcap .",
      },
    ],
    proTip: "scp -3 hostA:/file hostB:/file copies between two remote hosts through your machine. One command, no intermediate download.",
  },
  // ================= CHAPTER 7: OBSERVATORY (system info) =================
  {
    id: "lsn-df",
    chapter: 7,
    command: "df",
    title: "How Full Is the Tank",
    what: "df reports free and used space on every mounted filesystem. Disks fill up silently and everything breaks at once when they do, so df is your fuel gauge. The -h flag makes the numbers human readable: G for gigabytes instead of raw block counts.",
    syntax: "df [options] [path]",
    examples: [
      {
        cmd: "df -h",
        output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        98G   71G   22G  77% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
/dev/sdb1       500G  489G  5.0G  99% /evidence`,
        note: "Use% is the number that matters. 77% is fine; 99% on /evidence means something is about to fail.",
      },
      {
        cmd: "df -h /var/log",
        output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        98G   71G   22G  77% /`,
        note: "Give it a path and df shows only that filesystem. Targeted check, no scrolling through the full list.",
      },
      {
        cmd: "df -i",
        output: `Filesystem      Inodes  IUsed   IFree IUse% Mounted on
/dev/sda1      6553600 6553590      10  100% /`,
        note: "-i shows inode usage. A disk can be full with space left if it ran out of inodes, usually from millions of tiny files.",
      },
    ],
    whyMatters:
      "A full disk kills databases, stops logging, and crashes services, and attackers know it: log-flooding is a real denial tactic. In forensics, df plus du tells you where the space went, and a suddenly full /tmp or /var/tmp often holds a dropped payload. Check df before you debug anything weird; half of all mysterious failures are just a full disk.",
    mistakes: [
      {
        wrong: "df",
        why: "Raw 1K block counts like 102070272 are unreadable, and beginners misjudge the numbers badly.",
        fix: "Always df -h. Human readable is the default you want.",
      },
      {
        wrong: "Deleting a huge log but df still shows 100%",
        why: "If a process still holds the deleted file open, the space is not freed. The file is gone from ls but the disk stays full.",
        fix: "Find the holder with lsof | grep deleted, then restart that service or kill the process holding it.",
      },
      {
        wrong: "df -h /home/axiom/report.txt",
        why: "df shows filesystem totals, not file sizes. You get the whole partition, not your file.",
        fix: "Use du -h /home/axiom/report.txt for file sizes. df is for filesystems.",
      },
    ],
    proTip: "df -h --output=target,pcent,size,avail gives a clean four-column dashboard. Pipe it to sort and the fullest filesystem floats to the top.",
  },
  {
    id: "lsn-du",
    chapter: 7,
    command: "du",
    title: "Who Ate the Disk",
    what: "du measures how much space files and directories actually use. Where df shows the whole filesystem, du zooms into folders and names the culprits. It walks the tree and adds up sizes, so it answers the question 'where did my gigabytes go'.",
    syntax: "du [options] [path]",
    examples: [
      {
        cmd: "du -sh /var/log",
        output: `2.1G    /var/log`,
        note: "-s summarizes to one total, -h makes it readable. One line, one answer.",
      },
      {
        cmd: "du -sh /var/log/* | sort -rh | head",
        output: `1.8G    /var/log/journal
214M    /var/log/syslog.1
38M     /var/log/auth.log`,
        note: "Sizes of everything inside, sorted biggest first. The disk hog floats to the top of the list.",
      },
      {
        cmd: "du -ah /tmp | sort -rh | head -5",
        output: `3.1G    /tmp/.staging/exfil.tar.gz
3.1G    /tmp/.staging
412M    /tmp/cache.bin
12K     /tmp/.staging/note.txt
4.0K    /tmp`,
        note: "-a includes individual files. A 3GB mystery archive hiding in /tmp shows up immediately, and that filename is a finding.",
      },
    ],
    whyMatters:
      "df says the disk is full; du finds the body. In forensics you du your way down the tree to the rogue log, the runaway core dump, or the exfil staging directory an attacker filled before upload. The df and du pair is the standard drill: one finds the full filesystem, the other finds the file.",
    mistakes: [
      {
        wrong: "du /var/log",
        why: "Lists every subdirectory with raw block counts: thousands of lines of noise for one simple question.",
        fix: "Use du -sh for the total, or du -sh /var/log/* for the per-item breakdown.",
      },
      {
        wrong: "du -sh /* as root",
        why: "Walking the entire tree from / crawls the /proc and /sys pseudo-filesystems and takes forever.",
        fix: "Stay targeted: du -sh /var/*, or add --exclude=/proc --exclude=/sys.",
      },
      {
        wrong: "Ctrl+C on a slow du over terabytes",
        why: "du walks every single file, so huge trees take minutes. Beginners assume it hung and kill it right before the answer.",
        fix: "Be patient on big trees, or check df first to confirm the walk is even worth it.",
      },
    ],
    proTip: "du -sh /var/log/* 2>/dev/null | sort -rh | head -10 is the disk-hunt one-liner. Memorize it; you will use it monthly.",
  },
  {
    id: "lsn-free",
    chapter: 7,
    command: "free",
    title: "Count the Memory",
    what: "free shows how much RAM the machine has, how much is used, and how much is actually available. Linux uses spare RAM for disk cache, so 'used' looks scarier than it is; the available column is the honest number. Swap is emergency overflow space on disk, and it is slow.",
    syntax: "free [options]",
    examples: [
      {
        cmd: "free -h",
        output: `               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       1.2Gi       4.9Gi        12Mi       1.7Gi       6.3Gi
Swap:          2.0Gi          0B       2.0Gi`,
        note: "available is the real free memory: RAM your programs can actually claim right now. 6.3Gi available means this box is comfortable.",
      },
      {
        cmd: "free -h -s 2",
        output: `(the same table, refreshing every 2 seconds)`,
        note: "-s 2 refreshes the display every two seconds. Watch memory drain in real time while a suspect process runs.",
      },
      {
        cmd: "free -h",
        output: `               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       7.4Gi       112Mi        12Mi       280Mi       104Mi
Swap:          2.0Gi       1.8Gi       220Mi`,
        note: "Swap in use and available near zero: the machine ran out of RAM and started paging to disk. Performance falls off a cliff from here.",
      },
    ],
    whyMatters:
      "Memory exhaustion crashes services and triggers the OOM killer, which murders processes to keep the kernel alive. Attackers exploit this with memory bombs, and defenders watch 'available' dropping toward zero as an early warning. When a box is slow, free tells you in one second whether RAM is the problem.",
    mistakes: [
      {
        wrong: "Panicking at high 'used' memory",
        why: "Linux fills free RAM with disk cache on purpose. High used with high available is healthy, not a leak.",
        fix: "Read the available column. Worry only when available approaches zero.",
      },
      {
        wrong: "free",
        why: "Raw byte counts like 8171032576 mean nothing at a glance.",
        fix: "Always free -h.",
      },
      {
        wrong: "Adding swap to fix a memory leak",
        why: "Swap hides the symptom for an hour, then the machine thrashes and dies slower and louder.",
        fix: "Find the leaking process with ps aux --sort=-%mem and fix or restart it. Swap is a cushion, not a cure.",
      },
    ],
    proTip: "watch -n 2 free -h gives you a live memory monitor without learning top's memory view. Simple and effective.",
  },
  {
    id: "lsn-uname",
    chapter: 7,
    command: "uname",
    title: "Ask the Machine Its Name",
    what: "uname prints system information: the kernel name, version, and hardware architecture. The kernel is the core of the operating system, and its version decides which exploits work and which drivers load. uname -a gives you everything in one line.",
    syntax: "uname [options]",
    examples: [
      {
        cmd: "uname -a",
        output: `Linux axiom-station 6.8.0-41-generic #52-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`,
        note: "Linux is the kernel, 6.8.0-41-generic is the version, x86_64 is the architecture. Three facts that shape every decision after this.",
      },
      {
        cmd: "uname -r",
        output: `6.8.0-41-generic`,
        note: "Just the kernel release. Scripts and exploit checks usually want exactly this string and nothing else.",
      },
      {
        cmd: "uname -m",
        output: `x86_64`,
        note: "The architecture: x86_64, aarch64, and friends. You download binaries and exploits matched to this string.",
      },
    ],
    whyMatters:
      "Kernel version is the first thing you check on any new box: it tells you what the machine can run and what it is vulnerable to. Exploit selection starts with uname -r, because a privilege escalation exploit for 5.15 will not work on 6.8. Defenders track kernel versions across the fleet to know which patches are missing where.",
    mistakes: [
      {
        wrong: "uname, expecting the distro name",
        why: "uname reports the kernel, not the distribution. It will never say Ubuntu.",
        fix: "For the distro, read /etc/os-release or run lsb_release -a.",
      },
      {
        wrong: "Downloading 'the Linux version' of a tool",
        why: "'Linux' is not enough: an x86_64 binary will not run on aarch64. The download page lists architectures for a reason.",
        fix: "Check uname -m first, then download the matching build.",
      },
      {
        wrong: "Assuming the same kernel means the same system",
        why: "Two boxes can share a kernel version with totally different distros, packages, and configurations.",
        fix: "Combine uname -r with /etc/os-release for the full picture.",
      },
    ],
    proTip: "Reference /lib/modules/$(uname -r) in scripts instead of hardcoding a kernel version. It stays correct across updates.",
  },
  {
    id: "lsn-uptime",
    chapter: 7,
    command: "uptime",
    title: "How Long Has It Been Awake",
    what: "uptime tells you how long the machine has been running, how many users are logged in, and the load average. Load average is three numbers: the average count of busy CPUs over the last 1, 5, and 15 minutes. Roughly, load above your CPU count means the machine is queuing work.",
    syntax: "uptime",
    examples: [
      {
        cmd: "uptime",
        output: ` 11:40:12 up 14 days,  3:22,  1 user,  load average: 0.12, 0.08, 0.05`,
        note: "Fourteen days awake, one user logged in, load near zero: a calm, healthy machine.",
      },
      {
        cmd: "uptime",
        output: ` 03:14:55 up 2 min,  1 user,  load average: 8.42, 6.10, 2.33`,
        note: "Two minutes of uptime on a box that should have months means it rebooted at 03:12. That timestamp matches the breach, and it is not a coincidence.",
      },
      {
        cmd: "uptime -p",
        output: `up 2 weeks, 3 hours, 22 minutes`,
        note: "-p prints just the uptime in plain words. Nice for reports and scripts.",
      },
    ],
    whyMatters:
      "Uptime tells a story: a server that should have months of uptime but shows two hours was rebooted, possibly by an attacker covering tracks or a crash you need to investigate. Load average is your three-second health check before you dig deeper. In incident response, an unexpected reboot is always a question, never a coincidence.",
    mistakes: [
      {
        wrong: "Treating load 4.0 as bad on a 16-core box",
        why: "Load is relative to CPU count. 4.0 on sixteen cores is a light afternoon; 4.0 on two cores is a fire.",
        fix: "Compare load to nproc output. Load per core is the real metric.",
      },
      {
        wrong: "Running uptime on the wrong host",
        why: "After three ssh hops, people run uptime and quote the jump server's numbers as the target's.",
        fix: "Check your prompt's hostname before trusting any system info.",
      },
      {
        wrong: "Assuming low load means no attack",
        why: "Load measures CPU queueing, not malice. A quiet backdoor idles at zero load.",
        fix: "Pair uptime with ss -tlnp and ps aux. Load is health, not security.",
      },
    ],
    proTip: "uptime -s shows the exact boot time, like 2026-09-17 08:18:02. Compare it against your change log; unexplained reboots get investigated.",
  },
  {
    id: "lsn-history",
    chapter: 7,
    command: "history",
    title: "Your Command Diary",
    what: "history prints the commands you have typed in this shell, numbered and in order. It is your personal logbook: every typo, every breakthrough, every command you swore you would remember. You can re-run any entry by its number.",
    syntax: "history [n]",
    examples: [
      {
        cmd: "history",
        output: `  101  ls -la /var/log
  102  grep ERROR engine.log
  103  ps aux | grep miner
  104  pkill -9 -x miner
  105  ss -tlnp | grep 4444`,
        note: "Newest at the bottom, each line numbered. This is the story of your investigation, already written.",
      },
      {
        cmd: "history 10",
        output: `(the last 10 commands only)`,
        note: "Shows only the last n entries. When you need that command from an hour ago, this beats scrolling.",
      },
      {
        cmd: "sudo !!",
        output: `(re-runs the previous command with sudo)`,
        note: "!! repeats the last command. Forgot sudo on a privileged command? sudo !! fixes it in four keystrokes.",
      },
    ],
    whyMatters:
      "history turns yesterday's detective work into today's one-liner: you rebuild an investigation from the log instead of from memory. Security teams love and fear it: your history shows exactly what an intruder typed if they used your shell, which is why attackers run history -c to wipe it. A cleared history on a shared account is itself evidence.",
    mistakes: [
      {
        wrong: "mysql -u root -p'Secret123'",
        why: "The password lands in history in plain text, readable by anyone with access to the file.",
        fix: "Let the tool prompt you: mysql -u root -p with no password on the line. For scripts, use config files with 600 permissions.",
      },
      {
        wrong: "!rm",
        why: "Bang-prefix re-runs the last command starting with those letters. If that was rm -rf /tmp/staging, congratulations.",
        fix: "Check with history first, or use Ctrl+R to search interactively and confirm before running.",
      },
      {
        wrong: "history -c",
        why: "Clears the in-memory history. On a shared or investigated box this destroys evidence and looks guilty.",
        fix: "Leave history alone. If entries are sensitive, fix the habit (no secrets on the command line), not the log.",
      },
    ],
    proTip: "Ctrl+R searches history as you type. It is the fastest way to find a command you ran three weeks ago.",
  },
  {
    id: "lsn-man",
    chapter: 7,
    command: "man",
    title: "The Built-In Professor",
    what: "man opens the manual page for a command: its purpose, its flags, and examples, written by the people who built it. Every standard command ships with one. When you are stuck, man is the authoritative answer, already installed, no internet needed.",
    syntax: "man command",
    examples: [
      {
        cmd: "man ps",
        output: `PS(1)                    User Commands                    PS(1)

NAME
       ps - report a snapshot of the current processes.

SYNOPSIS
       ps [options]

DESCRIPTION
       ps displays information about a selection of the active processes.`,
        note: "Manuals open in a pager: arrow keys scroll, /search finds text, q quits. Same controls as less.",
      },
      {
        cmd: "man -k process",
        output: `kill (1)             - send a signal to a process
pgrep (1)            - look up processes based on name
ps (1)               - report a snapshot of the current processes`,
        note: "-k searches manual titles by keyword. When you know the concept but not the command name, this finds it.",
      },
      {
        cmd: "man 5 passwd",
        output: `(the manual for the passwd FILE format, not the command)`,
        note: "The number is the section. passwd the command is section 1; passwd the file is section 5. Sections disambiguate names that exist twice.",
      },
    ],
    whyMatters:
      "man is how you verify flags before running something destructive, and how you learn tools deeply instead of copying commands from the internet and hoping. In security work you man the tools on the actual target, because versions differ and the local manual is the truth for that box. Professionals read manuals; amateurs guess flags.",
    mistakes: [
      {
        wrong: "man cd",
        why: "cd is a shell builtin, not a standalone command, so there is no cd manual page.",
        fix: "Use help cd for builtins, or open man bash and search inside it.",
      },
      {
        wrong: "Scrolling man with the mouse, then closing the terminal",
        why: "The pager owns the screen. Mouse scrolling does nothing useful and beginners get stuck inside.",
        fix: "Arrow keys or space to scroll, / to search, q to quit.",
      },
      {
        wrong: "man -k 'list files'",
        why: "-k matches keywords in titles and descriptions, not full sentences. Natural language queries return nothing.",
        fix: "Search single keywords: man -k directory, man -k process.",
      },
    ],
    proTip: "man man explains the manual system itself, including all nine sections. Read it once and you will navigate every manual with confidence.",
  },
  {
    id: "lsn-env",
    chapter: 7,
    command: "env",
    title: "Read the Room",
    what: "env prints the environment variables of your shell: named values like HOME, USER, and PATH that every program inherits. Programs read these to learn where things are and who you are. Your shell is configured by these variables more than by any config file.",
    syntax: "env",
    examples: [
      {
        cmd: "env",
        output: `HOME=/home/axiom
USER=axiom
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
SHELL=/bin/bash
LANG=en_US.UTF-8`,
        note: "Each line is NAME=value. These are the defaults your shell and every child process can see.",
      },
      {
        cmd: "env | grep PATH",
        output: `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
        note: "PATH is the colon-separated list of directories searched for commands. This is why ls works without a full path.",
      },
      {
        cmd: "env | sort",
        output: `(the same variables, sorted alphabetically)`,
        note: "Sorted output is easier to scan when you are hunting one specific variable in a long list.",
      },
    ],
    whyMatters:
      "Environment variables control behavior silently: PATH decides which binary runs when you type a name, and attackers abuse that with PATH hijacking. LD_PRELOAD can inject code into every program you run. When a program misbehaves, env shows you the invisible configuration shaping it.",
    mistakes: [
      {
        wrong: "export API_KEY=secret123 in a shared script",
        why: "The secret sits in plain text in the file and in the environment of every child process.",
        fix: "Read secrets from a 600-permission file or a vault at runtime. Never hardcode them.",
      },
      {
        wrong: "PATH=.:$PATH",
        why: "Putting the current directory first in PATH lets a malicious ls script in a downloaded folder run instead of the real ls.",
        fix: "Run local scripts explicitly: ./script.sh. Keep the dot out of PATH.",
      },
      {
        wrong: "env | grep -i pass",
        why: "Well-behaved systems do not store passwords in the environment, so this finds nothing and teaches nothing.",
        fix: "Audit what IS there: unexpected LD_PRELOAD, odd PATH entries, or proxy variables you did not set.",
      },
    ],
    proTip: "env -i PATH=/usr/bin:/bin ./script.sh runs a script with a clean, minimal environment. Perfect for proving it does not secretly depend on your setup.",
  },
  {
    id: "lsn-whoami",
    chapter: 7,
    command: "whoami",
    title: "Who Are You Right Now",
    what: "whoami prints the username you are currently operating as. It sounds trivial until you have three terminals, two ssh sessions, and a sudo shell open and you are about to run rm -rf somewhere. Identity is the first fact of every privileged action.",
    syntax: "whoami",
    examples: [
      {
        cmd: "whoami",
        output: `axiom`,
        note: "One word, zero ambiguity. You are axiom in this shell.",
      },
      {
        cmd: "sudo whoami",
        output: `root`,
        note: "Under sudo you are root. This is the moment commands stop asking permission.",
      },
      {
        cmd: "whoami && id",
        output: `axiom
uid=1000(axiom) gid=1000(axiom) groups=1000(axiom),27(sudo)`,
        note: "id adds numeric IDs and group membership. whoami is the quick check; id is the full credentials.",
      },
    ],
    whyMatters:
      "Every permission decision starts with identity: files you can read, commands you can run, damage you can do. Scripts check whoami to refuse running as root when they should not. In forensics, knowing which user ran a command separates the admin's legitimate work from the attacker's.",
    mistakes: [
      {
        wrong: "Assuming you are still yourself after sudo -i",
        why: "sudo -i gives you a root shell that can look like your normal prompt. People run destructive commands thinking they are unprivileged.",
        fix: "Run whoami whenever the prompt looks unfamiliar. Paranoia is cheap.",
      },
      {
        wrong: "who am i",
        why: "That is the who command with arguments, not whoami. It prints login info, not your effective user.",
        fix: "One word, no spaces: whoami.",
      },
      {
        wrong: "if [ whoami = 'root' ]; then ...",
        why: "Missing command substitution: this compares the literal string 'whoami', which is never equal to root.",
        fix: "Capture the output: if [ \"$(whoami)\" = 'root' ]; then ...",
      },
    ],
    proTip: "Put \\u in your PS1 prompt to show the username always. You will never wonder who you are mid-session again.",
  },
  {
    id: "lsn-date",
    chapter: 7,
    command: "date",
    title: "What Time Is It, Really",
    what: "date prints the current date and time, and with flags it formats the output or sets the clock. Logs, certificates, and forensics all depend on correct time, so date is a small command with large consequences. Wrong clock, wrong timeline.",
    syntax: "date [options] [+format]",
    examples: [
      {
        cmd: "date",
        output: `Thu Oct  1 11:40:12 CEST 2026`,
        note: "Full timestamp with timezone. CEST tells you which zone the machine thinks it is in.",
      },
      {
        cmd: "date -u",
        output: `Thu Oct  1 09:40:12 UTC 2026`,
        note: "-u shows UTC, the universal reference. Forensic timelines are always built in UTC so machines can be compared.",
      },
      {
        cmd: "date '+%Y-%m-%d %H:%M:%S'",
        output: `2026-10-01 11:40:12`,
        note: "Custom format: year-month-day hour:minute:second. This format sorts correctly as plain text, which is why logs use it.",
      },
    ],
    whyMatters:
      "Every log entry is timestamped, so a wrong clock poisons your whole timeline: events appear out of order and correlation fails. Certificates refuse to validate when the clock is off, breaking TLS everywhere. Attackers change the clock to backdate their tracks or expire logs early, so date is a forensic checkpoint, not a convenience.",
    mistakes: [
      {
        wrong: "date 100111402026",
        why: "Without -s, the argument is treated as a format string or an error, not a new time. The clock does not change.",
        fix: "Set it with sudo date -s '2026-10-01 11:40:00'. Better: run an NTP client and never set it by hand.",
      },
      {
        wrong: "Comparing logs from two machines in local time",
        why: "CEST versus UTC versus whatever the other box uses: a two-hour phantom gap appears and you chase events that never happened.",
        fix: "Convert everything to UTC with date -u before comparing timelines.",
      },
      {
        wrong: "Reading date +%s as human time",
        why: "+%s prints epoch seconds like 1790881212, which is not meant for human eyes.",
        fix: "Epoch is for scripts and sorting. For humans, convert it back: date -d @1790881212.",
      },
    ],
    proTip: "date -d 'yesterday' and date -d '2 hours ago' parse English into timestamps. Log hunting with relative dates is suddenly painless.",
  },
  // ================= CHAPTER 8: REACTOR CORE (shell power) =================
  {
    id: "lsn-pipes",
    chapter: 8,
    command: "pipes",
    title: "Chain Commands Together",
    what: "The pipe character | connects two commands: the output of the left one becomes the input of the right one. Data flows left to right like water through a hose. This is the core idea of the Unix shell: small tools chained into pipelines that do big jobs.",
    syntax: "cmd1 | cmd2",
    examples: [
      {
        cmd: "ps aux | grep miner",
        output: `root      2048 97.2  4.8 412080 388112 ?      Sl   03:12 412:09 /tmp/.hidden/miner`,
        note: "ps lists everything, grep keeps only matching lines. List, then filter: the most common pipeline in existence.",
      },
      {
        cmd: "cat engine.log | grep ERROR | wc -l",
        output: `37`,
        note: "Three stages: read, filter, count. Each tool does one job and the pipe moves data between them.",
      },
      {
        cmd: "ss -tlnp | grep LISTEN | awk '{print $4}'",
        output: `0.0.0.0:22
127.0.0.1:3306
0.0.0.0:4444`,
        note: "List sockets, keep listeners, print the address column. Pipelines turn raw output into answers.",
      },
    ],
    whyMatters:
      "Pipelines are how real investigations run: you chain list, filter, count, and sort until the noise becomes a signal. Threat hunting is pipelines: processes into grep into sort into uniq. An analyst who thinks in pipes works ten times faster than one who opens files and scrolls.",
    mistakes: [
      {
        wrong: "grep ERROR | cat engine.log",
        why: "Pipes flow left to right. This runs grep with no input (it waits forever) and cats the file to nowhere useful.",
        fix: "Data flows left to right: cat engine.log | grep ERROR.",
      },
      {
        wrong: "ps aux | grep miner | kill",
        why: "kill takes PIDs as arguments, not lines on stdin. The pipeline delivers text that kill cannot use.",
        fix: "Use pkill miner, or convert text to arguments: ps aux | grep miner | awk '{print $2}' | xargs kill.",
      },
      {
        wrong: "cat file | grep pattern",
        why: "It works, but cat adds a whole process to do nothing. Purists will notice, and so will your CPU on huge files.",
        fix: "grep pattern file. Most tools take filenames directly; the pipe is for when they do not.",
      },
    ],
    proTip: "tee in a pipeline saves a copy mid-stream: ps aux | tee all.txt | grep miner. You keep the full output and the filtered view at once.",
  },
  {
    id: "lsn-redirects",
    chapter: 8,
    command: "redirects",
    title: "Aim the Output",
    what: "Redirection sends a command's output somewhere other than your screen. > writes output to a file, overwriting it. >> appends to a file, keeping what is there. 2> captures errors, which travel on a separate stream called stderr. This is how output becomes evidence on disk.",
    syntax: "cmd > file",
    examples: [
      {
        cmd: "ps aux > processes.txt",
        output: ``,
        note: "The process list lands in the file; the screen stays empty. > creates the file or empties it first.",
      },
      {
        cmd: "echo 'sweep complete' >> case.log",
        output: ``,
        note: ">> adds the line to the end of case.log without touching existing entries. Logs grow with >>, never with >.",
      },
      {
        cmd: "./scan.sh > results.txt 2> errors.txt",
        output: ``,
        note: "Normal output goes to results.txt, errors to errors.txt. Separating the streams keeps your results clean.",
      },
    ],
    whyMatters:
      "Redirection is how you preserve evidence: command output saved to timestamped files becomes your case record. Attackers use it too, wiping logs with a redirect or stuffing payloads into files with echo. When you see > in a suspicious command line, ask what got overwritten.",
    mistakes: [
      {
        wrong: "echo 'note' > case.log",
        why: "> overwrites. Your entire case log is now one line and the history is gone.",
        fix: "Use >> to append. Reserve > for when you truly want a fresh file.",
      },
      {
        wrong: "./scan.sh 2> results.txt > errors.txt",
        why: "The streams are swapped: errors land in results.txt and output in errors.txt. Order matters.",
        fix: "Stdout first: ./scan.sh > results.txt 2> errors.txt, or use 2>&1 to merge errors into the same file.",
      },
      {
        wrong: "sudo echo 'x' > /root/file",
        why: "The redirect runs as you, not as sudo. Only the echo is elevated, so the write fails with permission denied.",
        fix: "Use echo 'x' | sudo tee /root/file. tee runs elevated and writes the file.",
      },
    ],
    proTip: "> /dev/null discards output entirely: noisy_command > /dev/null 2>&1. Silence a chatty command when you only care about its exit code.",
  },
  {
    id: "lsn-wildcards",
    chapter: 8,
    command: "wildcards",
    title: "Match by Pattern",
    what: "Wildcards are pattern characters the shell expands before your command ever runs. * matches any number of characters, ? matches exactly one, and [abc] matches one character from the set. You type the pattern; the shell hands your command the matching filenames.",
    syntax: "ls *.log",
    examples: [
      {
        cmd: "ls *.log",
        output: `engine.log  auth.log  syslog.log`,
        note: "* matched every filename ending in .log. One pattern, three files.",
      },
      {
        cmd: "ls backup_?.tar.gz",
        output: `backup_1.tar.gz  backup_2.tar.gz`,
        note: "? matches exactly one character, so backup_10.tar.gz would not match. Precision matters.",
      },
      {
        cmd: "ls [ae]*.log",
        output: `engine.log  auth.log`,
        note: "[ae] matches one character that is a or e. Character classes narrow the pattern down.",
      },
    ],
    whyMatters:
      "Wildcards turn repetitive work into one command: process every log, archive every config, delete every temp file. Forensics uses them to sweep file types across a disk: *.pcap, *.key, *.db. But the shell expands them, not the command, which means a pattern that matches nothing behaves differently than beginners expect.",
    mistakes: [
      {
        wrong: "rm *.tmp",
        why: "The shell expands *.tmp against wherever you happen to be. In /tmp that might be fine; in /etc it is a disaster.",
        fix: "Run ls *.tmp first to preview the expansion, and pwd to confirm where you are.",
      },
      {
        wrong: "grep ERROR *.log",
        why: "With no .log files present, the shell passes the literal string '*.log' and grep complains the file does not exist.",
        fix: "Check with ls first, or enable nullglob so empty patterns expand to nothing.",
      },
      {
        wrong: "rm * .tmp",
        why: "The space splits it into two arguments: * matches EVERYTHING and .tmp matches nothing. This deletes all files.",
        fix: "No spaces inside patterns: rm *.tmp. Then triple-check before pressing Enter.",
      },
    ],
    proTip: "echo *.log previews any expansion safely. When a pattern feels dangerous, echo it first and rm it second.",
  },
  {
    id: "lsn-find",
    chapter: 8,
    command: "find",
    title: "Hunt Every File",
    what: "find searches directory trees for files matching your criteria: name, size, age, owner, permissions, and more. It needs no index and it checks the live filesystem. When you need every file like X under Y, find is the answer.",
    syntax: "find path [tests] [actions]",
    examples: [
      {
        cmd: "find /var/log -name '*.log'",
        output: `/var/log/syslog.log
/var/log/auth.log
/var/log/engine.log`,
        note: "-name matches the filename pattern. Quote it so the shell does not expand the * before find runs.",
      },
      {
        cmd: "find /tmp -mtime -1 -type f",
        output: `/tmp/.staging/exfil.tar.gz
/tmp/cache.bin`,
        note: "-mtime -1 means modified in the last day, -type f means regular files. Fresh files in /tmp are always worth a look.",
      },
      {
        cmd: "find / -perm -4000 2>/dev/null",
        output: `/usr/bin/sudo
/usr/bin/passwd
/tmp/.hidden/suid_shell`,
        note: "-perm -4000 finds setuid binaries: programs that run as their owner. This list should be short and familiar, and that last entry is not.",
      },
    ],
    whyMatters:
      "find is the forensic searchlight: files modified around 03:12, world-writable files, binaries with odd owners. Incident response runs find sweeps to locate dropped payloads and persistence mechanisms. If it exists on disk and matches a pattern, find will surface it.",
    mistakes: [
      {
        wrong: "find /var/log -name *.log",
        why: "The shell expands *.log against your current directory before find runs, corrupting the pattern.",
        fix: "Always quote patterns: find /var/log -name '*.log'.",
      },
      {
        wrong: "find / -name payload",
        why: "Permission-denied errors flood the screen and bury the real results.",
        fix: "Add 2>/dev/null to silence errors: find / -name payload 2>/dev/null.",
      },
      {
        wrong: "find . -name '*.tmp' -delete",
        why: "-delete removes matches immediately with no trash and no confirmation. One wrong pattern and the files are gone.",
        fix: "Run without -delete first, read the list carefully, then add -delete.",
      },
    ],
    proTip: "find /var/log -name '*.log' -mtime -1 -exec grep -l ERROR {} \\; finds recent logs containing ERROR. -exec runs a command on each match.",
  },
  {
    id: "lsn-tar",
    chapter: 8,
    command: "tar",
    title: "Pack It All Up",
    what: "tar bundles files and directories into a single archive, and with compression flags it shrinks them too. The classic flags are c to create, x to extract, v for verbose, f for the file name, and z for gzip compression. Archives are how evidence and backups travel.",
    syntax: "tar [options] archive files",
    examples: [
      {
        cmd: "tar -czf evidence.tar.gz /var/log/",
        output: ``,
        note: "c creates, z compresses with gzip, f names the file. The whole log tree becomes one portable archive.",
      },
      {
        cmd: "tar -tzf evidence.tar.gz",
        output: `var/log/syslog.log
var/log/auth.log
var/log/engine.log`,
        note: "t lists contents without extracting. Always peek inside an archive before you unpack it.",
      },
      {
        cmd: "tar -xzf evidence.tar.gz -C /analysis/",
        output: ``,
        note: "x extracts, -C picks the destination. The archive unpacks into /analysis/ instead of wherever you happen to be.",
      },
    ],
    whyMatters:
      "tar is how evidence gets collected, compressed, and moved: a whole log directory becomes one hashable file. Forensics images and case bundles travel as tar archives. The reverse is also true: attackers tar up /etc or databases before exfiltration, because one compressed file uploads faster and quieter.",
    mistakes: [
      {
        wrong: "tar -czf /var/log/",
        why: "f expects the archive filename next. Without it, tar misreads /var/log/ as the name and errors out.",
        fix: "f comes last among the flags and the name follows immediately: tar -czf logs.tar.gz /var/log/.",
      },
      {
        wrong: "tar -xzf evil.tar.gz",
        why: "Archives can contain absolute paths or ../ entries that overwrite system files on extraction. Malicious tarballs are a real attack.",
        fix: "List first with tar -tzf, then extract with -C into an empty directory.",
      },
      {
        wrong: "tar -cf backup.tar /data",
        why: "Without z, tar only bundles: the archive is the same size as the data. Beginners wonder why nothing shrank.",
        fix: "Add z for gzip (backup.tar.gz) or j for bzip2. Compression is opt-in, not automatic.",
      },
    ],
    proTip: "tar -czf - /var/log | ssh axiom@relay.station 'cat > logs.tar.gz' streams the archive straight to the remote host. No temporary file on either end.",
  },
  {
    id: "lsn-variables",
    chapter: 8,
    command: "variables",
    title: "Name Your Values",
    what: "Variables store text under a name so you can reuse it. You assign with NAME=value, no spaces around the equals sign, and you read it back with $NAME. The shell replaces $NAME with the value before running the command. Scripts are built from variables.",
    syntax: "NAME=value; echo $NAME",
    examples: [
      {
        cmd: "TARGET=relay.station; echo $TARGET",
        output: `relay.station`,
        note: "TARGET now holds the hostname. Use $TARGET everywhere instead of retyping it and risking a typo.",
      },
      {
        cmd: 'ssh axiom@$TARGET "ps aux | grep miner"',
        output: `root  2048 97.2  4.8 412080 388112 ?  Sl  03:12 412:09 /tmp/.hidden/miner`,
        note: "Variables expand inside double quotes. Change TARGET once and every command that uses it follows.",
      },
      {
        cmd: "LOGDIR=/var/log; ls $LOGDIR/*.log",
        output: `engine.log  auth.log  syslog.log`,
        note: "Variables compose with wildcards and paths. The shell expands $LOGDIR first, then the *.log pattern.",
      },
    ],
    whyMatters:
      "Variables turn brittle one-liners into reusable scripts: targets, paths, and dates defined once at the top. Every investigation script starts by naming its variables. Security note: never put secrets in variables on the command line in shared environments; they leak into history and process lists.",
    mistakes: [
      {
        wrong: "NAME = value",
        why: "The shell reads NAME as a command and = as its argument. Spaces break assignment completely.",
        fix: "No spaces: NAME=value.",
      },
      {
        wrong: "echo $TARGET",
        why: "Set TARGET in one terminal, echoed in another: variables live only in the shell that set them. The other terminal never heard of it.",
        fix: "Use export TARGET=value to pass it to child processes, or set it again in each shell.",
      },
      {
        wrong: "echo '$TARGET'",
        why: "Single quotes prevent expansion, so this prints the literal text $TARGET.",
        fix: "Use double quotes when you want expansion: echo \"$TARGET\".",
      },
    ],
    proTip: "readonly TARGET=relay.station locks a variable against accidental reassignment. Constants deserve protection.",
  },
  {
    id: "lsn-exit-codes",
    chapter: 8,
    command: "exit codes",
    title: "Every Command Leaves a Verdict",
    what: "Every command finishes with an exit code: a number from 0 to 255. Zero means success; anything else means failure, with the number hinting at what went wrong. The shell stores the last command's code in $?. Scripts read it to decide what happens next.",
    syntax: "cmd; echo $?",
    examples: [
      {
        cmd: "grep ERROR engine.log; echo $?",
        output: `Mar 12 03:12:01 relay kernel: ERROR: thermal threshold exceeded
Mar 12 03:12:44 relay auth: ERROR: 47 failed logins from 10.0.4.99
0`,
        note: "grep found matches, so it exits 0. Success here means 'I found what you asked for'.",
      },
      {
        cmd: "grep FATAL engine.log; echo $?",
        output: `1`,
        note: "No matches: grep exits 1. Not an error, just an empty result. Code 1 here means 'nothing found'.",
      },
      {
        cmd: "ls /nope; echo $?",
        output: `ls: cannot access '/nope': No such file or directory
2`,
        note: "Real failure: exit 2. Nonzero codes are how scripts detect that something actually broke.",
      },
    ],
    whyMatters:
      "Exit codes are how scripts think: if the scan succeeded, archive the results; if it failed, alert someone. Automation without exit codes is blind automation. Attackers' scripts check codes too, retrying exfiltration until it returns 0, which is why failed-then-successful connection patterns in logs tell a story.",
    mistakes: [
      {
        wrong: "grep ERROR log.txt; date; echo $?",
        why: "$? holds only the LAST command's code. The date in between overwrote grep's verdict with its own.",
        fix: "Capture it immediately: grep ERROR log.txt; code=$?; echo $code.",
      },
      {
        wrong: "Checking $? two commands later",
        why: "Every command overwrites $?, including [ tests and echo. By the time you look, the verdict belongs to something else.",
        fix: "Test right away, or save it to a variable first.",
      },
      {
        wrong: "Assuming nonzero always means catastrophe",
        why: "grep returns 1 for 'no matches', diff returns 1 for 'files differ'. These are answers, not errors.",
        fix: "Check the tool's manual for what each code means. Context decides whether nonzero is bad news.",
      },
    ],
    proTip: "cmd1 && cmd2 runs cmd2 only if cmd1 succeeded; cmd1 || cmd2 runs cmd2 only if cmd1 failed. Exit codes driving logic in a single line.",
  },
  {
    id: "lsn-loops",
    chapter: 8,
    command: "loops",
    title: "Do It to All of Them",
    what: "A for loop repeats a command for each item in a list. The shape is for name in list; do commands; done, and the shell runs the body once per item with the variable set to it. Loops turn one command into a batch job.",
    syntax: "for f in *.log; do grep ERROR $f; done",
    examples: [
      {
        cmd: 'for f in *.log; do echo "--- $f"; grep ERROR "$f"; done',
        output: `--- engine.log
Mar 12 03:12:01 relay kernel: ERROR: thermal threshold exceeded
--- auth.log
Mar 12 03:12:44 relay auth: ERROR: 47 failed logins from 10.0.4.99
--- syslog.log`,
        note: "Each log gets a header line, then its errors. One loop replaces a dozen manual commands.",
      },
      {
        cmd: "for h in relay.station backup.station; do ping -c 2 $h; done",
        output: `(two pings to relay.station, then two pings to backup.station)`,
        note: "The list can be hostnames, files, anything. The loop works through each in turn.",
      },
      {
        cmd: 'for f in *.tmp; do mv "$f" "/archive/$f"; done',
        output: ``,
        note: 'Quoting "$f" protects filenames with spaces. Every .tmp file moves to /archive/ in one sweep.',
      },
    ],
    whyMatters:
      "Loops are how you scale yourself: scan fifty logs, check twenty hosts, archive a hundred files with one construct. Incident response is loops: for every host in the list, pull the logs; for every log, hunt the indicator. If you are typing the same command with small changes, you should be looping.",
    mistakes: [
      {
        wrong: "for f in *.log do grep ERROR $f done",
        why: "One-line loops need semicolons before do and before done. Without them the shell cannot parse the loop.",
        fix: "for f in *.log; do grep ERROR $f; done",
      },
      {
        wrong: 'for f in *.tmp; do rm $f; done',
        why: "Filenames with spaces split into pieces and rm hits the wrong targets. In a loop the damage multiplies across every item.",
        fix: 'Quote every use: rm "$f".',
      },
      {
        wrong: "for i in {1..1000000}; do echo $i; done",
        why: "Brace expansion builds the entire list in memory first. A million items can exhaust RAM before the loop even starts.",
        fix: "Use a C-style loop: for ((i=1; i<=1000000; i++)); do echo $i; done",
      },
    ],
    proTip: 'Add echo in front first: for f in *.log; do echo rm "$f"; done. Preview the actions before you let the loop touch anything real.',
  },
];
