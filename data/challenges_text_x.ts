import type { Challenge } from "./challenges";

/**
 * ZONE 3 EXPANSION: Scriptorium (Text Fu), part 2.
 * 105 challenges: text-20..text-64 easy, text-65..text-99 medium, text-100..text-124 hard.
 * All setup lives under /home/agent/text/ and every challenge is self-contained.
 */
export const CHALLENGES_TEXT_X: Challenge[] = [
  // ================= EASY (text-20..text-64, xp 10) =================
  {
    id: "text-20",
    zone: 3,
    title: "Mayday Lines",
    briefing:
      "The comms buffer is full of routine chatter. Somewhere in it are mayday calls, and AXIOM is not in a patient mood. Pull every line that says mayday.",
    task: "Print every line containing 'mayday' in /home/agent/text/comms.log.",
    hint: "grep searches inside files: grep mayday /home/agent/text/comms.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/comms.log":
          "static on channel 4\nmayday from dock 7, hull breach\nroutine heartbeat ok\nmayday from bay 2, fire\nall quiet on deck 3\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\b" },
      { type: "outputContains", text: "mayday from dock 7" },
    ],
  },
  {
    id: "text-21",
    zone: 3,
    title: "Deaf to Case",
    briefing:
      "The sensor log writes alarm as ALARM, Alarm, and alarm depending on which firmware screamed it. Case is a distraction. Ignore it completely.",
    task: "Print all lines containing 'alarm' in any letter case in /home/agent/text/sensors.log.",
    hint: "grep -i ignores case: grep -i alarm /home/agent/text/sensors.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/sensors.log":
          "temp nominal\nALARM: pressure spike deck 2\nall quiet\nAlarm: motion in corridor 9\nalarm: door ajar bay 1\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\s+-i\\b" },
      { type: "outputContains", text: "pressure spike" },
    ],
  },
  {
    id: "text-22",
    zone: 3,
    title: "Not the Noise",
    briefing:
      "The event log is drowning in DEBUG lines. You have stared at packet traces long enough. Show everything except DEBUG.",
    task: "Print all lines in /home/agent/text/events.log that do NOT contain 'DEBUG'.",
    hint: "grep -v inverts the match: grep -v DEBUG /home/agent/text/events.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/events.log":
          "INFO reactor nominal\nDEBUG packet trace 441\nWARN coolant rising\nDEBUG packet trace 442\nERROR pump 3 offline\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\s+-v\\b" },
      { type: "outputContains", text: "pump 3 offline" },
    ],
  },
  {
    id: "text-23",
    zone: 3,
    title: "Tally the Intrusions",
    briefing:
      "AXIOM wants a single number for the morning report. Count the INTRUSION lines. Do not list them; nobody is reading a list at 0600.",
    task: "Count the lines containing 'INTRUSION' in /home/agent/text/ids.log.",
    hint: "grep -c counts matches: grep -c INTRUSION /home/agent/text/ids.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/ids.log":
          "INTRUSION probe port 22\nscan port 80\nINTRUSION probe port 443\nINTRUSION probe port 22\nheartbeat ok\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\s+-c\\b" },
      { type: "outputContains", text: "3" },
    ],
  },
  {
    id: "text-24",
    zone: 3,
    title: "Number the Crime",
    briefing:
      "The word vault appears exactly once in the night log. The incident report needs the exact line number, not a shrug.",
    task: "Print the line number of the line containing 'vault' in /home/agent/text/night.log.",
    hint: "grep -n shows line numbers: grep -n vault /home/agent/text/night.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/night.log": "patrol passed\ncameras nominal\nmotion near vault door\nall quiet\n",
      },
    },
    verify: [{ type: "outputContains", text: "3:motion near vault door" }],
  },
  {
    id: "text-25",
    zone: 3,
    title: "Search the Stacks",
    briefing:
      "The word beacon is hiding somewhere under the archive tree. You are not opening every file by hand like an intern.",
    task: "Recursively search /home/agent/text/archive/ for lines containing 'beacon'.",
    hint: "grep -r searches whole trees: grep -r beacon /home/agent/text/archive/",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text", "/home/agent/text/archive"],
      files: {
        "/home/agent/text/archive/a.log": "routine\n",
        "/home/agent/text/archive/b.log": "beacon ping from relay 9\n",
        "/home/agent/text/archive/c.log": "nothing\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "beacon ping from relay 9" },
    ],
  },
  {
    id: "text-26",
    zone: 3,
    title: "Only the Matches",
    briefing:
      "AXIOM does not want whole lines, just the ticket IDs. They look like id= followed by digits, and they are all that matters.",
    task: "Print only the 'id=NNNN' matches from /home/agent/text/tickets.log.",
    hint: "grep -o prints only the matching part: grep -oE 'id=[0-9]+' /home/agent/text/tickets.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/tickets.log":
          "ticket id=1042 opened by rhea\nticket id=1043 closed\nnote: no id here\nticket id=1044 escalated\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "id=1044" },
    ],
  },
  {
    id: "text-27",
    zone: 3,
    title: "Alphabetize the Crew",
    briefing:
      "The new crew roster arrived in the order people shouted their names across the dock. Fix the order.",
    task: "Display /home/agent/text/roster.txt sorted alphabetically.",
    hint: "sort orders lines: sort /home/agent/text/roster.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/roster.txt": "talia\ndominic\nrhea\nmarcus\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sort\\b" },
      { type: "outputContains", text: "dominic" },
    ],
  },
  {
    id: "text-28",
    zone: 3,
    title: "Reverse the Roll",
    briefing:
      "Command wants the same roster Z to A this time. Same data, opposite direction, zero extra effort.",
    task: "Display /home/agent/text/roster.txt sorted in reverse alphabetical order.",
    hint: "sort -r reverses the order: sort -r /home/agent/text/roster.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/roster.txt": "talia\ndominic\nrhea\nmarcus\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sort\\s+-r\\b" },
      { type: "outputContains", text: "talia" },
    ],
  },
  {
    id: "text-29",
    zone: 3,
    title: "Smallest First",
    briefing:
      "Ping latencies to the relays are listed one per line. Alphabetical order would be nonsense here. Put the fastest relay on top.",
    task: "Display /home/agent/text/latency.txt sorted numerically, smallest first.",
    hint: "sort -n sorts by number: sort -n /home/agent/text/latency.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/latency.txt": "120 relay-3\n15 relay-1\n300 relay-9\n8 relay-2\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*sort\\s+-n\\b" },
      { type: "outputContains", text: "8 relay-2" },
    ],
  },
  {
    id: "text-30",
    zone: 3,
    title: "Top of the Heap",
    briefing:
      "Drill scores are in, highest wins. Put the biggest number on top where it belongs.",
    task: "Display /home/agent/text/scores.txt sorted numerically, largest first.",
    hint: "sort -nr sorts numbers in reverse: sort -nr /home/agent/text/scores.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/scores.txt": "88 rhea\n95 marcus\n72 talia\n95 dominic\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "95 marcus" },
    ],
  },
  {
    id: "text-31",
    zone: 3,
    title: "Singles Only",
    briefing:
      "The docking queue has duplicate entries because two officers filed the same ships. Sort it and collapse the dupes in one move.",
    task: "Display the sorted unique lines of /home/agent/text/queue.txt.",
    hint: "sort -u sorts and dedupes: sort -u /home/agent/text/queue.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/queue.txt": "freighter b\nshuttle a\nfreighter b\npod c\nshuttle a\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "freighter b" },
    ],
  },
  {
    id: "text-32",
    zone: 3,
    title: "No Repeats",
    briefing:
      "This list is already sorted, but every entry appears twice. Collapse the runs so each appears once.",
    task: "Display /home/agent/text/sorted_dups.txt with duplicate lines removed.",
    hint: "uniq drops repeated lines: uniq /home/agent/text/sorted_dups.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/sorted_dups.txt": "alpha\nalpha\nbeta\nbeta\ngamma\n" },
    },
    verify: [{ type: "historyMatches", regex: "^\\s*uniq\\b" }],
  },
  {
    id: "text-33",
    zone: 3,
    title: "Count the Echoes",
    briefing:
      "The beacon log is sorted. AXIOM wants to know how many times each beacon pinged, not a raw list.",
    task: "Display each unique line of /home/agent/text/pings.txt prefixed with its count.",
    hint: "uniq -c counts repeats: uniq -c /home/agent/text/pings.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/pings.txt": "beacon-1\nbeacon-1\nbeacon-1\nbeacon-2\nbeacon-2\n" },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*uniq\\s+-c\\b" },
      { type: "outputContains", text: "beacon-2" },
    ],
  },
  {
    id: "text-34",
    zone: 3,
    title: "Repeat Offenders",
    briefing:
      "Someone keeps knocking on the same ports. Show only the ports that appear more than once in the scan log.",
    task: "From the sorted /home/agent/text/scans.txt, print only the lines that are duplicated.",
    hint: "Sort it first, then uniq -d keeps only dupes: sort /home/agent/text/scans.txt | uniq -d",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/scans.txt": "443\n22\n443\n80\n22\n8080\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\buniq\\b" },
      { type: "outputContains", text: "443" },
      { type: "outputContains", text: "22" },
    ],
  },
  {
    id: "text-35",
    zone: 3,
    title: "Tally by Hand",
    briefing:
      "AXIOM needs a frequency table of the usernames seen on the wire. Sort them, then count each run.",
    task: "Print each username in /home/agent/text/users.txt with its count, sorted alphabetically by name.",
    hint: "sort then uniq -c: sort /home/agent/text/users.txt | uniq -c",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/users.txt": "root\nadmin\nroot\nguest\nadmin\nroot\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\buniq\\b" },
      { type: "outputContains", text: "guest" },
    ],
  },
  {
    id: "text-36",
    zone: 3,
    title: "First Column Cut",
    briefing:
      "The cargo manifest is comma separated: item, bay, weight. AXIOM wants just the item names for the inventory check.",
    task: "Print only the first comma-separated field of /home/agent/text/cargo.csv.",
    hint: "cut slices fields: cut -d, -f1 /home/agent/text/cargo.csv",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/cargo.csv": "item,bay,weight\nplasma coils,bay-2,400\nrations,bay-1,120\nmedkits,bay-3,60\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*cut\\b" },
      { type: "outputContains", text: "plasma coils" },
    ],
  },
  {
    id: "text-37",
    zone: 3,
    title: "Third Field",
    briefing:
      "The crew database uses colons: name:role:clearance. Pull the clearance level, which sits in field three.",
    task: "Print only the third colon-separated field of /home/agent/text/crew.db.",
    hint: "cut -d: -f3 /home/agent/text/crew.db",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/crew.db": "rhea:pilot:5\nmarcus:engineer:3\ntalia:medic:4\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "5" },
    ],
  },
  {
    id: "text-38",
    zone: 3,
    title: "Two Columns",
    briefing:
      "From the cargo manifest, AXIOM wants item and weight but not the bay. Fields one and three, nothing else.",
    task: "Print fields 1 and 3 of /home/agent/text/cargo.csv.",
    hint: "cut takes a field list: cut -d, -f1,3 /home/agent/text/cargo.csv",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/cargo.csv": "item,bay,weight\nplasma coils,bay-2,400\nrations,bay-1,120\nmedkits,bay-3,60\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "plasma coils,400" },
    ],
  },
  {
    id: "text-39",
    zone: 3,
    title: "Serial Numbers",
    briefing:
      "Each inventory line starts with a 6-character serial. Slice the serials off for the audit sheet.",
    task: "Print characters 1 through 6 of every line in /home/agent/text/inventory.txt.",
    hint: "cut -c picks characters: cut -c1-6 /home/agent/text/inventory.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/inventory.txt": "SN-001 plasma torch\nSN-002 hull patch\nSN-003 medkit\n" },
    },
    verify: [
      { type: "outputContains", text: "SN-001" },
      { type: "outputContains", text: "SN-003" },
    ],
  },
  {
    id: "text-40",
    zone: 3,
    title: "Who Is Listed",
    briefing:
      "The account file lists user:hash:shell per line. AXIOM just wants the usernames for the access review.",
    task: "Print the first colon-separated field of /home/agent/text/accounts.txt.",
    hint: "cut -d: -f1 /home/agent/text/accounts.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/accounts.txt": "rhea:x:1001:/bin/bash\nmarcus:x:1002:/bin/sh\nvex:x:1003:/bin/false\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "vex" },
    ],
  },
  {
    id: "text-41",
    zone: 3,
    title: "First Words",
    briefing:
      "Every incident line starts with a severity word. Pull just that first word from each line for the summary.",
    task: "Print the first whitespace-separated field of every line in /home/agent/text/incidents.log.",
    hint: "awk prints fields by number: awk '{print $1}' /home/agent/text/incidents.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/incidents.log": "WARN coolant rising deck 4\nERROR pump 3 offline\nINFO patrol complete\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "ERROR" },
    ],
  },
  {
    id: "text-42",
    zone: 3,
    title: "Last Words",
    briefing:
      "Each patrol line ends with the deck name, but the lines are different lengths. Grab just the last word of every line with sed.",
    task: "Print the last word of every line in /home/agent/text/patrol.log.",
    hint: "sed 's/.* //' removes everything through the last space: sed 's/.* //' /home/agent/text/patrol.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/patrol.log": "patrol complete deck-4\npatrol complete corridor-9\nsweep done bay-2\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "corridor-9" },
    ],
  },
  {
    id: "text-43",
    zone: 3,
    title: "Comma Fields",
    briefing:
      "The shift roster is CSV: name, shift, station. Command wants just the shift column to plan coverage.",
    task: "Print the second comma-separated field of /home/agent/text/shifts.csv.",
    hint: "awk -F, sets the separator: awk -F, '{print $2}' /home/agent/text/shifts.csv",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/shifts.csv": "name,shift,station\nrhea,night,dock\nmarcus,day,core\ntalia,night,vault\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "night" },
    ],
  },
  {
    id: "text-44",
    zone: 3,
    title: "Pattern Patrol",
    briefing:
      "You need every line mentioning ERROR, printed whole. awk can match patterns directly, no grep required.",
    task: "Print every line containing 'ERROR' in /home/agent/text/sys.log.",
    hint: "An awk pattern without an action prints matches: awk '/ERROR/' /home/agent/text/sys.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/sys.log": "INFO boot ok\nERROR disk 2 failing\nINFO cron ran\nERROR net flap eth0\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "disk 2 failing" },
    ],
  },
  {
    id: "text-45",
    zone: 3,
    title: "Over the Limit",
    briefing:
      "The temp log has zone and degrees in field two. Anything above 90 is a problem, and problems get printed.",
    task: "Print every line of /home/agent/text/temps.log where the second field is greater than 90.",
    hint: "awk compares fields: awk '$2 > 90 {print $0}' /home/agent/text/temps.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/temps.log": "deck-1 72\ndeck-2 95\ndeck-3 88\ncore 104\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "core 104" },
    ],
  },
  {
    id: "text-46",
    zone: 3,
    title: "Numbered Lines",
    briefing:
      "Command wants the lockdown checklist with line numbers, so nobody skips step two again. awk knows the record number.",
    task: "Print /home/agent/text/checklist.txt with each line prefixed by its line number.",
    hint: "awk knows NR, the record number: awk '{print NR, $0}' /home/agent/text/checklist.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/checklist.txt": "seal the airlock\narm the sensors\nkill the lights\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "2 arm the sensors" },
    ],
  },
  {
    id: "text-47",
    zone: 3,
    title: "Swap the Name",
    briefing:
      "The old relay hostname is all over the config. Preview it swapped to the new one. The file itself stays untouched; this is a preview, not a commit.",
    task: "Display /home/agent/text/relay.conf with 'relay-old' replaced by 'relay-new'. Do not modify the file.",
    hint: "sed substitutes: sed 's/relay-old/relay-new/' /home/agent/text/relay.conf",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/relay.conf": "host=relay-old\nport=443\npeer=relay-old\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "relay-new" },
    ],
  },
  {
    id: "text-48",
    zone: 3,
    title: "Every Instance",
    briefing:
      "The word draft appears twice per line in the bulletin. Replace all of them, not just the first one sed feels like.",
    task: "Display /home/agent/text/bulletin.txt with every 'draft' replaced by 'final'.",
    hint: "The g flag replaces all: sed 's/draft/final/g' /home/agent/text/bulletin.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/bulletin.txt": "draft notice: draft roster posted\ndraft ends at midnight, draft review after\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "final notice: final roster posted" },
    ],
  },
  {
    id: "text-49",
    zone: 3,
    title: "Print the Panic",
    briefing:
      "The ops log is long and mostly boring. Print only the lines that mention PANIC. The boring ones can wait.",
    task: "Print only the lines containing 'PANIC' in /home/agent/text/ops.log.",
    hint: "sed -n with /pattern/p prints matches: sed -n '/PANIC/p' /home/agent/text/ops.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/ops.log": "INFO shift start\nPANIC coolant leak deck 4\nINFO shift end\nPANIC drill only, ignore\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "coolant leak" },
    ],
  },
  {
    id: "text-50",
    zone: 3,
    title: "Drop Line Two",
    briefing:
      "Line two of the manifest is a corrupted entry. Preview the file without it. Preview, again: the file stays as it is.",
    task: "Display /home/agent/text/manifest.txt with line 2 deleted. Do not modify the file.",
    hint: "sed deletes by address: sed '2d' /home/agent/text/manifest.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/manifest.txt": "cargo: plasma coils\ncargo: CORRUPTED\ncargo: rations\ncargo: medkits\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "cargo: rations" },
    ],
  },
  {
    id: "text-51",
    zone: 3,
    title: "Middle Shift",
    briefing:
      "Command only cares about the middle of the watch log: lines 4 through 6. The rest is someone else's problem.",
    task: "Print only lines 4 to 6 of /home/agent/text/watch.log.",
    hint: "sed -n with a range: sed -n '4,6p' /home/agent/text/watch.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/watch.log":
          "00:00 patrol\n01:00 quiet\n02:00 quiet\n03:00 motion deck 2\n04:00 alarm deck 2\n05:00 all clear\n06:00 shift end\n",
      },
    },
    verify: [
      { type: "outputContains", text: "motion deck 2" },
      { type: "outputContains", text: "all clear" },
    ],
  },
  {
    id: "text-52",
    zone: 3,
    title: "All Caps Alert",
    briefing:
      "A whisper-quiet warning needs to be readable from across the bridge. Convert it to uppercase.",
    task: "Display /home/agent/text/whisper.txt converted to all uppercase.",
    hint: "tr translates, reading stdin: cat /home/agent/text/whisper.txt | tr 'a-z' 'A-Z'",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/whisper.txt": "intruder in the vents\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "INTRUDER IN THE VENTS" },
    ],
  },
  {
    id: "text-53",
    zone: 3,
    title: "Quiet Lowercase",
    briefing:
      "A bulletin arrived SHOUTING IN ALL CAPS and it is giving the whole bridge a headache. Lowercase it.",
    task: "Display /home/agent/text/shout.txt converted to all lowercase.",
    hint: "tr 'A-Z' 'a-z' lowers the volume: cat /home/agent/text/shout.txt | tr 'A-Z' 'a-z'",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/shout.txt": "ALL HANDS TO DOCK 7\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "all hands to dock 7" },
    ],
  },
  {
    id: "text-54",
    zone: 3,
    title: "Strip the Digits",
    briefing:
      "An intercepted note has junk digits stuffed after every word. Delete every digit and read what is left.",
    task: "Delete every digit from /home/agent/text/coded.txt to reveal the message.",
    hint: "tr -d deletes a set: tr -d '0-9' < /home/agent/text/coded.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/coded.txt": "r4e5n6d7e8z9v0o1u2s at d3a4w5n\n" },
    },
    verify: [{ type: "outputContains", text: "rendezvous at dawn" }],
  },
  {
    id: "text-55",
    zone: 3,
    title: "Single Spacing",
    briefing:
      "The report has ragged double and triple spaces everywhere. Squeeze every run of spaces into a single one.",
    task: "Display /home/agent/text/ragged.txt with repeated spaces squeezed to single spaces.",
    hint: "tr -s squeezes repeats (name the set twice): cat /home/agent/text/ragged.txt | tr -s ' ' ' '",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/ragged.txt": "sector  7   clear\ndeck 4  quiet\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "sector 7 clear" },
    ],
  },
  {
    id: "text-56",
    zone: 3,
    title: "Recent History",
    briefing:
      "The timeline is long and AXIOM only cares about the last five events. Show the tail and move on.",
    task: "Display the last 5 lines of /home/agent/text/timeline.log.",
    hint: "tail shows the end: tail -5 /home/agent/text/timeline.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/timeline.log": "01 boot\n02 patrol\n03 quiet\n04 motion\n05 alarm\n06 response\n07 clear\n08 debrief\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b" },
      { type: "outputContains", text: "08 debrief" },
    ],
  },
  {
    id: "text-57",
    zone: 3,
    title: "Line Count",
    briefing:
      "How long is the watch bill? Count the lines. Nothing else is required.",
    task: "Count the lines in /home/agent/text/casualties.txt.",
    hint: "wc -l counts lines: wc -l /home/agent/text/casualties.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/casualties.txt": "rhea\nmarcus\ntalia\ndominic\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\b" },
      { type: "outputContains", text: "4" },
    ],
  },
  {
    id: "text-58",
    zone: 3,
    title: "Filter Then Order",
    briefing:
      "Pull the ERROR lines out of the syslog, then sort them so the duplicates sit together for inspection.",
    task: "Print the ERROR lines of /home/agent/text/syslog2.log, sorted.",
    hint: "Pipe grep into sort: grep ERROR /home/agent/text/syslog2.log | sort",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/syslog2.log": "INFO ok\nERROR zebra fault\nINFO ok\nERROR apple fault\nERROR zebra fault\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "ERROR apple fault" },
    ],
  },
  {
    id: "text-59",
    zone: 3,
    title: "Slice Then Sort",
    briefing:
      "The connection log is CSV: time, destination, bytes. Command wants every unique destination, sorted.",
    task: "Print the sorted unique values of field 2 in /home/agent/text/conns.csv.",
    hint: "cut, then sort -u: cut -d, -f2 /home/agent/text/conns.csv | sort -u",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/conns.csv": "time,dest,bytes\n01,relay-2,400\n02,relay-1,900\n03,relay-2,100\n04,relay-3,50\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "relay-1" },
    ],
  },
  {
    id: "text-60",
    zone: 3,
    title: "Find the Dotted Quads",
    briefing:
      "The probe log mixes idle chatter with IPv4 addresses. Four digit groups, dots between them. Print only the lines carrying an address.",
    task: "Print every line in /home/agent/text/probes.log containing an IPv4 address.",
    hint: "grep -E with a dotted-quad pattern: grep -E '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' /home/agent/text/probes.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/probes.log":
          "probe 1: no route\nprobe 2: hit 10.1.2.3 open\nprobe 3: timeout\nprobe 4: hit 192.168.0.77 open\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "192.168.0.77" },
    ],
  },
  {
    id: "text-61",
    zone: 3,
    title: "Delete the Debugs",
    briefing:
      "The application log is polluted with DEBUG lines. Preview it with those lines removed. The file stays dirty; your screen gets clean.",
    task: "Display /home/agent/text/app.log with every line containing 'DEBUG' deleted. Do not modify the file.",
    hint: "sed deletes by pattern: sed '/DEBUG/d' /home/agent/text/app.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/app.log": "INFO start\nDEBUG x=1\nINFO serving\nDEBUG x=2\nWARN slow query\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "WARN slow query" },
    ],
  },
  {
    id: "text-62",
    zone: 3,
    title: "Head of the Class",
    briefing:
      "The alert queue is long and command has thirty seconds. Show just the first three alerts.",
    task: "Display the first 3 lines of /home/agent/text/alerts2.log.",
    hint: "head shows the start: head -3 /home/agent/text/alerts2.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/alerts2.log": "alert 1: motion\nalert 2: motion\nalert 3: breach\nalert 4: breach\nalert 5: clear\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\b" },
      { type: "outputContains", text: "alert 3: breach" },
    ],
  },
  {
    id: "text-63",
    zone: 3,
    title: "Skip the Header",
    briefing:
      "The roster CSV has a header row you do not need. Print everything after line one.",
    task: "Print all lines of /home/agent/text/roster2.csv except the first.",
    hint: "tail -n +2 starts at line 2: tail -n +2 /home/agent/text/roster2.csv",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/roster2.csv": "name,role\nrhea,pilot\nmarcus,engineer\ntalia,medic\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b" },
      { type: "outputContains", text: "talia,medic" },
    ],
  },
  {
    id: "text-64",
    zone: 3,
    title: "Count the Words",
    briefing:
      "The distress call transcript is short. AXIOM wants the word count for the log, and it wants it now.",
    task: "Count the words in /home/agent/text/distress.txt.",
    hint: "wc -w counts words: wc -w /home/agent/text/distress.txt",
    xp: 10,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/distress.txt": "mayday mayday hull breach deck seven\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\b" },
      { type: "outputContains", text: "6" },
    ],
  },
  // ================= MEDIUM (text-65..text-99, xp 20) =================
  {
    id: "text-65",
    zone: 3,
    title: "Fifth Field IPs",
    briefing:
      "Every BREACH line in the firewall log carries the attacker IP as field five. Filter the lines, then slice the field.",
    task: "Print the 5th whitespace-separated field of every line containing 'BREACH' in /home/agent/text/fw.log.",
    hint: "grep then cut: grep BREACH /home/agent/text/fw.log | cut -d' ' -f5",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/fw.log":
          "03:12:01 BREACH detected from 10.9.0.5 port 443\n03:12:02 ALLOW from 10.9.0.6 port 80\n03:12:03 BREACH detected from 10.9.0.9 port 22\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "10.9.0.9" },
    ],
  },
  {
    id: "text-66",
    zone: 3,
    title: "Silence the Comments",
    briefing:
      "The config dump has comment lines starting with #. Count the ERROR lines among the real entries only. Comments do not count.",
    task: "Count lines containing 'ERROR' in /home/agent/text/mixed.log, ignoring lines that start with '#'.",
    hint: "Strip comments first, then count: grep -v '^#' /home/agent/text/mixed.log | grep -c ERROR",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/mixed.log": "# old config\nERROR disk failing\n# ERROR was here before\nINFO ok\nERROR net down\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "2" },
    ],
  },
  {
    id: "text-67",
    zone: 3,
    title: "Talker Tally",
    briefing:
      "Someone is hammering the relay. Field two of the hits CSV is the source host. Rank the hosts by count, loudest first.",
    task: "Print each source host in /home/agent/text/hits.csv with its count, most frequent first.",
    hint: "cut, count, then sort numbers reversed: cut -d, -f2 /home/agent/text/hits.csv | sort | uniq -c | sort -nr",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/hits.csv": "t,src\n01,relay-2\n02,relay-1\n03,relay-2\n04,relay-3\n05,relay-2\n06,relay-1\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "relay-2" },
    ],
  },
  {
    id: "text-68",
    zone: 3,
    title: "Sort by the Third",
    briefing:
      "This drill bans sort's column picker, so cheat like a professional: prepend the key, sort numerically, strip the key.",
    task: "Display the lines of /home/agent/text/draw.csv sorted numerically by the third comma-separated field, largest first. Keep the original lines intact.",
    hint: "awk -F, '{print $3, $0}' /home/agent/text/draw.csv | sort -nr | cut -d' ' -f2-",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/draw.csv": "reactor,core,320\nlights,dock,40\nsensors,vault,150\npumps,dock,90\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "reactor,core,320" },
    ],
  },
  {
    id: "text-69",
    zone: 3,
    title: "Double Translation",
    briefing:
      "The smuggler's note is lowercase with underscores instead of spaces. Uppercase it and turn the underscores into spaces.",
    task: "Display /home/agent/text/smuggle.txt in uppercase with '_' replaced by spaces.",
    hint: "Two tr stages: cat /home/agent/text/smuggle.txt | tr 'a-z' 'A-Z' | tr '_' ' '",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/smuggle.txt": "meet_at_dock_nine_midnight\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "MEET AT DOCK NINE MIDNIGHT" },
    ],
  },
  {
    id: "text-70",
    zone: 3,
    title: "Dock Shift Only",
    briefing:
      "The power grid CSV has name, zone, draw. Command wants the dock-zone systems drawing over 50, and nothing else.",
    task: "From /home/agent/text/grid.csv, print the names of dock-zone systems drawing more than 50 units. Fields are comma separated: name, zone, draw.",
    hint: "Two awk filters in a pipe: awk -F, '$2==\"dock\" {print $0}' /home/agent/text/grid.csv | awk -F, '$3>50 {print $1}'",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/grid.csv": "reactor,core,320\nlights,dock,40\ncranes,dock,150\npumps,dock,90\nsensors,vault,150\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "cranes" },
      { type: "outputContains", text: "pumps" },
    ],
  },
  {
    id: "text-71",
    zone: 3,
    title: "Badge Owners",
    briefing:
      "The access CSV has badge, name, deck. Show the names of everyone cleared for deck-9. Clearance matters tonight.",
    task: "From /home/agent/text/access2.csv print the names (field 2) of rows where field 3 is 'deck-9'.",
    hint: "awk -F, '$3==\"deck-9\" {print $2}' /home/agent/text/access2.csv",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/access2.csv": "badge,name,deck\nA1,rhea,deck-7\nB2,marcus,deck-9\nC3,talia,deck-9\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "marcus" },
      { type: "outputContains", text: "talia" },
    ],
  },
  {
    id: "text-72",
    zone: 3,
    title: "Unique Attackers",
    briefing:
      "The firewall log has BREACH lines with attacker IPs. Pull every address off those lines, dedupe, sort. A clean list, no noise.",
    task: "Print the sorted unique list of IPv4 addresses on BREACH lines in /home/agent/text/fw2.log.",
    hint: "grep BREACH, then grep -oE the quads, then sort -u: grep BREACH /home/agent/text/fw2.log | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | sort -u",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/fw2.log":
          "03:11:01 BREACH from 10.9.0.5\n03:11:02 ALLOW ok\n03:11:03 BREACH from 10.9.0.9\n03:11:04 BREACH from 10.9.0.5\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "10.9.0.9" },
    ],
  },
  {
    id: "text-73",
    zone: 3,
    title: "Twice Knocked",
    briefing:
      "The port scan log is already sorted. Show only the ports that were hit more than once. One-timers are not suspects.",
    task: "Print the duplicated lines of the sorted /home/agent/text/scans.txt.",
    hint: "uniq -d keeps only repeats: uniq -d /home/agent/text/scans.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/scans.txt": "22\n22\n80\n443\n443\n443\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\buniq\\b" },
      { type: "outputContains", text: "443" },
    ],
  },
  {
    id: "text-74",
    zone: 3,
    title: "Error Census",
    briefing:
      "AXIOM wants the service log summarized: each distinct ERROR message with its count, sorted by message.",
    task: "Print each distinct ERROR message in /home/agent/text/svc.log with its count, sorted by message.",
    hint: "grep, sort, then count: grep ERROR /home/agent/text/svc.log | sort | uniq -c",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/svc.log": "INFO ok\nERROR disk failing\nERROR disk failing\nINFO ok\nERROR net flap\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "historyMatches", regex: "\\buniq\\b" },
      { type: "outputContains", text: "disk failing" },
    ],
  },
  {
    id: "text-75",
    zone: 3,
    title: "Third in Line",
    briefing:
      "The dock queue is ordered and command wants to see exactly the third entry. Not the second, not the fourth.",
    task: "Print only the 3rd line of /home/agent/text/dockq.txt.",
    hint: "head 3, then tail 1: head -3 /home/agent/text/dockq.txt | tail -1",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/dockq.txt": "freighter-a\nshuttle-b\npod-c\nfreighter-d\n" },
    },
    verify: [{ type: "outputContains", text: "pod-c" }],
  },
  {
    id: "text-76",
    zone: 3,
    title: "Name the Heavy",
    briefing:
      "The cargo CSV has item, bay, weight. Name the single heaviest item on the manifest.",
    task: "Print the name (field 1) of the heaviest item in /home/agent/text/cargo2.csv.",
    hint: "Prepend weight, sort -nr, take the top, strip the key: awk -F, '{print $3, $1}' /home/agent/text/cargo2.csv | sort -nr | head -1 | cut -d' ' -f2-",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/cargo2.csv": "plasma coils,bay-2,400\nrations,bay-1,120\nmedkits,bay-3,60\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "plasma coils" },
    ],
  },
  {
    id: "text-77",
    zone: 3,
    title: "Strip the Stamp",
    briefing:
      "Every line starts with a timestamp and a colon. Cut the stamp off and keep the message underneath.",
    task: "Display /home/agent/text/stamped.log with everything up to the first ': ' removed from each line.",
    hint: "sed 's/.*: //' eats through the first colon-space: sed 's/.*: //' /home/agent/text/stamped.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/stamped.log": "03:12:01: motion detected\n03:12:02: alarm raised\n03:12:03: all clear\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "alarm raised" },
    ],
  },
  {
    id: "text-78",
    zone: 3,
    title: "Top Offender",
    briefing:
      "Count failed logins per user, most frequent first. AXIOM wants the worst offender sitting on top of the list.",
    task: "From /home/agent/text/auth4.log, print each username on FAILED lines with its count, most frequent first.",
    hint: "grep FAILED, pull field 4, count, sort: grep FAILED /home/agent/text/auth4.log | awk '{print $4}' | sort | uniq -c | sort -nr",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/auth4.log":
          "03:12:01 FAILED login user=root\n03:12:02 FAILED login user=admin\n03:12:03 OK login user=agent\n03:12:04 FAILED login user=root\n03:12:05 FAILED login user=guest\n03:12:06 FAILED login user=root\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "user=root" },
    ],
  },
  {
    id: "text-79",
    zone: 3,
    title: "Case Blind Filter",
    briefing:
      "The word intrusion hides in mixed case, and the DEBUG lines are pure noise. Filter both problems in one pass.",
    task: "Print lines containing 'intrusion' in any case from /home/agent/text/ids2.log, excluding DEBUG lines.",
    hint: "grep -iv does both: grep -iv debug /home/agent/text/ids2.log | grep -i intrusion",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/ids2.log": "DEBUG scan port 22\nINTRUSION probe port 443\ndEbug heartbeat\nintrusion probe port 22\nINFO ok\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "port 443" },
    ],
  },
  {
    id: "text-80",
    zone: 3,
    title: "Fixed Width Names",
    briefing:
      "The roster is fixed width: names live in characters 1 through 10, padded with spaces. Extract the names, cleanly.",
    task: "Print characters 1-10 of every line in /home/agent/text/fixed.txt, with trailing spaces removed.",
    hint: "cut -c, then trim the padding: cut -c1-10 /home/agent/text/fixed.txt | sed 's/ *$//'",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/fixed.txt": "rhea      pilot\nmarcus    engineer\ntalia     medic\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "marcus" },
    ],
  },
  {
    id: "text-81",
    zone: 3,
    title: "Long Lines Only",
    briefing:
      "The config file has short junk lines mixed with real entries. Keep only the lines with more than 3 fields.",
    task: "Print the lines of /home/agent/text/conf2.txt that have more than 3 whitespace-separated fields.",
    hint: "awk knows NF, the field count: awk 'NF > 3 {print $0}' /home/agent/text/conf2.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/conf2.txt": "ok\nset mode auto\nset relay primary host=relay-9\nbye\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "host=relay-9" },
    ],
  },
  {
    id: "text-82",
    zone: 3,
    title: "Redact the Secret",
    briefing:
      "The config still carries the real api key in plain text. That ends now. Redact it in place.",
    task: "In /home/agent/text/api.conf, replace 'key=s3cr3t-k3y' with 'key=REDACTED', editing the file itself.",
    hint: "sed -i edits in place: sed -i 's/key=s3cr3t-k3y/key=REDACTED/' /home/agent/text/api.conf",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/api.conf": "host=relay-9\nkey=s3cr3t-k3y\nport=443\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "fileContains", path: "/home/agent/text/api.conf", text: "key=REDACTED" },
    ],
  },
  {
    id: "text-83",
    zone: 3,
    title: "Either Alarm",
    briefing:
      "Command wants every line mentioning ERROR or CRIT. One pattern, both words, no second pass.",
    task: "Print every line in /home/agent/text/svc2.log containing 'ERROR' or 'CRIT'.",
    hint: "grep -E alternation: grep -E 'ERROR|CRIT' /home/agent/text/svc2.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/svc2.log": "INFO ok\nERROR disk failing\nWARN slow\nCRIT core temp high\nINFO ok\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "core temp high" },
    ],
  },
  {
    id: "text-84",
    zone: 3,
    title: "Dedupe to File",
    briefing:
      "AXIOM wants a clean list on disk: the sorted unique callsigns, saved to a file for the briefing packet.",
    task: "Write the sorted unique lines of /home/agent/text/callsigns.txt to /home/agent/text/clean.txt.",
    hint: "Redirect sort -u: sort -u /home/agent/text/callsigns.txt > /home/agent/text/clean.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/callsigns.txt": "viper\nfalcon\nviper\nghost\nfalcon\n" },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/clean.txt", text: "ghost" },
      { type: "fileContains", path: "/home/agent/text/clean.txt", text: "viper" },
    ],
  },
  {
    id: "text-85",
    zone: 3,
    title: "Count the WARNs",
    briefing:
      "Same question, different tool. AXIOM wants the WARN count, and this time it must come through wc.",
    task: "Count the lines containing 'WARN' in /home/agent/text/svc3.log using wc.",
    hint: "grep then wc -l: grep WARN /home/agent/text/svc3.log | wc -l",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/svc3.log": "WARN a\nINFO ok\nWARN b\nWARN c\nINFO ok\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\b" },
      { type: "outputContains", text: "3" },
    ],
  },
  {
    id: "text-86",
    zone: 3,
    title: "One Word Per Line",
    briefing:
      "The sentence in words.txt needs to become a proper word list: one word per line, sorted, no duplicates.",
    task: "Turn /home/agent/text/words.txt into a sorted unique list of words, one per line.",
    hint: "Spaces to newlines, then sort -u: tr ' ' '\\n' < /home/agent/text/words.txt | sort -u",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/words.txt": "the vault is sealed the vault is dark\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "vault" },
    ],
  },
  {
    id: "text-87",
    zone: 3,
    title: "Under Budget",
    briefing:
      "The power CSV again: name, zone, draw. Flag the systems drawing less than 50 units. Small fish, but they add up.",
    task: "From /home/agent/text/grid2.csv print the names of systems drawing less than 50 units.",
    hint: "awk -F, '$3 < 50 {print $1}' /home/agent/text/grid2.csv",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/grid2.csv": "reactor,core,320\nlights,dock,40\nsensors,vault,150\npumps,dock,90\nbeacon,dock,12\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "lights" },
      { type: "outputContains", text: "beacon" },
    ],
  },
  {
    id: "text-88",
    zone: 3,
    title: "Scrub the Debug",
    briefing:
      "Save a clean copy of the application log with the DEBUG lines removed. The original stays as evidence.",
    task: "Write /home/agent/text/app2.log to /home/agent/text/app2.clean with every 'DEBUG' line deleted.",
    hint: "sed to a new file: sed '/DEBUG/d' /home/agent/text/app2.log > /home/agent/text/app2.clean",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/app2.log": "INFO start\nDEBUG x=1\nINFO serving\nDEBUG x=2\nWARN slow\n" },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/app2.clean", text: "WARN slow" },
      { type: "historyMatches", regex: "\\bsed\\b" },
    ],
  },
  {
    id: "text-89",
    zone: 3,
    title: "Drop the Timestamp",
    briefing:
      "Each log line starts with a timestamp field you do not need. Drop field one, keep everything after it.",
    task: "Print every line of /home/agent/text/stamped2.log without its first whitespace-separated field.",
    hint: "cut -f2- keeps field 2 onward: cut -d' ' -f2- /home/agent/text/stamped2.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/stamped2.log": "03:12:01 motion detected\n03:12:02 alarm raised\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "motion detected" },
    ],
  },
  {
    id: "text-90",
    zone: 3,
    title: "Just the Numbers",
    briefing:
      "AXIOM wants only the line numbers of the ERROR lines, for the incident index. No messages, just numbers.",
    task: "Print only the line numbers of lines containing 'ERROR' in /home/agent/text/svc4.log.",
    hint: "grep -n prints file:line:content, so the number is field 2: grep -n ERROR /home/agent/text/svc4.log | cut -d: -f2",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/svc4.log": "INFO ok\nERROR disk\nINFO ok\nINFO ok\nERROR net\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "5" },
    ],
  },
  {
    id: "text-91",
    zone: 3,
    title: "Second Column Slice",
    briefing:
      "The status report uses colons: id:name:status. Pull name and status together for the roll call.",
    task: "Print fields 2 and 3 of /home/agent/text/report.txt.",
    hint: "cut -d: -f2,3 /home/agent/text/report.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/report.txt": "id:name:status\n01:rhea:active\n02:marcus:active\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "rhea:active" },
    ],
  },
  {
    id: "text-92",
    zone: 3,
    title: "Top Three Talkers",
    briefing:
      "Rank the source hosts by hit count and show only the top three. Command has no time for the long tail.",
    task: "Print the 3 most frequent source hosts (field 2) in /home/agent/text/hits2.csv, with counts.",
    hint: "cut, count, sort, head: cut -d, -f2 /home/agent/text/hits2.csv | sort | uniq -c | sort -nr | head -3",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/hits2.csv": "t,src\n01,a\n02,b\n03,a\n04,c\n05,a\n06,b\n07,d\n08,a\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bhead\\b" },
      { type: "outputContains", text: "4 a" },
    ],
  },
  {
    id: "text-93",
    zone: 3,
    title: "Fail Fields",
    briefing:
      "On FAILED lines, field four holds the user= token. Print just that field from every FAILED line.",
    task: "Print the 4th field of every line containing 'FAILED' in /home/agent/text/auth5.log.",
    hint: "awk with a pattern and an action: awk '/FAILED/ {print $4}' /home/agent/text/auth5.log",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/auth5.log": "03:12:01 FAILED login user=root\n03:12:02 OK login user=agent\n03:12:03 FAILED login user=guest\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "user=guest" },
    ],
  },
  {
    id: "text-94",
    zone: 3,
    title: "Collapse Blank Lines",
    briefing:
      "The transcript has ugly runs of blank lines. Squeeze each run into a single newline and make it readable.",
    task: "Display /home/agent/text/gappy.txt with repeated newlines squeezed to one.",
    hint: "tr -s '\\n' '\\n' squeezes newlines: tr -s '\\n' '\\n' < /home/agent/text/gappy.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/gappy.txt": "line one\n\n\nline two\n\nline three\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "line three" },
    ],
  },
  {
    id: "text-95",
    zone: 3,
    title: "Hunt Across Files",
    briefing:
      "The word backdoor is sitting in one of the config files under configs/. Find the lines, with filenames attached.",
    task: "Recursively search /home/agent/text/configs/ for 'backdoor', showing filenames.",
    hint: "grep -r shows file:line: grep -r backdoor /home/agent/text/configs/",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text", "/home/agent/text/configs"],
      files: {
        "/home/agent/text/configs/a.conf": "port=22\n",
        "/home/agent/text/configs/b.conf": "note: backdoor on 31337\n",
        "/home/agent/text/configs/c.conf": "ok\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "b.conf" },
    ],
  },
  {
    id: "text-96",
    zone: 3,
    title: "Digit Scrub, sed Style",
    briefing:
      "Same junk-digit problem, different tool. This time AXIOM insists on sed. Strip every digit from the note.",
    task: "Display /home/agent/text/coded2.txt with all digits removed.",
    hint: "sed 's/[0-9]//g': sed 's/[0-9]//g' /home/agent/text/coded2.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/coded2.txt": "m33t 4t d4wn\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "mt t dwn" },
    ],
  },
  {
    id: "text-97",
    zone: 3,
    title: "Two Fields Out",
    briefing:
      "The auth CSV has time, user, result. For the FAIL rows, print user and result together.",
    task: "From /home/agent/text/auth6.csv, print fields 2 and 3 of rows where field 3 is 'FAIL'.",
    hint: "awk -F, '$3==\"FAIL\" {print $2, $3}' /home/agent/text/auth6.csv",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/auth6.csv": "time,user,result\n01,rhea,OK\n02,vex,FAIL\n03,marcus,FAIL\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "vex FAIL" },
    ],
  },
  {
    id: "text-98",
    zone: 3,
    title: "Drop the Empties",
    briefing:
      "The suspect list has blank lines scattered through it. Print only the lines that actually contain something.",
    task: "Print the non-empty lines of /home/agent/text/sparse.txt.",
    hint: "grep . matches lines with any character: grep . /home/agent/text/sparse.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/sparse.txt": "alpha\n\nbeta\n\n\ngamma\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "gamma" },
    ],
  },
  {
    id: "text-99",
    zone: 3,
    title: "Strict Fields",
    briefing:
      "Some lines in the data file never got their semicolon delimiter. Cut field two, but skip those broken lines entirely.",
    task: "Print field 2 of the ';'-separated lines in /home/agent/text/semi.txt, skipping lines without ';'.",
    hint: "cut -s skips lines without the delimiter: cut -s -d';' -f2 /home/agent/text/semi.txt",
    xp: 20,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/semi.txt": "a;1\nb;2\nno delimiter here\nc;3\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "3" },
    ],
  },
  // ================= HARD (text-100..text-124, xp 30) =================
  {
    id: "text-100",
    zone: 3,
    title: "Attacker Roll Call",
    briefing:
      "The breach log is mostly heartbeat noise with BREACH lines buried in it. Extract every attacker IP, dedupe, sort, and file the list.",
    task: "Write the sorted unique IPv4 addresses from BREACH lines in /home/agent/text/breach2.log to /home/agent/text/attackers.txt.",
    hint: "grep BREACH | grep -oE quads | sort -u > file: grep BREACH /home/agent/text/breach2.log | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | sort -u > /home/agent/text/attackers.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/breach2.log":
          "03:09:01 heartbeat ok\n03:12:01 BREACH handshake from 203.0.113.7\n03:09:03 heartbeat ok\n03:12:02 BREACH handshake from 198.51.100.23\n03:12:03 BREACH handshake from 203.0.113.7\n03:09:05 heartbeat ok\n",
      },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/attackers.txt", text: "198.51.100.23" },
      { type: "fileContains", path: "/home/agent/text/attackers.txt", text: "203.0.113.7" },
    ],
  },
  {
    id: "text-101",
    zone: 3,
    title: "Failed Faces",
    briefing:
      "The auth CSV has time, user, result. AXIOM wants a wall of shame on disk: the distinct FAIL usernames, sorted.",
    task: "Write the sorted unique usernames (field 2) with result FAIL from /home/agent/text/auth7.csv to /home/agent/text/shame.txt.",
    hint: "awk filter, sort -u, redirect: awk -F, '$3==\"FAIL\" {print $2}' /home/agent/text/auth7.csv | sort -u > /home/agent/text/shame.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/auth7.csv": "time,user,result\n01,rhea,OK\n02,vex,FAIL\n03,marcus,FAIL\n04,vex,FAIL\n05,agent,OK\n",
      },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/shame.txt", text: "marcus" },
      { type: "fileContains", path: "/home/agent/text/shame.txt", text: "vex" },
    ],
  },
  {
    id: "text-102",
    zone: 3,
    title: "Double Rewrite",
    briefing:
      "The relay config names two dead relays. Rename both in a single sed run. Two expressions, one command.",
    task: "Display /home/agent/text/relays.conf with 'old-a' changed to 'new-a' and 'old-b' changed to 'new-b'.",
    hint: "Two -e expressions: sed -e 's/old-a/new-a/g' -e 's/old-b/new-b/g' /home/agent/text/relays.conf",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/relays.conf": "primary=old-a\nsecondary=old-b\nbackup=old-a\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "secondary=new-b" },
    ],
  },
  {
    id: "text-103",
    zone: 3,
    title: "Window on the Night",
    briefing:
      "The incident happened between lines 50 and 60 of the big log. Pull that window first, then keep only the ERROR lines.",
    task: "Print lines 50-60 of /home/agent/text/big.log that contain 'ERROR'.",
    hint: "sed range, then grep: sed -n '50,60p' /home/agent/text/big.log | grep ERROR",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/big.log":
          "INFO routine\n".repeat(49) +
          "ERROR breach deck 5\n" +
          "INFO routine\n".repeat(9) +
          "ERROR vault alarm\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "vault alarm" },
    ],
  },
  {
    id: "text-104",
    zone: 3,
    title: "Clean and File",
    briefing:
      "The raw location list is uppercase, double-spaced, and messy. Normalize it: lowercase, single spaces, sorted unique, saved to disk.",
    task: "Write /home/agent/text/raw.txt to /home/agent/text/norm.txt as lowercase, single-spaced, sorted unique lines.",
    hint: "Chain tr, tr, sort -u: tr 'A-Z' 'a-z' < /home/agent/text/raw.txt | tr -s ' ' ' ' | sort -u > /home/agent/text/norm.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/raw.txt": "DOCK  SEVEN\nBAY  THREE\ndock  seven\nBAY  THREE\n" },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/norm.txt", text: "bay three" },
      { type: "fileContains", path: "/home/agent/text/norm.txt", text: "dock seven" },
    ],
  },
  {
    id: "text-105",
    zone: 3,
    title: "Distinct Visitor Count",
    briefing:
      "AXIOM wants exactly one number: how many distinct IPv4 addresses appear in the access log? Extract, dedupe, count.",
    task: "Print the count of distinct IPv4 addresses in /home/agent/text/access3.log.",
    hint: "Extract, dedupe, count: grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' /home/agent/text/access3.log | sort -u | wc -l",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/access3.log": "hit 10.0.0.1\nhit 10.0.0.2\nhit 10.0.0.1\nhit 10.0.0.3\nno ip here\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bwc\\b" },
      { type: "outputContains", text: "3" },
    ],
  },
  {
    id: "text-106",
    zone: 3,
    title: "Agent Strings",
    briefing:
      "The web log wraps the user agent in quotes. Slice that quoted field out and rank the agents by hit count.",
    task: "From /home/agent/text/web.log, print each user agent with its hit count, most hits first.",
    hint: "cut -d'\"' -f4, count, sort: cut -d'\"' -f4 /home/agent/text/web.log | sort | uniq -c | sort -nr",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/web.log":
          "10.0.0.1 \"GET /\" 200 \"curl/8.0\"\n10.0.0.2 \"GET /\" 200 \"nexus-agent/1.0\"\n10.0.0.3 \"GET /\" 200 \"curl/8.0\"\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "curl/8.0" },
    ],
  },
  {
    id: "text-107",
    zone: 3,
    title: "User Harvest",
    briefing:
      "The audit lines hide user=<name> tokens inside longer lines. Extract just the names with a capture group.",
    task: "Print the username from each 'user=<name>' token in /home/agent/text/audit.log, one per line.",
    hint: "sed with \\( \\) captures: sed 's/.*user=\\([a-z]*\\).*/\\1/' /home/agent/text/audit.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/audit.log": "03:12:01 login user=rhea ok\n03:12:02 login user=marcus ok\n03:12:03 login user=vex denied\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "marcus" },
    ],
  },
  {
    id: "text-108",
    zone: 3,
    title: "Breach Census",
    briefing:
      "For every BREACH line, pull the value of the ip= token, then count sightings per IP. AXIOM loves a census.",
    task: "Print each attacker IP from BREACH lines in /home/agent/text/fw3.log with its count.",
    hint: "grep, awk, cut, count: grep BREACH /home/agent/text/fw3.log | awk '{print $4}' | cut -d= -f2 | sort | uniq -c",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/fw3.log":
          "03:12:01 BREACH src ip=10.9.0.5\n03:12:02 ALLOW src ip=10.9.0.6\n03:12:03 BREACH src ip=10.9.0.5\n03:12:04 BREACH src ip=10.9.0.9\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "10.9.0.5" },
    ],
  },
  {
    id: "text-109",
    zone: 3,
    title: "Which Files",
    briefing:
      "The word backdoor might be sitting in several files under vaults/. List just the filenames that contain it. Filenames, not lines.",
    task: "List the files under /home/agent/text/vaults/ that contain the word 'backdoor'.",
    hint: "grep -rl lists matching files: grep -rl backdoor /home/agent/text/vaults/",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text", "/home/agent/text/vaults"],
      files: {
        "/home/agent/text/vaults/a.conf": "port=22\n",
        "/home/agent/text/vaults/b.conf": "backdoor 31337\n",
        "/home/agent/text/vaults/c.conf": "backdoor 4444\nnote\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "b.conf" },
    ],
  },
  {
    id: "text-110",
    zone: 3,
    title: "Carriage Return Scrub",
    briefing:
      "The manifest was born on Windows and carries a carriage return at every line end. Scrub them into a clean copy.",
    task: "Write /home/agent/text/win.txt to /home/agent/text/win.clean with carriage returns removed.",
    hint: "tr -d '\\r': tr -d '\\r' < /home/agent/text/win.txt > /home/agent/text/win.clean",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/win.txt": "cargo: coils\r\ncargo: rations\r\n" },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/win.clean", text: "cargo: rations" },
      { type: "historyMatches", regex: "\\btr\\b" },
    ],
  },
  {
    id: "text-111",
    zone: 3,
    title: "Case-Blind Singles",
    briefing:
      "The roster has the same names written in different cases. Fold everything to lowercase first, then count how many distinct names there really are.",
    task: "Print the number of case-insensitively distinct lines in /home/agent/text/roster3.txt.",
    hint: "Lowercase first, then the usual chain: tr 'A-Z' 'a-z' < /home/agent/text/roster3.txt | sort | uniq | wc -l",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/roster3.txt": "Rhea\nrhea\nRHEA\nmarcus\nMarcus\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\buniq\\b" },
      { type: "outputContains", text: "2" },
    ],
  },
  {
    id: "text-112",
    zone: 3,
    title: "Severity Filter",
    briefing:
      "Command wants only the lines that START with ERROR or CRIT. Anchors, not vibes. Mid-line mentions do not count.",
    task: "Print the lines of /home/agent/text/svc5.log that begin with 'ERROR' or 'CRIT'.",
    hint: "grep -E '^(ERROR|CRIT)': grep -E '^(ERROR|CRIT)' /home/agent/text/svc5.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/svc5.log": "ERROR disk failing\nINFO had ERROR before\nCRIT core temp\nWARN ERRORish\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "CRIT core temp" },
    ],
  },
  {
    id: "text-113",
    zone: 3,
    title: "Errors Not Timeouts",
    briefing:
      "You want the ERROR lines, but the timeout ones are a known false positive. Take the ERRORs, then throw the timeouts back.",
    task: "Print the ERROR lines of /home/agent/text/svc6.log that do NOT mention 'timeout'.",
    hint: "grep, then grep -v: grep ERROR /home/agent/text/svc6.log | grep -v timeout",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/svc6.log": "ERROR disk failing\nERROR timeout on eth0\nINFO ok\nERROR timeout on wlan0\nERROR auth failed\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "auth failed" },
    ],
  },
  {
    id: "text-114",
    zone: 3,
    title: "Swap the Columns",
    briefing:
      "The crew CSV is name, role. Command's report wants role, name. Flip every row.",
    task: "Print /home/agent/text/crew2.csv with the two fields swapped.",
    hint: "awk -F, '{print $2, $1}' /home/agent/text/crew2.csv",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/crew2.csv": "rhea,pilot\nmarcus,engineer\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "pilot rhea" },
    ],
  },
  {
    id: "text-115",
    zone: 3,
    title: "Mail Harvest",
    briefing:
      "The mail log leaks addresses shaped like name@host.tld. Harvest the unique set, sorted, for the contact trace.",
    task: "Print the sorted unique email addresses in /home/agent/text/mail.log.",
    hint: "grep -oE '[a-z]+@[a-z]+\\.[a-z]+' /home/agent/text/mail.log | sort -u",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/mail.log": "from rhea@nexus.station to ops\nfrom marcus@nexus.station to rhea@nexus.station\nbounce vex@dark.relay\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "outputContains", text: "vex@dark.relay" },
    ],
  },
  {
    id: "text-116",
    zone: 3,
    title: "Trim the Head",
    briefing:
      "The first three lines of the dump are vendor boilerplate. Save the rest to a new file without them.",
    task: "Write /home/agent/text/dump.log to /home/agent/text/dump.trim with the first 3 lines removed.",
    hint: "sed '1,3d' to a file: sed '1,3d' /home/agent/text/dump.log > /home/agent/text/dump.trim",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/dump.log": "boiler 1\nboiler 2\nboiler 3\nreal data alpha\nreal data beta\n" },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/dump.trim", text: "real data beta" },
      { type: "historyMatches", regex: "\\bsed\\b" },
    ],
  },
  {
    id: "text-117",
    zone: 3,
    title: "First Three Records",
    briefing:
      "AXIOM wants a sample of the manifest: the first three lines, nothing more. awk knows which record it is on.",
    task: "Print the first 3 lines of /home/agent/text/bigmanifest.txt using awk.",
    hint: "awk 'NR <= 3 {print $0}': awk 'NR <= 3 {print $0}' /home/agent/text/bigmanifest.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/bigmanifest.txt": "m1\nm2\nm3\nm4\nm5\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "m3" },
    ],
  },
  {
    id: "text-118",
    zone: 3,
    title: "All the Errors",
    briefing:
      "ERROR lines are scattered across every .log file under logs/. Gather them all into one deduped, sorted list.",
    task: "Print the sorted unique ERROR lines from all /home/agent/text/logs/*.log files.",
    hint: "Glob into cat, grep, then sort -u: cat /home/agent/text/logs/*.log | grep ERROR | sort -u",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text", "/home/agent/text/logs"],
      files: {
        "/home/agent/text/logs/a.log": "INFO ok\nERROR disk failing\n",
        "/home/agent/text/logs/b.log": "ERROR disk failing\nERROR net down\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bgrep\\b" },
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "net down" },
    ],
  },
  {
    id: "text-119",
    zone: 3,
    title: "User and UID",
    briefing:
      "The account dump is user:hash:uid:gecos. AXIOM wants user:uid pairs for the audit join.",
    task: "Print fields 1 and 3 of /home/agent/text/accounts2.txt.",
    hint: "cut -d: -f1,3 /home/agent/text/accounts2.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/accounts2.txt": "rhea:x:1001:Rhea Pilot\nmarcus:x:1002:Marcus Eng\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "rhea:1001" },
    ],
  },
  {
    id: "text-120",
    zone: 3,
    title: "Port Census",
    briefing:
      "The scan log has :port tokens everywhere. List every distinct port number, numerically sorted, for the firewall review.",
    task: "Print the distinct port numbers in /home/agent/text/scans2.log, sorted numerically.",
    hint: "grep -oE ':[0-9]+', strip the colon, sort -un: grep -oE ':[0-9]+' /home/agent/text/scans2.log | tr -d ':' | sort -un",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/scans2.log": "open 10.0.0.1:443\nopen 10.0.0.2:22\nopen 10.0.0.3:443\nopen 10.0.0.4:8080\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "8080" },
    ],
  },
  {
    id: "text-121",
    zone: 3,
    title: "Last Word",
    briefing:
      "The status log's final line is the current station status. Read just that line. The history is for historians.",
    task: "Print the last line of /home/agent/text/status.log.",
    hint: "tail -1: tail -1 /home/agent/text/status.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/status.log": "shift start\npatrol ok\nall clear\nstatus: GREEN\n" },
    },
    verify: [
      { type: "historyMatches", regex: "\\btail\\b" },
      { type: "outputContains", text: "status: GREEN" },
    ],
  },
  {
    id: "text-122",
    zone: 3,
    title: "Heavy Hitters Filed",
    briefing:
      "Same power question as always, but this time AXIOM wants the answer on disk, in SHOUTING CASE.",
    task: "Write the names of systems in /home/agent/text/grid3.csv drawing more than 500 units to /home/agent/text/hogs.txt, in uppercase.",
    hint: "awk filter, tr upper, redirect: awk -F, '$3 > 500 {print $1}' /home/agent/text/grid3.csv | tr 'a-z' 'A-Z' > /home/agent/text/hogs.txt",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/grid3.csv": "reactor,core,3200\nlights,dock,40\nsensors,vault,150\nhyperdrive,core,900\n",
      },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/hogs.txt", text: "REACTOR" },
      { type: "fileContains", path: "/home/agent/text/hogs.txt", text: "HYPERDRIVE" },
    ],
  },
  {
    id: "text-123",
    zone: 3,
    title: "Comment Scrub Filed",
    briefing:
      "Save a copy of the app config with the #-comment lines stripped out. The original keeps its comments for the auditors.",
    task: "Write /home/agent/text/app3.conf to /home/agent/text/app3.clean without any lines starting with '#'.",
    hint: "grep -v '^#' to a file: grep -v '^#' /home/agent/text/app3.conf > /home/agent/text/app3.clean",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: { "/home/agent/text/app3.conf": "# old\nport=443\n# todo\nkey=abc\n" },
    },
    verify: [
      { type: "fileContains", path: "/home/agent/text/app3.clean", text: "key=abc" },
      { type: "historyMatches", regex: "\\bgrep\\b" },
    ],
  },
  {
    id: "text-124",
    zone: 3,
    title: "Three Lines That Matter",
    briefing:
      "Five hundred lines of heartbeat noise. Three SIGNAL lines that matter. This is the whole job: carve signal from the haystack.",
    task: "Print the 3 SIGNAL lines buried in /home/agent/text/haystack.log.",
    hint: "grep SIGNAL /home/agent/text/haystack.log",
    xp: 30,
    setup: {
      dirs: ["/home/agent/text"],
      files: {
        "/home/agent/text/haystack.log":
          "heartbeat ok\n".repeat(200) +
          "SIGNAL: vault door opened 03:12\n" +
          "heartbeat ok\n".repeat(150) +
          "SIGNAL: motion in corridor 9 03:14\n" +
          "heartbeat ok\n".repeat(147) +
          "SIGNAL: alarm raised 03:15\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "^\\s*grep\\b" },
      { type: "outputContains", text: "SIGNAL: vault door opened 03:12" },
      { type: "outputContains", text: "SIGNAL: alarm raised 03:15" },
    ],
  },
];

