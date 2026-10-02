import type { Challenge } from "./challenges";

/**
 * ZONE 6 EXPANSION: ANTENNA ARRAY (Networking), part 2.
 * net-20..net-124. The relays went silent at 03:12; you get the station
 * talking again and copy the evidence off-station.
 *
 * Simulated network: gateway 10.0.0.1, relay 10.0.0.2, hostnames
 * "gateway"/"relay". HTTP on 10.0.0.1: /status, /files/, /bundle.tar,
 * /firmware/patch.bin. ssh relay@10.0.0.2 runs uptime/whoami/hostname/
 * date/pwd/ls. scp to relay@10.0.0.2 works; scp from the relay only
 * serves /incoming/manifest.txt.
 */
export const CHALLENGES_NET_X: Challenge[] = [
  // ---------------- EASY (xp 10): net-20..net-64 ----------------
  {
    id: "net-20",
    zone: 6,
    title: "Ping Yourself",
    briefing:
      "Before you shout across the station, make sure your own stack answers. The loopback interface is the shortest trip a packet can take.",
    task: "Ping 127.0.0.1 with a single packet.",
    hint: "ping -c 1 127.0.0.1",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ping\\s+-c\\s+1\\s+127\\.0\\.0\\.1" },
      { type: "outputContains", text: "127.0.0.1" },
    ],
  },
  {
    id: "net-21",
    zone: 6,
    title: "Wake the Relay",
    briefing:
      "The relay node at 10.0.0.2 has been quiet since 03:12. Two packets will tell you if it is dead or just ignoring you.",
    task: "Ping 10.0.0.2 with exactly 2 packets.",
    hint: "ping -c 2 10.0.0.2",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ping\\s+-c\\s+2\\s+10\\.0\\.0\\.2" },
      { type: "outputContains", text: "0% packet loss" },
    ],
  },
  {
    id: "net-22",
    zone: 6,
    title: "Two by Two",
    briefing:
      "You already knocked on the gateway with three packets. Tonight the drill says two. Habits are good, but orders are better.",
    task: "Ping 10.0.0.1 with exactly 2 packets.",
    hint: "ping -c 2 10.0.0.1",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ping\\s+-c\\s+2\\s+10\\.0\\.0\\.1" },
      { type: "outputContains", text: "2 packets transmitted" },
    ],
  },
  {
    id: "net-23",
    zone: 6,
    title: "Shout at Localhost",
    briefing:
      "Numbers are for machines. The name localhost means the same place, and your resolver had better agree. Three packets, by name this time.",
    task: "Ping localhost with exactly 3 packets.",
    hint: "ping -c 3 localhost",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ping\\s+-c\\s+3\\s+localhost" },
      { type: "outputContains", text: "PING localhost" },
    ],
  },
  {
    id: "net-24",
    zone: 6,
    title: "Link Inventory",
    briefing:
      "The antenna crew wants a list of every link-layer device on this station. No addresses yet, just the hardware view.",
    task: "Show the station's link-layer devices.",
    hint: "ip link",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*ip\\s+link\\b" },
      { type: "outputContains", text: "eth0" },
    ],
  },
  {
    id: "net-25",
    zone: 6,
    title: "Catch the MAC",
    briefing:
      "AXIOM needs the station's hardware address for the asset register. It is buried in the interface table. Fish it out.",
    task: "Show the station's MAC address.",
    hint: "ip addr | grep ether",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ip\\s+addr" },
      { type: "outputContains", text: "02:42:ac:11:00:09" },
    ],
  },
  {
    id: "net-26",
    zone: 6,
    title: "Loopback Hunt",
    briefing:
      "Every station should have 127.0.0.1 on loopback. Trust, but verify. Search your own interface table for it.",
    task: "Confirm the loopback address 127.0.0.1 is configured.",
    hint: "ip addr | grep 127.0.0.1",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ip\\s+addr" },
      { type: "outputContains", text: "127.0.0.1" },
    ],
  },
  {
    id: "net-27",
    zone: 6,
    title: "Gateway Hunt",
    briefing:
      "Packets leaving the station need a door. Your routing table names it. Find the default gateway address.",
    task: "Find which address is your default gateway.",
    hint: "ip route | grep default",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ip\\s+route" },
      { type: "outputContains", text: "via 10.0.0.1" },
    ],
  },
  {
    id: "net-28",
    zone: 6,
    title: "Port 22 Watch",
    briefing:
      "SSH is how you reach the relay, and port 22 should be listening right here. Check the socket table for it.",
    task: "Check that something is listening on port 22.",
    hint: "ss -tln | grep 22",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*ss\\b" },
      { type: "outputContains", text: "0.0.0.0:22" },
    ],
  },
  {
    id: "net-29",
    zone: 6,
    title: "Beacon Hunt",
    briefing:
      "The intruder's beacon still squats on port 4444, and AXIOM wants proof before the kill order. Name the process holding that socket.",
    task: "Show the process listening on port 4444.",
    hint: "ss -tlnp | grep 4444",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*ss\\b" },
      { type: "outputContains", text: "beacon" },
    ],
  },
  {
    id: "net-30",
    zone: 6,
    title: "UDP Glance",
    briefing:
      "TCP gets all the attention, but DHCP whispers over UDP. List the UDP sockets and see who owns them.",
    task: "Show UDP sockets with their owning processes.",
    hint: "ss -ulpn",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ss\\s+-ulpn" },
      { type: "outputContains", text: "dhclient" },
    ],
  },
  {
    id: "net-31",
    zone: 6,
    title: "How Many Listeners",
    briefing:
      "AXIOM does not want a list. AXIOM wants a number. Count the listening TCP sockets and report the total.",
    task: "Count the listening TCP sockets.",
    hint: "ss -tln | grep -c LISTEN",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "grep\\s+-c" },
      { type: "outputContains", text: "4" },
    ],
  },
  {
    id: "net-32",
    zone: 6,
    title: "Quiet Status",
    briefing:
      "The gateway's status page is chatty in the logs. Fetch it silently and read the JSON yourself.",
    task: "Fetch the relay status page quietly.",
    hint: "curl -s http://10.0.0.1/status",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "curl\\s+-s\\b" },
      { type: "outputContains", text: "NEXUS-9" },
    ],
  },
  {
    id: "net-33",
    zone: 6,
    title: "Relay Says Silent",
    briefing:
      "The status JSON has four fields and you only care about one. Pull the page and keep the line that names the relay.",
    task: "Pull the status page and keep only the relay line.",
    hint: "curl -s http://10.0.0.1/status | grep relay",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*curl\\b" },
      { type: "outputContains", text: "silent" },
    ],
  },
  {
    id: "net-34",
    zone: 6,
    title: "Breach Timestamp",
    briefing:
      "Somewhere in that JSON is the exact minute everything went wrong. Extract the breach line and read it aloud.",
    task: "Pull the status page and keep only the breach line.",
    hint: "curl -s http://10.0.0.1/status | grep breach",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*curl\\b" },
      { type: "outputContains", text: "03:12" },
    ],
  },
  {
    id: "net-35",
    zone: 6,
    title: "Save the Status",
    briefing:
      "The status page changes, and AXIOM wants a snapshot frozen in time. Save it to /home/agent/net/status.json.",
    task: "Save the status page to /home/agent/net/status.json.",
    hint: "curl -o /home/agent/net/status.json http://10.0.0.1/status",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/status.json" },
      { type: "fileContains", path: "/home/agent/net/status.json", text: "degraded" },
    ],
  },
  {
    id: "net-36",
    zone: 6,
    title: "Quiet Patch",
    briefing:
      "The firmware patch is waiting on the gateway. Download it to /home/agent/net/patch.bin, and spare the terminal the progress bar theater.",
    task: "Download the firmware patch to /home/agent/net/patch.bin without progress output.",
    hint: "wget -q -O /home/agent/net/patch.bin http://10.0.0.1/firmware/patch.bin",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [{ type: "fileExists", path: "/home/agent/net/patch.bin" }],
  },
  {
    id: "net-37",
    zone: 6,
    title: "Default Name Fetch",
    briefing:
      "You are standing in /home/agent/net and the patch needs to land here. Let wget choose the filename this time.",
    task: "Go to /home/agent/net and download the firmware patch letting wget pick the filename.",
    hint: "cd /home/agent/net, then: wget http://10.0.0.1/firmware/patch.bin",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [{ type: "fileExists", path: "/home/agent/net/patch.bin" }],
  },
  {
    id: "net-38",
    zone: 6,
    title: "Remote Name Fetch",
    briefing:
      "Same patch, different tool. From inside /home/agent/net, let curl save the file under its remote name.",
    task: "Go to /home/agent/net and download the firmware patch letting curl pick the filename.",
    hint: "cd /home/agent/net, then: curl -O http://10.0.0.1/firmware/patch.bin",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/patch.bin" },
      { type: "historyMatches", regex: "\\bcurl\\b" },
    ],
  },
  {
    id: "net-39",
    zone: 6,
    title: "Remote Who",
    briefing:
      "You are about to send evidence to the relay, so first confirm who you will be over there. Ask it over SSH.",
    task: "Ask the relay who you are over SSH.",
    hint: "ssh relay@10.0.0.2 whoami",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ssh\\s+relay@10\\.0\\.0\\.2\\s+whoami" },
      { type: "outputContains", text: "relay" },
    ],
  },
  {
    id: "net-40",
    zone: 6,
    title: "Relay Hostname",
    briefing:
      "Every node on the array has a name, and you should not take the address at face value. Ask 10.0.0.2 what it calls itself.",
    task: "Ask the relay for its hostname over SSH.",
    hint: "ssh relay@10.0.0.2 hostname",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ssh\\s+relay@10\\.0\\.0\\.2\\s+hostname" },
      { type: "outputContains", text: "relay" },
    ],
  },
  {
    id: "net-41",
    zone: 6,
    title: "Relay Directory",
    briefing:
      "You will drop files on the relay soon. Know where you land first: ask for its working directory over SSH.",
    task: "Ask the relay for its working directory over SSH.",
    hint: "ssh relay@10.0.0.2 pwd",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ssh\\s+relay@10\\.0\\.0\\.2\\s+pwd" },
      { type: "outputContains", text: "/home/relay" },
    ],
  },
  {
    id: "net-42",
    zone: 6,
    title: "Incoming Peek",
    briefing:
      "The relay's /incoming directory is the off-station drop point. Peek inside it remotely before you send anything.",
    task: "List the relay's /incoming directory over SSH.",
    hint: "ssh relay@10.0.0.2 ls /incoming",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ssh\\s+relay@10\\.0\\.0\\.2\\s+ls" },
      { type: "outputContains", text: "manifest.txt" },
    ],
  },
  {
    id: "net-43",
    zone: 6,
    title: "Fetch the Manifest",
    briefing:
      "The relay left a manifest of pending evidence bundles in /incoming. Pull it down to /home/agent/net/manifest.txt.",
    task: "Copy /incoming/manifest.txt from the relay to /home/agent/net/manifest.txt.",
    hint: "scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/manifest.txt" },
      { type: "fileContains", path: "/home/agent/net/manifest.txt", text: "evidence bundles" },
    ],
  },
  {
    id: "net-44",
    zone: 6,
    title: "Ship a Sample",
    briefing:
      "Test the drop point before the real evidence goes. Send the sample file to the relay's /incoming/ directory.",
    task: "Send /home/agent/net/sample.txt to relay@10.0.0.2:/incoming/.",
    hint: "scp /home/agent/net/sample.txt relay@10.0.0.2:/incoming/",
    xp: 10,
    setup: { files: { "/home/agent/net/sample.txt": "test payload, harmless\n" } },
    verify: [
      { type: "historyMatches", regex: "scp\\s+/home/agent/net/sample\\.txt\\s+relay@10\\.0\\.0\\.2:/incoming/" },
    ],
  },
  {
    id: "net-45",
    zone: 6,
    title: "Name the Station",
    briefing:
      "Before the roll call goes out, confirm your own hostname. The array has more than one nexus box and you do not want to sign the wrong name.",
    task: "Print the station's hostname.",
    hint: "hostname",
    xp: 10,
    verify: [{ type: "outputContains", text: "nexus" }],
  },
  {
    id: "net-46",
    zone: 6,
    title: "Identity Check",
    briefing:
      "Permissions, ownership, SSH logins: everything hinges on who you are right now. State your username.",
    task: "Print your own username.",
    hint: "whoami",
    xp: 10,
    verify: [{ type: "outputContains", text: "agent" }],
  },
  {
    id: "net-47",
    zone: 6,
    title: "Host Env",
    briefing:
      "Your shell carries the station name in its environment. Pull HOSTNAME out of the noise and read it.",
    task: "Show the HOSTNAME variable from your environment.",
    hint: "env | grep HOSTNAME",
    xp: 10,
    verify: [{ type: "outputContains", text: "nexus" }],
  },
  {
    id: "net-48",
    zone: 6,
    title: "Inet Count",
    briefing:
      "Two interfaces, a handful of addresses. Count the inet lines in your interface table and make sure nothing extra is bound.",
    task: "Count how many inet lines your interfaces have.",
    hint: "ip addr | grep -c inet",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "grep\\s+-c" },
      { type: "outputContains", text: "2" },
    ],
  },
  {
    id: "net-49",
    zone: 6,
    title: "Route Words",
    briefing:
      "The routing table is short but AXIOM files everything. Count its words for the nightly report.",
    task: "Count the words in your routing table.",
    hint: "ip route | wc -w",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "wc\\s+-w" },
      { type: "outputContains", text: "20" },
    ],
  },
  {
    id: "net-50",
    zone: 6,
    title: "Five Knocks",
    briefing:
      "The gateway passed three pings and two pings. Give it five now, because the night is long and certainty is cheap.",
    task: "Ping 10.0.0.1 with exactly 5 packets.",
    hint: "ping -c 5 10.0.0.1",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ping\\s+-c\\s+5\\s+10\\.0\\.0\\.1" },
      { type: "outputContains", text: "5 packets transmitted" },
    ],
  },
  {
    id: "net-51",
    zone: 6,
    title: "Relay Date",
    briefing:
      "Your clock and the relay's clock should agree, or the timeline falls apart. Ask the relay what time it thinks it is.",
    task: "Ask the relay for its date over SSH.",
    hint: "ssh relay@10.0.0.2 date",
    xp: 10,
    verify: [{ type: "historyMatches", regex: "ssh\\s+relay@10\\.0\\.0\\.2\\s+date" }],
  },
  {
    id: "net-52",
    zone: 6,
    title: "Files Page Glance",
    briefing:
      "The gateway publishes a file listing, and somewhere in the HTML is the bundle you will need later. Fetch it and keep the bundle line.",
    task: "Fetch the relay's file listing and keep the bundle line.",
    hint: "curl -s http://10.0.0.1/files/ | grep bundle",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*curl\\b" },
      { type: "outputContains", text: "bundle.tar" },
    ],
  },
  {
    id: "net-53",
    zone: 6,
    title: "All Sockets",
    briefing:
      "TCP and UDP, listening and live. One view, everything. Stop switching tools and look at the whole board.",
    task: "Show every TCP and UDP socket in one view.",
    hint: "ss -tuna",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ss\\s+-tuna" },
      { type: "outputContains", text: "LISTEN" },
    ],
  },
  {
    id: "net-54",
    zone: 6,
    title: "Route One",
    briefing:
      "The routing table has two lines and the first one is the one that matters. Read only the top.",
    task: "Show just the first line of your routing table.",
    hint: "ip route | head -n 1",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ip\\s+route" },
      { type: "outputContains", text: "default via" },
    ],
  },
  {
    id: "net-55",
    zone: 6,
    title: "Top of Sockets",
    briefing:
      "The socket table starts with a header and then the listeners. Skim just the first three lines and move on.",
    task: "Show the first three lines of the TCP socket table.",
    hint: "ss -tln | head -n 3",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*ss\\b" },
      { type: "outputContains", text: "LISTEN" },
    ],
  },
  {
    id: "net-56",
    zone: 6,
    title: "Status Word Count",
    briefing:
      "That status JSON is one long breathless line. Count its words and file the number with the rest of the trivia.",
    task: "Count the words in the relay status page.",
    hint: "curl -s http://10.0.0.1/status | wc -w",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "wc\\s+-w" },
      { type: "outputContains", text: "1" },
    ],
  },
  {
    id: "net-57",
    zone: 6,
    title: "Log the Pings",
    briefing:
      "Proof of life should be written down, not just seen. Ping the gateway three times and save every line to /home/agent/net/pings.txt.",
    task: "Ping 10.0.0.1 three times and save the output to /home/agent/net/pings.txt.",
    hint: "ping -c 3 10.0.0.1 > /home/agent/net/pings.txt",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/pings.txt" },
      { type: "fileContains", path: "/home/agent/net/pings.txt", text: "0% packet loss" },
    ],
  },
  {
    id: "net-58",
    zone: 6,
    title: "Save Interfaces",
    briefing:
      "The interface table is your network identity card. Archive it to /home/agent/net/addrs.txt before the night shift ends.",
    task: "Save your interface addresses to /home/agent/net/addrs.txt.",
    hint: "ip addr > /home/agent/net/addrs.txt",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/addrs.txt" },
      { type: "fileContains", path: "/home/agent/net/addrs.txt", text: "10.0.0.9" },
    ],
  },
  {
    id: "net-59",
    zone: 6,
    title: "Save Sockets",
    briefing:
      "A snapshot of every TCP socket with its owning process belongs in the case file. Write it to /home/agent/net/sockets.txt.",
    task: "Save the full TCP socket table with processes to /home/agent/net/sockets.txt.",
    hint: "ss -tulpn > /home/agent/net/sockets.txt",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/sockets.txt" },
      { type: "fileContains", path: "/home/agent/net/sockets.txt", text: "sshd" },
    ],
  },
  {
    id: "net-60",
    zone: 6,
    title: "Headers to File",
    briefing:
      "Response headers say what the body never will: server version, content type, length. Archive the status page headers to /home/agent/net/headers.txt.",
    task: "Save the status page headers to /home/agent/net/headers.txt.",
    hint: "curl -I http://10.0.0.1/status > /home/agent/net/headers.txt",
    xp: 10,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/headers.txt" },
      { type: "fileContains", path: "/home/agent/net/headers.txt", text: "HTTP/1.1 200" },
    ],
  },
  {
    id: "net-61",
    zone: 6,
    title: "Append the Proof",
    briefing:
      "The proof log already holds yesterday's checks. Do not overwrite it. Append one fresh ping of the relay to /home/agent/net/proof.log.",
    task: "Ping 10.0.0.2 once and append the result to /home/agent/net/proof.log.",
    hint: "ping -c 1 10.0.0.2 >> /home/agent/net/proof.log",
    xp: 10,
    setup: {
      dirs: ["/home/agent/net"],
      files: { "/home/agent/net/proof.log": "gateway check 03:00 ok\n" },
    },
    verify: [
      { type: "fileExists", path: "/home/agent/net/proof.log" },
      { type: "fileContains", path: "/home/agent/net/proof.log", text: "10.0.0.2" },
    ],
  },
  {
    id: "net-62",
    zone: 6,
    title: "Double Knock",
    briefing:
      "Two hosts, one line. Knock on the gateway and then the relay without typing two separate commands.",
    task: "Ping the gateway once, then the relay once, in a single line.",
    hint: "ping -c 1 10.0.0.1 && ping -c 1 10.0.0.2",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ping\\s+-c\\s+1\\s+10\\.0\\.0\\.1\\s*&&\\s*ping\\s+-c\\s+1\\s+10\\.0\\.0\\.2" },
      { type: "outputContains", text: "0% packet loss" },
    ],
  },
  {
    id: "net-63",
    zone: 6,
    title: "Eth0 Lines",
    briefing:
      "The loopback lines are noise for this check. Filter the interface table down to the lines that mention eth0.",
    task: "Show every line of the interface table that mentions eth0.",
    hint: "ip addr | grep eth0",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "ip\\s+addr" },
      { type: "outputContains", text: "eth0" },
    ],
  },
  {
    id: "net-64",
    zone: 6,
    title: "Established Watch",
    briefing:
      "One connection is live right now, talking to 10.0.0.5. Find it in the socket table and take note.",
    task: "Show the established TCP connection to 10.0.0.5.",
    hint: "ss -tun | grep 10.0.0.5",
    xp: 10,
    verify: [
      { type: "historyMatches", regex: "^\\s*ss\\b" },
      { type: "outputContains", text: "10.0.0.5" },
    ],
  },
  // ---------------- MEDIUM (xp 20): net-65..net-99 ----------------
  {
    id: "net-65",
    zone: 6,
    title: "Variable Relay",
    briefing:
      "Typing 10.0.0.2 all night gets old. Store it in a variable and ping through the name instead. Laziness, but the productive kind.",
    task: "Store 10.0.0.2 in RELAY, then ping -c 1 $RELAY.",
    hint: "export RELAY=10.0.0.2, then: ping -c 1 $RELAY",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "export\\s+RELAY=10\\.0\\.0\\.2" },
      { type: "historyMatches", regex: "ping\\s+-c\\s+1\\s+\\$RELAY" },
      { type: "outputContains", text: "10.0.0.2" },
    ],
  },
  {
    id: "net-66",
    zone: 6,
    title: "Ship Two Samples",
    briefing:
      "One file was the test. Now send both samples to the relay in a single scp command, because the drop window is short.",
    task: "Send /home/agent/net/a.txt and /home/agent/net/b.txt to relay@10.0.0.2:/incoming/ in one command.",
    hint: "scp /home/agent/net/a.txt /home/agent/net/b.txt relay@10.0.0.2:/incoming/",
    xp: 20,
    setup: {
      files: {
        "/home/agent/net/a.txt": "sample alpha\n",
        "/home/agent/net/b.txt": "sample bravo\n",
      },
    },
    verify: [
      { type: "historyMatches", regex: "scp\\s+/home/agent/net/a\\.txt\\s+/home/agent/net/b\\.txt\\s+relay@10\\.0\\.0\\.2:/incoming/" },
    ],
  },
  {
    id: "net-67",
    zone: 6,
    title: "Uptime to File",
    briefing:
      "The relay's uptime is evidence of when it came back. Run uptime remotely and file the answer in /home/agent/net/relay_uptime.txt.",
    task: "Run uptime on the relay over SSH and save it to /home/agent/net/relay_uptime.txt.",
    hint: "ssh relay@10.0.0.2 uptime > /home/agent/net/relay_uptime.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/relay_uptime.txt" },
      { type: "fileContains", path: "/home/agent/net/relay_uptime.txt", text: "load average" },
    ],
  },
  {
    id: "net-68",
    zone: 6,
    title: "Whoami to File",
    briefing:
      "Small facts add up. Save the relay's answer to whoami into /home/agent/net/relay_who.txt for the case file.",
    task: "Run whoami on the relay over SSH and save it to /home/agent/net/relay_who.txt.",
    hint: "ssh relay@10.0.0.2 whoami > /home/agent/net/relay_who.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/relay_who.txt" },
      { type: "fileContains", path: "/home/agent/net/relay_who.txt", text: "relay" },
    ],
  },
  {
    id: "net-69",
    zone: 6,
    title: "Bundle List",
    briefing:
      "The relay bundle is a tarball, and you want to see inside before you unpack it. Download it, then list its contents without extracting.",
    task: "Download http://10.0.0.1/bundle.tar to /home/agent/net/bundle.tar, then list the archive contents.",
    hint: "wget -q -O /home/agent/net/bundle.tar http://10.0.0.1/bundle.tar, then: tar -tf /home/agent/net/bundle.tar",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "tar\\s+-tf" },
      { type: "outputContains", text: "bundle/readme.txt" },
    ],
  },
  {
    id: "net-70",
    zone: 6,
    title: "Unpack the Bundle",
    briefing:
      "The listing looked right, so now commit. Download the bundle into /home/agent/net, unpack it there, and make sure the readme survived the trip.",
    task: "In /home/agent/net, download the bundle and extract it.",
    hint: "cd /home/agent/net, then: wget -q http://10.0.0.1/bundle.tar, then: tar -xf bundle.tar",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/bundle/readme.txt" },
      { type: "fileContains", path: "/home/agent/net/bundle/readme.txt", text: "NEXUS-9 relay bundle" },
    ],
  },
  {
    id: "net-71",
    zone: 6,
    title: "Socket Columns",
    briefing:
      "The socket table is wide and your screen is not. Print just the local address column and nothing else.",
    task: "Print only the local address column of the listening TCP sockets.",
    hint: "ss -tln | awk '{print $5}'",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "0.0.0.0:22" },
    ],
  },
  {
    id: "net-72",
    zone: 6,
    title: "Port Cut",
    briefing:
      "Addresses are half the story; the ports are the other half. Slice the port numbers out of the local addresses.",
    task: "Print the port numbers of the listening TCP sockets.",
    hint: "ss -tln | grep ^tcp | awk '{print $5}' | cut -d: -f2",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "4444" },
    ],
  },
  {
    id: "net-73",
    zone: 6,
    title: "Sort the Ports",
    briefing:
      "Four listening ports, in whatever order the kernel felt like. Sort them numerically so the report reads clean.",
    task: "Print the listening TCP port numbers sorted numerically.",
    hint: "ss -tln | grep ^tcp | awk '{print $5}' | cut -d: -f2 | sort -n",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "sort\\s+-n" },
      { type: "outputContains", text: "22" },
    ],
  },
  {
    id: "net-74",
    zone: 6,
    title: "Unique Peers",
    briefing:
      "Established connections each name a peer. Dedupe the list so every remote endpoint appears exactly once.",
    task: "Print the sorted unique list of peer addresses on established TCP connections.",
    hint: "ss -tun | grep ESTAB | awk '{print $6}' | sort -u",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "sort\\s+-u" },
      { type: "outputContains", text: "10.0.0.5:51234" },
    ],
  },
  {
    id: "net-75",
    zone: 6,
    title: "Ping Loop",
    briefing:
      "Three pings, one command. Let a loop do the knocking while you watch the replies roll in.",
    task: "Ping 10.0.0.1 once, three times, using a for loop.",
    hint: "for i in 1 2 3; do ping -c 1 10.0.0.1; done",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "for\\s+i\\s+in" },
      { type: "outputContains", text: "0% packet loss" },
    ],
  },
  {
    id: "net-76",
    zone: 6,
    title: "Host Sweep",
    briefing:
      "The array has two neighbors worth checking: the gateway and the relay. Sweep both with a loop and one ping each.",
    task: "Ping 10.0.0.1 and 10.0.0.2 once each using a for loop.",
    hint: "for h in 10.0.0.1 10.0.0.2; do ping -c 1 $h; done",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "for\\s+h\\s+in" },
      { type: "outputContains", text: "10.0.0.2" },
    ],
  },
  {
    id: "net-77",
    zone: 6,
    title: "Sweep to File",
    briefing:
      "Sweeps are only useful if you keep the results. Ping both neighbors once each and append every line to /home/agent/net/sweep.txt.",
    task: "Ping 10.0.0.1 and 10.0.0.2 once each, appending all output to /home/agent/net/sweep.txt.",
    hint: "for h in 10.0.0.1 10.0.0.2; do ping -c 1 $h >> /home/agent/net/sweep.txt; done",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/sweep.txt" },
      { type: "fileContains", path: "/home/agent/net/sweep.txt", text: "10.0.0.2" },
    ],
  },
  {
    id: "net-78",
    zone: 6,
    title: "Error Log",
    briefing:
      "That address does not exist, and ping will say so on stderr. Capture its complaint in /home/agent/net/ping_err.txt.",
    task: "Ping 10.9.9.9 once and save the error message to /home/agent/net/ping_err.txt.",
    hint: "ping -c 1 10.9.9.9 2> /home/agent/net/ping_err.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/ping_err.txt" },
      { type: "fileContains", path: "/home/agent/net/ping_err.txt", text: "Name or service not known" },
    ],
  },
  {
    id: "net-79",
    zone: 6,
    title: "Silent Errors",
    briefing:
      "This page does not exist, and the quiet flag keeps curl from making a scene. Fetch it anyway and read the server's apology.",
    task: "Quietly fetch http://10.0.0.1/does-not-exist and show what comes back.",
    hint: "curl -s http://10.0.0.1/does-not-exist",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "curl\\s+-s\\b" },
      { type: "outputContains", text: "404 Not Found" },
    ],
  },
  {
    id: "net-80",
    zone: 6,
    title: "Missing Page Headers",
    briefing:
      "A missing page still sends headers, and the status line tells the story. Ask for headers only on the page that is not there.",
    task: "Fetch only the headers of http://10.0.0.1/does-not-exist.",
    hint: "curl -I http://10.0.0.1/does-not-exist",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "curl\\s+-I\\b" },
      { type: "outputContains", text: "404 Not Found" },
    ],
  },
  {
    id: "net-81",
    zone: 6,
    title: "Wget the Missing",
    briefing:
      "wget is honest about failure: it says so and refuses to leave a file behind. Try downloading the missing page and confirm both facts.",
    task: "Try to download http://10.0.0.1/does-not-exist to /home/agent/net/missing.html and confirm it fails.",
    hint: "wget -O /home/agent/net/missing.html http://10.0.0.1/does-not-exist",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileAbsent", path: "/home/agent/net/missing.html" },
      { type: "outputContains", text: "ERROR 404" },
    ],
  },
  {
    id: "net-82",
    zone: 6,
    title: "Diff the Status",
    briefing:
      "Two downloads of the same page should be identical. Save the status page twice and let diff confirm the silence.",
    task: "Save the status page to status_a.json and status_b.json in /home/agent/net, then diff them.",
    hint: "curl -s http://10.0.0.1/status > /home/agent/net/status_a.json, again for status_b.json, then: diff /home/agent/net/status_a.json /home/agent/net/status_b.json",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/status_b.json" },
      { type: "historyMatches", regex: "diff\\s+/home/agent/net/status_a\\.json" },
    ],
  },
  {
    id: "net-83",
    zone: 6,
    title: "Extract the Breach",
    briefing:
      "The breach timestamp is locked inside the JSON. Pull it out with an extended pattern and save just that fragment to /home/agent/net/fields.txt.",
    task: "Extract the breach field from the status page into /home/agent/net/fields.txt.",
    hint: "curl -s http://10.0.0.1/status | grep -oE '\"breach\":\"[0-9:]+\"' > /home/agent/net/fields.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/fields.txt" },
      { type: "fileContains", path: "/home/agent/net/fields.txt", text: "03:12" },
    ],
  },
  {
    id: "net-84",
    zone: 6,
    title: "Relay Chain",
    briefing:
      "Two questions for the relay, one line. Ask for its uptime and its username back to back over SSH.",
    task: "Run uptime and whoami on the relay in a single line.",
    hint: "ssh relay@10.0.0.2 uptime && ssh relay@10.0.0.2 whoami",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "ssh\\s+relay@10\\.0\\.0\\.2\\s+uptime" },
      { type: "historyMatches", regex: "ssh\\s+relay@10\\.0\\.0\\.2\\s+whoami" },
      { type: "outputContains", text: "relay" },
    ],
  },
  {
    id: "net-85",
    zone: 6,
    title: "Scp Then List",
    briefing:
      "Fetch the manifest, then prove it landed with a detailed listing. Two steps, both visible in your history.",
    task: "Fetch the relay manifest to /home/agent/net, then list it with details.",
    hint: "scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt, then: ls -l /home/agent/net/manifest.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/manifest.txt" },
      { type: "historyMatches", regex: "ls\\s+-l" },
    ],
  },
  {
    id: "net-86",
    zone: 6,
    title: "Manifest Word Count",
    briefing:
      "The manifest is short, but the report wants an exact word count. Fetch it and count.",
    task: "Fetch the relay manifest and count its words.",
    hint: "scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt, then: wc -w < /home/agent/net/manifest.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "wc\\s+-w" },
      { type: "outputContains", text: "7" },
    ],
  },
  {
    id: "net-87",
    zone: 6,
    title: "Sed the Manifest",
    briefing:
      "The case file spells it lowercase; the report wants RELAY in capitals. Preview the manifest with the swap, file untouched.",
    task: "Fetch the manifest and display it with 'relay' replaced by 'RELAY', without editing the file.",
    hint: "scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt, then: sed 's/relay/RELAY/' /home/agent/net/manifest.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "\\bsed\\b" },
      { type: "outputContains", text: "RELAY manifest" },
    ],
  },
  {
    id: "net-88",
    zone: 6,
    title: "Manifest Upper",
    briefing:
      "The manifest deserves to be shouted. Fetch it and print the whole thing in uppercase.",
    task: "Fetch the manifest and display it in all uppercase.",
    hint: "scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt, then: tr 'a-z' 'A-Z' < /home/agent/net/manifest.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "RELAY MANIFEST" },
    ],
  },
  {
    id: "net-89",
    zone: 6,
    title: "Interfaces Numbered",
    briefing:
      "Line numbers make the interface table citable in the report. Number every line and skim the top.",
    task: "Display the interface table with line numbers, first 5 lines only.",
    hint: "ip addr | cat -n | head -n 5",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "cat\\s+-n" },
      { type: "outputContains", text: "eth0" },
    ],
  },
  {
    id: "net-90",
    zone: 6,
    title: "Sort Interfaces",
    briefing:
      "The inet lines came out loopback first, which reads backwards. Sort them so the report starts clean.",
    task: "Show the inet lines of your interfaces sorted.",
    hint: "ip addr | grep inet | sort",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "\\bsort\\b" },
      { type: "outputContains", text: "10.0.0.9" },
    ],
  },
  {
    id: "net-91",
    zone: 6,
    title: "Two Pings One File",
    briefing:
      "One ping of the gateway, one ping of the relay, both into the same file. Then count the lines so the log reads like a log.",
    task: "Ping 10.0.0.1 once into /home/agent/net/dual.txt, append one ping of 10.0.0.2, then count the file's lines.",
    hint: "ping -c 1 10.0.0.1 > /home/agent/net/dual.txt, then ping -c 1 10.0.0.2 >> /home/agent/net/dual.txt, then: wc -l /home/agent/net/dual.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "wc\\s+-l" },
      { type: "outputContains", text: "12" },
    ],
  },
  {
    id: "net-92",
    zone: 6,
    title: "Tail the Log",
    briefing:
      "You saved three pings to a file. The summary lines are the only part that matters. Read the last two lines.",
    task: "Ping 10.0.0.1 three times into /home/agent/net/ping3.txt, then show its last 2 lines.",
    hint: "ping -c 3 10.0.0.1 > /home/agent/net/ping3.txt, then: tail -n 2 /home/agent/net/ping3.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "tail\\s+-n\\s+2" },
      { type: "outputContains", text: "rtt min" },
    ],
  },
  {
    id: "net-93",
    zone: 6,
    title: "Head the Headers",
    briefing:
      "Headers are many, but the status line is first. Fetch the headers and read only the top line.",
    task: "Fetch the status page headers and show only the first line.",
    hint: "curl -I http://10.0.0.1/status | head -n 1",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "head\\s+-n\\s+1" },
      { type: "outputContains", text: "HTTP/1.1 200" },
    ],
  },
  {
    id: "net-94",
    zone: 6,
    title: "Export Gateway",
    briefing:
      "The gateway address belongs in a variable too. Store it, then ping through it and keep only the summary line.",
    task: "Store 10.0.0.1 in GW, then ping it twice and show only the transmitted line.",
    hint: "export GW=10.0.0.1, then: ping -c 2 $GW | grep transmitted",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "export\\s+GW=10\\.0\\.0\\.1" },
      { type: "outputContains", text: "2 packets transmitted" },
    ],
  },
  {
    id: "net-95",
    zone: 6,
    title: "Chain the Relay",
    briefing:
      "The status line of the JSON says degraded, and that word belongs in its own file. Extract it, save it, then read it back.",
    task: "Save the status line of the status page to /home/agent/net/degraded.txt and display the file.",
    hint: "curl -s http://10.0.0.1/status | grep status > /home/agent/net/degraded.txt, then: cat /home/agent/net/degraded.txt",
    xp: 20,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileContains", path: "/home/agent/net/degraded.txt", text: "degraded" },
      { type: "outputContains", text: "degraded" },
    ],
  },
  {
    id: "net-96",
    zone: 6,
    title: "Loopback Count",
    briefing:
      "Four pings at loopback should mean four replies. Count the reply lines instead of eyeballing them.",
    task: "Ping 127.0.0.1 four times and count the reply lines.",
    hint: "ping -c 4 127.0.0.1 | grep -c 'bytes from'",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "grep\\s+-c" },
      { type: "outputContains", text: "4" },
    ],
  },
  {
    id: "net-97",
    zone: 6,
    title: "Relay Port 80",
    briefing:
      "Port 80 is open on this station and something owns it. Find the process behind the port 80 listener.",
    task: "Show the process listening on port 80.",
    hint: "ss -tlnp | grep ':80 '",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "^\\s*ss\\b" },
      { type: "outputContains", text: "relay-svc" },
    ],
  },
  {
    id: "net-98",
    zone: 6,
    title: "No UDP Here",
    briefing:
      "The TCP listing should have no UDP rows, but assume nothing. Filter for udp, and if nothing matches, say so plainly.",
    task: "Filter the TCP socket listing for udp; if nothing matches, print no-udp-found.",
    hint: "ss -tln | grep udp || echo no-udp-found",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "ss\\s+-tln" },
      { type: "outputContains", text: "no-udp-found" },
    ],
  },
  {
    id: "net-99",
    zone: 6,
    title: "Default Route Only",
    briefing:
      "The routing table has two lines and you need one field from one line: the gateway address on the default route. Cut it out.",
    task: "Print the gateway address from the default route.",
    hint: "ip route | grep ^default | awk '{print $3}'",
    xp: 20,
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "10.0.0.1" },
    ],
  },
  // ---------------- HARD (xp 30): net-100..net-124 ----------------
  {
    id: "net-100",
    zone: 6,
    title: "Full Sweep",
    briefing:
      "Three hosts, one file, one loop. Read the host list from /home/agent/net/hosts.txt and ping each one exactly once.",
    task: "Ping every host listed in /home/agent/net/hosts.txt once, using a while loop.",
    hint: "while read h; do ping -c 1 $h; done < /home/agent/net/hosts.txt",
    xp: 30,
    setup: { files: { "/home/agent/net/hosts.txt": "10.0.0.1\n10.0.0.2\n127.0.0.1\n" } },
    verify: [
      { type: "historyMatches", regex: "while\\s+read\\s+h" },
      { type: "outputContains", text: "0% packet loss" },
    ],
  },
  {
    id: "net-101",
    zone: 6,
    title: "Sweep to Summary",
    briefing:
      "Full ping output is noise; the summary lines are signal. Sweep the host list and keep only the transmitted lines in /home/agent/net/summary.txt.",
    task: "Ping every host in /home/agent/net/hosts.txt once, saving only the transmitted lines to /home/agent/net/summary.txt.",
    hint: "while read h; do ping -c 1 $h | grep transmitted >> /home/agent/net/summary.txt; done < /home/agent/net/hosts.txt",
    xp: 30,
    setup: { files: { "/home/agent/net/hosts.txt": "10.0.0.1\n10.0.0.2\n127.0.0.1\n" } },
    verify: [
      { type: "fileExists", path: "/home/agent/net/summary.txt" },
      { type: "fileContains", path: "/home/agent/net/summary.txt", text: "1 packets transmitted" },
    ],
  },
  {
    id: "net-102",
    zone: 6,
    title: "Bundle Inspect",
    briefing:
      "The bundle is downloaded; the packing slip is inside the tarball itself. List the archive verbosely and read the details.",
    task: "Download the bundle to /home/agent/net/bundle.tar and list its contents verbosely.",
    hint: "wget -q -O /home/agent/net/bundle.tar http://10.0.0.1/bundle.tar, then: tar -tvf /home/agent/net/bundle.tar",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "tar\\s+-tvf" },
      { type: "outputContains", text: "bundle/readme.txt" },
    ],
  },
  {
    id: "net-103",
    zone: 6,
    title: "Extract and Read",
    briefing:
      "Listing was the preview; now open the package. Extract the bundle in /home/agent/net and read the readme the night shift left you.",
    task: "In /home/agent/net, download the bundle, extract it, and display bundle/readme.txt.",
    hint: "cd /home/agent/net, then: wget -q http://10.0.0.1/bundle.tar, then: tar -xf bundle.tar, then: cat bundle/readme.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileContains", path: "/home/agent/net/bundle/readme.txt", text: "NEXUS-9 relay bundle" },
      { type: "outputContains", text: "night shift" },
    ],
  },
  {
    id: "net-104",
    zone: 6,
    title: "Evidence Off Station",
    briefing:
      "This is the real run. Ship /home/agent/net/evidence.txt to the relay's /incoming/, then confirm the drop point lists its manifest.",
    task: "Send evidence.txt to the relay's /incoming/ and list the directory over SSH.",
    hint: "scp /home/agent/net/evidence.txt relay@10.0.0.2:/incoming/, then: ssh relay@10.0.0.2 ls /incoming",
    xp: 30,
    setup: { files: { "/home/agent/net/evidence.txt": "intrusion timeline, final, signed\n" } },
    verify: [
      { type: "historyMatches", regex: "scp\\s+/home/agent/net/evidence\\.txt\\s+relay@10\\.0\\.0\\.2:/incoming/" },
      { type: "outputContains", text: "manifest.txt" },
    ],
  },
  {
    id: "net-105",
    zone: 6,
    title: "Quiet Gateway",
    briefing:
      "Three pings, zero noise on the terminal. Bury both stdout and stderr in a file, then report back with a single word.",
    task: "Ping 10.0.0.1 three times into /home/agent/net/q.txt, silencing both streams, then print done.",
    hint: "ping -c 3 10.0.0.1 > /home/agent/net/q.txt 2>&1, then: echo done",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/q.txt" },
      { type: "outputContains", text: "done" },
    ],
  },
  {
    id: "net-106",
    zone: 6,
    title: "Grep the Gateway",
    briefing:
      "Four keys live in that JSON: station, status, relay, breach. Save the page, then pull all four key names out with one extended pattern.",
    task: "Save the status page to /home/agent/net/st.json and print each of its four key names.",
    hint: "curl -s http://10.0.0.1/status > /home/agent/net/st.json, then: grep -oE '\"(station|status|relay|breach)\"' /home/agent/net/st.json",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "grep\\s+-oE" },
      { type: "outputContains", text: "\"breach\"" },
    ],
  },
  {
    id: "net-107",
    zone: 6,
    title: "Socket Sort Desc",
    briefing:
      "Highest port first: that is where the relay service answers, and AXIOM reads top-down. Sort the listening ports numerically, descending, and read the top one.",
    task: "Print the highest listening TCP port number.",
    hint: "ss -tln | grep ^tcp | awk '{print $5}' | cut -d: -f2 | sort -nr | head -n 1",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "sort\\s+-nr" },
      { type: "outputContains", text: "8443" },
    ],
  },
  {
    id: "net-108",
    zone: 6,
    title: "Relay Report",
    briefing:
      "Two facts about the relay belong in one file: its username and its hostname. Build /home/agent/net/relay_report.txt line by line, then read it.",
    task: "Save the relay's whoami and hostname into /home/agent/net/relay_report.txt, then display it.",
    hint: "ssh relay@10.0.0.2 whoami > /home/agent/net/relay_report.txt, then ssh relay@10.0.0.2 hostname >> /home/agent/net/relay_report.txt, then: cat /home/agent/net/relay_report.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileContains", path: "/home/agent/net/relay_report.txt", text: "relay" },
      { type: "outputContains", text: "relay" },
    ],
  },
  {
    id: "net-109",
    zone: 6,
    title: "Ping Diff",
    briefing:
      "Gateway and relay both answer, but their replies are not byte-identical. Save one ping of each and diff the two captures.",
    task: "Ping 10.0.0.1 and 10.0.0.2 once each into separate files in /home/agent/net, then diff them.",
    hint: "ping -c 1 10.0.0.1 > /home/agent/net/gw.txt, ping -c 1 10.0.0.2 > /home/agent/net/rl.txt, then: diff /home/agent/net/gw.txt /home/agent/net/rl.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "\\bdiff\\b" },
      { type: "outputContains", text: "10.0.0.2" },
    ],
  },
  {
    id: "net-110",
    zone: 6,
    title: "Interface Deep Cut",
    briefing:
      "The CIDR suffixes are clutter for the asset sheet. Strip them and print the bare interface addresses.",
    task: "Print your interface addresses without their /prefix suffixes.",
    hint: "ip addr | grep \"inet \" | awk '{print $2}' | cut -d/ -f1",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "cut\\s+-d/" },
      { type: "outputContains", text: "10.0.0.9" },
    ],
  },
  {
    id: "net-111",
    zone: 6,
    title: "Env to File to Grep",
    briefing:
      "Your environment holds the station's name and your name. Dump it to /home/agent/net/env.txt, then pull just the HOSTNAME and USER lines.",
    task: "Save your environment to /home/agent/net/env.txt and show the HOSTNAME and USER lines.",
    hint: "env > /home/agent/net/env.txt, then: grep -E \"^(HOSTNAME|USER)=\" /home/agent/net/env.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "grep\\s+-E" },
      { type: "outputContains", text: "HOSTNAME=nexus" },
    ],
  },
  {
    id: "net-112",
    zone: 6,
    title: "Sed the Route",
    briefing:
      "The report goes off-station and the raw gateway IP should not travel with it. Save your routing table with 10.0.0.1 masked as GATEWAY.",
    task: "Save your routing table to /home/agent/net/route_anon.txt with 10.0.0.1 replaced by GATEWAY.",
    hint: "ip route | sed 's/10.0.0.1/GATEWAY/' > /home/agent/net/route_anon.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/route_anon.txt" },
      { type: "fileContains", path: "/home/agent/net/route_anon.txt", text: "GATEWAY" },
    ],
  },
  {
    id: "net-113",
    zone: 6,
    title: "Awk the Sockets",
    briefing:
      "Protocol, local address, owning process: the three columns that matter. Print exactly those for every listening TCP socket.",
    task: "Print protocol, local address, and process for each listening TCP socket.",
    hint: "ss -tlnp | grep LISTEN | awk '{print $1, $5, $7}'",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "\\bawk\\b" },
      { type: "outputContains", text: "0.0.0.0:8443" },
    ],
  },
  {
    id: "net-114",
    zone: 6,
    title: "Uniq the Noise",
    briefing:
      "Three replies from the same host should collapse into one counted line. Prove all three pings reached 10.0.0.1 with a counted summary.",
    task: "Ping 10.0.0.1 three times and print a counted summary of the reply addresses.",
    hint: "ping -c 3 10.0.0.1 | grep \"bytes from\" | awk '{print $4}' | sort | uniq -c",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "uniq\\s+-c" },
      { type: "outputContains", text: "3 10.0.0.1:" },
    ],
  },
  {
    id: "net-115",
    zone: 6,
    title: "Case Flip the Status",
    briefing:
      "The status page reads like a whisper. Fetch it and shout the whole thing back in uppercase.",
    task: "Fetch the status page and display it in all uppercase.",
    hint: "curl -s http://10.0.0.1/status | tr 'a-z' 'A-Z'",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "\\btr\\b" },
      { type: "outputContains", text: "NEXUS-9" },
    ],
  },
  {
    id: "net-116",
    zone: 6,
    title: "Manifest Hunt",
    briefing:
      "The manifest mentions evidence, but the capitalization might vary. Fetch it and search case-insensitively.",
    task: "Fetch the relay manifest and find the evidence line regardless of case.",
    hint: "scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt, then: grep -i evidence /home/agent/net/manifest.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "grep\\s+-i" },
      { type: "outputContains", text: "evidence" },
    ],
  },
  {
    id: "net-117",
    zone: 6,
    title: "Triple Ping Log",
    briefing:
      "Three pings, three summary lines, one file. Loop the gateway ping and grow /home/agent/net/triple.txt one transmitted line at a time.",
    task: "Ping 10.0.0.1 once, three times, appending each transmitted line to /home/agent/net/triple.txt, then display it.",
    hint: "for i in 1 2 3; do ping -c 1 10.0.0.1 | grep transmitted >> /home/agent/net/triple.txt; done, then: cat /home/agent/net/triple.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "for\\s+i\\s+in" },
      { type: "outputContains", text: "1 packets transmitted" },
    ],
  },
  {
    id: "net-118",
    zone: 6,
    title: "SSH Loop",
    briefing:
      "Three remote questions, one loop. Ask the relay for whoami, hostname, and pwd in turn and watch the answers stack up.",
    task: "Run whoami, hostname, and pwd on the relay using a for loop.",
    hint: "for c in whoami hostname pwd; do ssh relay@10.0.0.2 $c; done",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "for\\s+c\\s+in" },
      { type: "outputContains", text: "/home/relay" },
    ],
  },
  {
    id: "net-119",
    zone: 6,
    title: "Cut Headers",
    briefing:
      "The Content headers carry the numbers AXIOM wants. Pull them from the status headers and cut out just the values.",
    task: "Show the values of the Content headers of the status page.",
    hint: "curl -I http://10.0.0.1/status | grep Content | cut -d' ' -f2",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "\\bcut\\b" },
      { type: "outputContains", text: "application/json" },
    ],
  },
  {
    id: "net-120",
    zone: 6,
    title: "Bundle Tarball Verify",
    briefing:
      "Before you unpack anything, confirm the checksums file made it into the bundle. Download the tarball and search its listing for it.",
    task: "Download the bundle and confirm bundle/checksums.txt is listed inside.",
    hint: "wget -q -O /home/agent/net/bundle.tar http://10.0.0.1/bundle.tar, then: tar -tf /home/agent/net/bundle.tar | grep checksums",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "historyMatches", regex: "tar\\s+-tf" },
      { type: "outputContains", text: "bundle/checksums.txt" },
    ],
  },
  {
    id: "net-121",
    zone: 6,
    title: "Extract Checksums",
    briefing:
      "The bundle carries a checksums file the night shift signed. Extract everything in /home/agent/net and read it.",
    task: "In /home/agent/net, download the bundle, extract it, and display bundle/checksums.txt.",
    hint: "cd /home/agent/net, then: wget -q http://10.0.0.1/bundle.tar, then: tar -xf bundle.tar, then: cat bundle/checksums.txt",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileContains", path: "/home/agent/net/bundle/checksums.txt", text: "relay.conf ok" },
      { type: "outputContains", text: "routes.ok" },
    ],
  },
  {
    id: "net-122",
    zone: 6,
    title: "Relay Evidence Drop",
    briefing:
      "The final report needs a footer before it leaves the station. Append the sign-off line, then ship the file to the relay.",
    task: "Append 'footer: station NEXUS-9, zone 6' to /home/agent/net/final_report.txt, then send it to relay@10.0.0.2:/incoming/.",
    hint: "echo 'footer: station NEXUS-9, zone 6' >> /home/agent/net/final_report.txt, then: scp /home/agent/net/final_report.txt relay@10.0.0.2:/incoming/",
    xp: 30,
    setup: { files: { "/home/agent/net/final_report.txt": "intrusion timeline, final\nall zones green\n" } },
    verify: [
      { type: "fileContains", path: "/home/agent/net/final_report.txt", text: "footer: station" },
      { type: "historyMatches", regex: "scp\\s+/home/agent/net/final_report\\.txt" },
    ],
  },
  {
    id: "net-123",
    zone: 6,
    title: "Ping Storm Summary",
    briefing:
      "Ten packets is a small storm, and nobody reads all ten replies. Send them, then read only the two summary lines at the end.",
    task: "Ping 10.0.0.1 ten times and show only the last 2 lines.",
    hint: "ping -c 10 10.0.0.1 | tail -n 2",
    xp: 30,
    verify: [
      { type: "historyMatches", regex: "ping\\s+-c\\s+10" },
      { type: "outputContains", text: "10 packets transmitted" },
    ],
  },
  {
    id: "net-124",
    zone: 6,
    title: "Array Roll Call",
    briefing:
      "The night ends with a roll call: interfaces, sockets, and the status page, each in its own file under /home/agent/net/rollcall/. Then list the directory so command sees the set.",
    task: "Save interfaces, listening TCP sockets, and the status page into /home/agent/net/rollcall/, then list the directory.",
    hint: "mkdir -p /home/agent/net/rollcall, then: ip addr > /home/agent/net/rollcall/addrs.txt, ss -tln > /home/agent/net/rollcall/sockets.txt, curl -s http://10.0.0.1/status > /home/agent/net/rollcall/status.json, then: ls /home/agent/net/rollcall",
    xp: 30,
    setup: { dirs: ["/home/agent/net"] },
    verify: [
      { type: "fileExists", path: "/home/agent/net/rollcall/status.json" },
      { type: "fileContains", path: "/home/agent/net/rollcall/sockets.txt", text: "LISTEN" },
      { type: "outputContains", text: "status.json" },
    ],
  },
];