export const SOLUTIONS_TEXT_X: Record<string, string[]> = {
  "text-20": ["grep mayday /home/agent/text/comms.log"],
  "text-21": ["grep -i alarm /home/agent/text/sensors.log"],
  "text-22": ["grep -v DEBUG /home/agent/text/events.log"],
  "text-23": ["grep -c INTRUSION /home/agent/text/ids.log"],
  "text-24": ["grep -n vault /home/agent/text/night.log"],
  "text-25": ["grep -r beacon /home/agent/text/archive/"],
  "text-26": ["grep -oE 'id=[0-9]+' /home/agent/text/tickets.log"],
  "text-27": ["sort /home/agent/text/roster.txt"],
  "text-28": ["sort -r /home/agent/text/roster.txt"],
  "text-29": ["sort -n /home/agent/text/latency.txt"],
  "text-30": ["sort -nr /home/agent/text/scores.txt"],
  "text-31": ["sort -u /home/agent/text/queue.txt"],
  "text-32": ["uniq /home/agent/text/sorted_dups.txt"],
  "text-33": ["uniq -c /home/agent/text/pings.txt"],
  "text-34": ["sort /home/agent/text/scans.txt | uniq -d"],
  "text-35": ["sort /home/agent/text/users.txt | uniq -c"],
  "text-36": ["cut -d, -f1 /home/agent/text/cargo.csv"],
  "text-37": ["cut -d: -f3 /home/agent/text/crew.db"],
  "text-38": ["cut -d, -f1,3 /home/agent/text/cargo.csv"],
  "text-39": ["cut -c1-6 /home/agent/text/inventory.txt"],
  "text-40": ["cut -d: -f1 /home/agent/text/accounts.txt"],
  "text-41": ["awk '{print $1}' /home/agent/text/incidents.log"],
  "text-42": ["sed 's/.* //' /home/agent/text/patrol.log"],
  "text-43": ["awk -F, '{print $2}' /home/agent/text/shifts.csv"],
  "text-44": ["awk '/ERROR/' /home/agent/text/sys.log"],
  "text-45": ["awk '$2 > 90 {print $0}' /home/agent/text/temps.log"],
  "text-46": ["awk '{print NR, $0}' /home/agent/text/checklist.txt"],
  "text-47": ["sed 's/relay-old/relay-new/' /home/agent/text/relay.conf"],
  "text-48": ["sed 's/draft/final/g' /home/agent/text/bulletin.txt"],
  "text-49": ["sed -n '/PANIC/p' /home/agent/text/ops.log"],
  "text-50": ["sed '2d' /home/agent/text/manifest.txt"],
  "text-51": ["sed -n '4,6p' /home/agent/text/watch.log"],
  "text-52": ["cat /home/agent/text/whisper.txt | tr 'a-z' 'A-Z'"],
  "text-53": ["cat /home/agent/text/shout.txt | tr 'A-Z' 'a-z'"],
  "text-54": ["tr -d '0-9' < /home/agent/text/coded.txt"],
  "text-55": ["cat /home/agent/text/ragged.txt | tr -s ' ' ' '"],
  "text-56": ["tail -5 /home/agent/text/timeline.log"],
  "text-57": ["wc -l /home/agent/text/casualties.txt"],
  "text-58": ["grep ERROR /home/agent/text/syslog2.log | sort"],
  "text-59": ["cut -d, -f2 /home/agent/text/conns.csv | sort -u"],
  "text-60": ["grep -E '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' /home/agent/text/probes.log"],
  "text-61": ["sed '/DEBUG/d' /home/agent/text/app.log"],
  "text-62": ["head -3 /home/agent/text/alerts2.log"],
  "text-63": ["tail -n +2 /home/agent/text/roster2.csv"],
  "text-64": ["wc -w /home/agent/text/distress.txt"],
  "text-65": ["grep BREACH /home/agent/text/fw.log | cut -d' ' -f5"],
  "text-66": ["grep -v '^#' /home/agent/text/mixed.log | grep -c ERROR"],
  "text-67": ["cut -d, -f2 /home/agent/text/hits.csv | sort | uniq -c | sort -nr"],
  "text-68": ["awk -F, '{print $3, $0}' /home/agent/text/draw.csv | sort -nr | cut -d' ' -f2-"],
  "text-69": ["cat /home/agent/text/smuggle.txt | tr 'a-z' 'A-Z' | tr '_' ' '"],
  "text-70": ["awk -F, '$2==\"dock\" {print $0}' /home/agent/text/grid.csv | awk -F, '$3>50 {print $1}'"],
  "text-71": ["awk -F, '$3==\"deck-9\" {print $2}' /home/agent/text/access2.csv"],
  "text-72": ["grep BREACH /home/agent/text/fw2.log | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | sort -u"],
  "text-73": ["uniq -d /home/agent/text/scans.txt"],
  "text-74": ["grep ERROR /home/agent/text/svc.log | sort | uniq -c"],
  "text-75": ["head -3 /home/agent/text/dockq.txt | tail -1"],
  "text-76": ["awk -F, '{print $3, $1}' /home/agent/text/cargo2.csv | sort -nr | head -1 | cut -d' ' -f2-"],
  "text-77": ["sed 's/.*: //' /home/agent/text/stamped.log"],
  "text-78": ["grep FAILED /home/agent/text/auth4.log | awk '{print $4}' | sort | uniq -c | sort -nr"],
  "text-79": ["grep -iv debug /home/agent/text/ids2.log | grep -i intrusion"],
  "text-80": ["cut -c1-10 /home/agent/text/fixed.txt | sed 's/ *$//'"],
  "text-81": ["awk 'NF > 3 {print $0}' /home/agent/text/conf2.txt"],
  "text-82": ["sed -i 's/key=s3cr3t-k3y/key=REDACTED/' /home/agent/text/api.conf"],
  "text-83": ["grep -E 'ERROR|CRIT' /home/agent/text/svc2.log"],
  "text-84": ["sort -u /home/agent/text/callsigns.txt > /home/agent/text/clean.txt"],
  "text-85": ["grep WARN /home/agent/text/svc3.log | wc -l"],
  "text-86": ["tr ' ' '\\n' < /home/agent/text/words.txt | sort -u"],
  "text-87": ["awk -F, '$3 < 50 {print $1}' /home/agent/text/grid2.csv"],
  "text-88": ["sed '/DEBUG/d' /home/agent/text/app2.log > /home/agent/text/app2.clean"],
  "text-89": ["cut -d' ' -f2- /home/agent/text/stamped2.log"],
  "text-90": ["grep -n ERROR /home/agent/text/svc4.log | cut -d: -f2"],
  "text-91": ["cut -d: -f2,3 /home/agent/text/report.txt"],
  "text-92": ["cut -d, -f2 /home/agent/text/hits2.csv | sort | uniq -c | sort -nr | head -3"],
  "text-93": ["awk '/FAILED/ {print $4}' /home/agent/text/auth5.log"],
  "text-94": ["tr -s '\\n' '\\n' < /home/agent/text/gappy.txt"],
  "text-95": ["grep -r backdoor /home/agent/text/configs/"],
  "text-96": ["sed 's/[0-9]//g' /home/agent/text/coded2.txt"],
  "text-97": ["awk -F, '$3==\"FAIL\" {print $2, $3}' /home/agent/text/auth6.csv"],
  "text-98": ["grep . /home/agent/text/sparse.txt"],
  "text-99": ["cut -s -d';' -f2 /home/agent/text/semi.txt"],
  "text-100": ["grep BREACH /home/agent/text/breach2.log | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | sort -u > /home/agent/text/attackers.txt"],
  "text-101": ["awk -F, '$3==\"FAIL\" {print $2}' /home/agent/text/auth7.csv | sort -u > /home/agent/text/shame.txt"],
  "text-102": ["sed -e 's/old-a/new-a/g' -e 's/old-b/new-b/g' /home/agent/text/relays.conf"],
  "text-103": ["sed -n '50,60p' /home/agent/text/big.log | grep ERROR"],
  "text-104": ["tr 'A-Z' 'a-z' < /home/agent/text/raw.txt | tr -s ' ' ' ' | sort -u > /home/agent/text/norm.txt"],
  "text-105": ["grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' /home/agent/text/access3.log | sort -u | wc -l"],
  "text-106": ["cut -d'\"' -f4 /home/agent/text/web.log | sort | uniq -c | sort -nr"],
  "text-107": ["sed 's/.*user=\\([a-z]*\\).*/\\1/' /home/agent/text/audit.log"],
  "text-108": ["grep BREACH /home/agent/text/fw3.log | awk '{print $4}' | cut -d= -f2 | sort | uniq -c"],
  "text-109": ["grep -rl backdoor /home/agent/text/vaults/"],
  "text-110": ["tr -d '\\r' < /home/agent/text/win.txt > /home/agent/text/win.clean"],
  "text-111": ["tr 'A-Z' 'a-z' < /home/agent/text/roster3.txt | sort | uniq | wc -l"],
  "text-112": ["grep -E '^(ERROR|CRIT)' /home/agent/text/svc5.log"],
  "text-113": ["grep ERROR /home/agent/text/svc6.log | grep -v timeout"],
  "text-114": ["awk -F, '{print $2, $1}' /home/agent/text/crew2.csv"],
  "text-115": ["grep -oE '[a-z]+@[a-z]+\\.[a-z]+' /home/agent/text/mail.log | sort -u"],
  "text-116": ["sed '1,3d' /home/agent/text/dump.log > /home/agent/text/dump.trim"],
  "text-117": ["awk 'NR <= 3 {print $0}' /home/agent/text/bigmanifest.txt"],
  "text-118": ["cat /home/agent/text/logs/*.log | grep ERROR | sort -u"],
  "text-119": ["cut -d: -f1,3 /home/agent/text/accounts2.txt"],
  "text-120": ["grep -oE ':[0-9]+' /home/agent/text/scans2.log | tr -d ':' | sort -un"],
  "text-121": ["tail -1 /home/agent/text/status.log"],
  "text-122": ["awk -F, '$3 > 500 {print $1}' /home/agent/text/grid3.csv | tr 'a-z' 'A-Z' > /home/agent/text/hogs.txt"],
  "text-123": ["grep -v '^#' /home/agent/text/app3.conf > /home/agent/text/app3.clean"],
  "text-124": ["grep SIGNAL /home/agent/text/haystack.log"],
};