export const SOLUTIONS_NET_X: Record<string, string[]> = {
  "net-20": ["ping -c 1 127.0.0.1"],
  "net-21": ["ping -c 2 10.0.0.2"],
  "net-22": ["ping -c 2 10.0.0.1"],
  "net-23": ["ping -c 3 localhost"],
  "net-24": ["ip link"],
  "net-25": ["ip addr | grep ether"],
  "net-26": ["ip addr | grep 127.0.0.1"],
  "net-27": ["ip route | grep default"],
  "net-28": ["ss -tln | grep 22"],
  "net-29": ["ss -tlnp | grep 4444"],
  "net-30": ["ss -ulpn"],
  "net-31": ["ss -tln | grep -c LISTEN"],
  "net-32": ["curl -s http://10.0.0.1/status"],
  "net-33": ["curl -s http://10.0.0.1/status | grep relay"],
  "net-34": ["curl -s http://10.0.0.1/status | grep breach"],
  "net-35": ["curl -o /home/agent/net/status.json http://10.0.0.1/status"],
  "net-36": ["wget -q -O /home/agent/net/patch.bin http://10.0.0.1/firmware/patch.bin"],
  "net-37": ["cd /home/agent/net", "wget http://10.0.0.1/firmware/patch.bin"],
  "net-38": ["cd /home/agent/net", "curl -O http://10.0.0.1/firmware/patch.bin"],
  "net-39": ["ssh relay@10.0.0.2 whoami"],
  "net-40": ["ssh relay@10.0.0.2 hostname"],
  "net-41": ["ssh relay@10.0.0.2 pwd"],
  "net-42": ["ssh relay@10.0.0.2 ls /incoming"],
  "net-43": ["scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt"],
  "net-44": ["scp /home/agent/net/sample.txt relay@10.0.0.2:/incoming/"],
  "net-45": ["hostname"],
  "net-46": ["whoami"],
  "net-47": ["env | grep HOSTNAME"],
  "net-48": ["ip addr | grep -c inet"],
  "net-49": ["ip route | wc -w"],
  "net-50": ["ping -c 5 10.0.0.1"],
  "net-51": ["ssh relay@10.0.0.2 date"],
  "net-52": ["curl -s http://10.0.0.1/files/ | grep bundle"],
  "net-53": ["ss -tuna"],
  "net-54": ["ip route | head -n 1"],
  "net-55": ["ss -tln | head -n 3"],
  "net-56": ["curl -s http://10.0.0.1/status | wc -w"],
  "net-57": ["ping -c 3 10.0.0.1 > /home/agent/net/pings.txt"],
  "net-58": ["ip addr > /home/agent/net/addrs.txt"],
  "net-59": ["ss -tulpn > /home/agent/net/sockets.txt"],
  "net-60": ["curl -I http://10.0.0.1/status > /home/agent/net/headers.txt"],
  "net-61": ["ping -c 1 10.0.0.2 >> /home/agent/net/proof.log"],
  "net-62": ["ping -c 1 10.0.0.1 && ping -c 1 10.0.0.2"],
  "net-63": ["ip addr | grep eth0"],
  "net-64": ["ss -tun | grep 10.0.0.5"],
  "net-65": ["export RELAY=10.0.0.2", "ping -c 1 $RELAY"],
  "net-66": ["scp /home/agent/net/a.txt /home/agent/net/b.txt relay@10.0.0.2:/incoming/"],
  "net-67": ["ssh relay@10.0.0.2 uptime > /home/agent/net/relay_uptime.txt"],
  "net-68": ["ssh relay@10.0.0.2 whoami > /home/agent/net/relay_who.txt"],
  "net-69": ["wget -q -O /home/agent/net/bundle.tar http://10.0.0.1/bundle.tar", "tar -tf /home/agent/net/bundle.tar"],
  "net-70": ["cd /home/agent/net", "wget -q http://10.0.0.1/bundle.tar", "tar -xf bundle.tar"],
  "net-71": ["ss -tln | awk '{print $5}'"],
  "net-72": ["ss -tln | grep ^tcp | awk '{print $5}' | cut -d: -f2"],
  "net-73": ["ss -tln | grep ^tcp | awk '{print $5}' | cut -d: -f2 | sort -n"],
  "net-74": ["ss -tun | grep ESTAB | awk '{print $6}' | sort -u"],
  "net-75": ["for i in 1 2 3; do ping -c 1 10.0.0.1; done"],
  "net-76": ["for h in 10.0.0.1 10.0.0.2; do ping -c 1 $h; done"],
  "net-77": ["for h in 10.0.0.1 10.0.0.2; do ping -c 1 $h >> /home/agent/net/sweep.txt; done"],
  "net-78": ["ping -c 1 10.9.9.9 2> /home/agent/net/ping_err.txt"],
  "net-79": ["curl -s http://10.0.0.1/does-not-exist"],
  "net-80": ["curl -I http://10.0.0.1/does-not-exist"],
  "net-81": ["wget -O /home/agent/net/missing.html http://10.0.0.1/does-not-exist"],
  "net-82": ["curl -s http://10.0.0.1/status > /home/agent/net/status_a.json", "curl -s http://10.0.0.1/status > /home/agent/net/status_b.json", "diff /home/agent/net/status_a.json /home/agent/net/status_b.json"],
  "net-83": ["curl -s http://10.0.0.1/status | grep -oE '\"breach\":\"[0-9:]+\"' > /home/agent/net/fields.txt"],
  "net-84": ["ssh relay@10.0.0.2 uptime && ssh relay@10.0.0.2 whoami"],
  "net-85": ["scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt", "ls -l /home/agent/net/manifest.txt"],
  "net-86": ["scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt", "wc -w < /home/agent/net/manifest.txt"],
  "net-87": ["scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt", "sed 's/relay/RELAY/' /home/agent/net/manifest.txt"],
  "net-88": ["scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt", "tr 'a-z' 'A-Z' < /home/agent/net/manifest.txt"],
  "net-89": ["ip addr | cat -n | head -n 5"],
  "net-90": ["ip addr | grep inet | sort"],
  "net-91": ["ping -c 1 10.0.0.1 > /home/agent/net/dual.txt", "ping -c 1 10.0.0.2 >> /home/agent/net/dual.txt", "wc -l /home/agent/net/dual.txt"],
  "net-92": ["ping -c 3 10.0.0.1 > /home/agent/net/ping3.txt", "tail -n 2 /home/agent/net/ping3.txt"],
  "net-93": ["curl -I http://10.0.0.1/status | head -n 1"],
  "net-94": ["export GW=10.0.0.1", "ping -c 2 $GW | grep transmitted"],
  "net-95": ["curl -s http://10.0.0.1/status | grep status > /home/agent/net/degraded.txt", "cat /home/agent/net/degraded.txt"],
  "net-96": ["ping -c 4 127.0.0.1 | grep -c 'bytes from'"],
  "net-97": ["ss -tlnp | grep ':80 '"],
  "net-98": ["ss -tln | grep udp || echo no-udp-found"],
  "net-99": ["ip route | grep ^default | awk '{print $3}'"],
  "net-100": ["while read h; do ping -c 1 $h; done < /home/agent/net/hosts.txt"],
  "net-101": ["while read h; do ping -c 1 $h | grep transmitted >> /home/agent/net/summary.txt; done < /home/agent/net/hosts.txt"],
  "net-102": ["wget -q -O /home/agent/net/bundle.tar http://10.0.0.1/bundle.tar", "tar -tvf /home/agent/net/bundle.tar"],
  "net-103": ["cd /home/agent/net", "wget -q http://10.0.0.1/bundle.tar", "tar -xf bundle.tar", "cat bundle/readme.txt"],
  "net-104": ["scp /home/agent/net/evidence.txt relay@10.0.0.2:/incoming/", "ssh relay@10.0.0.2 ls /incoming"],
  "net-105": ["ping -c 3 10.0.0.1 > /home/agent/net/q.txt 2>&1", "echo done"],
  "net-106": ["curl -s http://10.0.0.1/status > /home/agent/net/st.json", "grep -oE '\"(station|status|relay|breach)\"' /home/agent/net/st.json"],
  "net-107": ["ss -tln | grep ^tcp | awk '{print $5}' | cut -d: -f2 | sort -nr | head -n 1"],
  "net-108": ["ssh relay@10.0.0.2 whoami > /home/agent/net/relay_report.txt", "ssh relay@10.0.0.2 hostname >> /home/agent/net/relay_report.txt", "cat /home/agent/net/relay_report.txt"],
  "net-109": ["ping -c 1 10.0.0.1 > /home/agent/net/gw.txt", "ping -c 1 10.0.0.2 > /home/agent/net/rl.txt", "diff /home/agent/net/gw.txt /home/agent/net/rl.txt"],
  "net-110": ["ip addr | grep \"inet \" | awk '{print $2}' | cut -d/ -f1"],
  "net-111": ["env > /home/agent/net/env.txt", "grep -E \"^(HOSTNAME|USER)=\" /home/agent/net/env.txt"],
  "net-112": ["ip route | sed 's/10.0.0.1/GATEWAY/' > /home/agent/net/route_anon.txt"],
  "net-113": ["ss -tlnp | grep LISTEN | awk '{print $1, $5, $7}'"],
  "net-114": ["ping -c 3 10.0.0.1 | grep \"bytes from\" | awk '{print $4}' | sort | uniq -c"],
  "net-115": ["curl -s http://10.0.0.1/status | tr 'a-z' 'A-Z'"],
  "net-116": ["scp relay@10.0.0.2:/incoming/manifest.txt /home/agent/net/manifest.txt", "grep -i evidence /home/agent/net/manifest.txt"],
  "net-117": ["for i in 1 2 3; do ping -c 1 10.0.0.1 | grep transmitted >> /home/agent/net/triple.txt; done", "cat /home/agent/net/triple.txt"],
  "net-118": ["for c in whoami hostname pwd; do ssh relay@10.0.0.2 $c; done"],
  "net-119": ["curl -I http://10.0.0.1/status | grep Content | cut -d' ' -f2"],
  "net-120": ["wget -q -O /home/agent/net/bundle.tar http://10.0.0.1/bundle.tar", "tar -tf /home/agent/net/bundle.tar | grep checksums"],
  "net-121": ["cd /home/agent/net", "wget -q http://10.0.0.1/bundle.tar", "tar -xf bundle.tar", "cat bundle/checksums.txt"],
  "net-122": ["echo 'footer: station NEXUS-9, zone 6' >> /home/agent/net/final_report.txt", "scp /home/agent/net/final_report.txt relay@10.0.0.2:/incoming/"],
  "net-123": ["ping -c 10 10.0.0.1 | tail -n 2"],
  "net-124": ["mkdir -p /home/agent/net/rollcall", "ip addr > /home/agent/net/rollcall/addrs.txt", "ss -tln > /home/agent/net/rollcall/sockets.txt", "curl -s http://10.0.0.1/status > /home/agent/net/rollcall/status.json", "ls /home/agent/net/rollcall"],
};
