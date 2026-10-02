import { SOLUTIONS_NAV_X } from "./challenges_nav_x";
import { SOLUTIONS_READ_X } from "./challenges_read_x";
import { SOLUTIONS_TEXT_X } from "./challenges_text_x";
import { SOLUTIONS_PERM_X } from "./challenges_perm_x";
import { SOLUTIONS_PROC_X } from "./challenges_proc_x";
import { SOLUTIONS_NET_X } from "./challenges_net_x";
import { SOLUTIONS_SYS_X } from "./challenges_sys_x";
import { SOLUTIONS_SHELL_X } from "./challenges_shell_x";

// Solutions for the original v3 new-command challenges (moved out of scripts/playthrough.ts).
const BASE_SOLUTIONS: Record<string, string[]> = {
  "nav-14": ["ls -a /home/agent"],
  "nav-15": ["cd /home/agent/ops", "cd /home/agent/lab", "cd -"],
  "nav-16": ["ls -t /home/agent/logs"],
  "nav-17": ["cp /home/agent/evidence/evidence_a.txt /home/agent/evidence/evidence_b.txt /home/agent/evidence/evidence_c.txt /home/agent/vault"],
  "nav-18": ["rm -r /home/agent/decoy", "mkdir -p /home/agent/decoy/clean/swept", "touch /home/agent/decoy/clean/swept/swept.txt"],
  "nav-19": ["cd /home/agent/ops", "mv report.txt archive"],
  "net-14": ["ping -c 3 10.9.0.1"],
  "net-15": ["ip -brief addr"],
  "net-16": ["ss -s"],
  "net-17": ["curl -o /home/agent/starchart.txt http://relay.local/charts/latest"],
  "net-18": ["wget -O /home/agent/patch.tar.gz http://relay.local/patches/bundle.bin"],
  "net-19": ["curl -d \"zone=6&status=green\" http://relay.local/report"],
  "perm-14": ["chmod 644 /home/agent/docs/bulletin.txt"],
  "perm-15": ["chmod g+w /home/agent/crew/watch.log"],
  "perm-16": ["chown agent:crew /home/agent/vault/evidence.txt"],
  "perm-17": ["chmod --reference /home/agent/vault/master.key /home/agent/vault/spare.key"],
  "perm-18": ["umask 027", "touch /home/agent/vault/newkey.txt"],
  "perm-19": ["ls -l /home/agent/shared", "chmod o-w /home/agent/shared/notes.txt"],
  "proc-14": ["top -b -n 1"],
  "proc-15": ["sleep 120 &", "jobs -l"],
  "proc-16": ["sleep 400 &", "pgrep -f sleep"],
  "proc-17": ["sleep 200 &", "kill %1"],
  "proc-18": ["ps -o pid,cmd"],
  "proc-19": ["__PGREP_KILL_TERM"],
  "read-14": ["cat /home/agent/split/part1.txt /home/agent/split/part2.txt"],
  "read-15": ["wc -c /home/agent/comms/payload.bin"],
  "read-16": ["tail -n +5 /home/agent/logs/sys.log"],
  "read-17": ["cat -A /home/agent/conf/app.conf"],
  "read-18": ["diff -u /home/agent/fw/rules_old.txt /home/agent/fw/rules_new.txt"],
  "read-19": ["head -n -3 /home/agent/logs/telemetry.log"],
  "shell-14": ["ls /home/agent/logs/log?.txt"],
  "shell-15": ["ls /no/such/dir 2> /home/agent/errors.txt"],
  "shell-16": ["cat /home/agent/reactor.log | grep WARN | wc -l"],
  "shell-17": ["find /home/agent/data -size +1k"],
  "shell-18": ["while read h; do echo \"checking $h\"; done < /home/agent/hosts.txt"],
  "shell-19": ["echo ${BACKUP_DIR:-/backup}"],
  "sys-14": ["df -h"],
  "sys-15": ["uname -r"],
  "sys-16": ["du -sh /var/log"],
  "sys-17": ["free -h"],
  "sys-18": ["uptime -p"],
  "sys-19": ["date -u \"+%Y-%m-%d %H:%M\""],
  "text-14": ["grep -c breach /home/agent/logs/alerts.log"],
  "text-15": ["grep -n vex /home/agent/crew/manifest.txt"],
  "text-16": ["cut -c 1-8 /home/agent/logs/access.dat"],
  "text-17": ["tr -d 0-9 < /home/agent/comms/noisy.txt"],
  "text-18": ["sed -n '3,5p' /home/agent/logs/vault.log"],
  "text-19": ["awk -F, '$3 > 100 {print $1}' /home/agent/logs/power.csv"],
};

// Every challenge id in the game maps to the exact command lines that solve it.
// Used by scripts/playthrough.ts for the automated full playthrough.
export const SOLUTIONS: Record<string, string[]> = {
  ...BASE_SOLUTIONS,
  ...SOLUTIONS_NAV_X,
  ...SOLUTIONS_READ_X,
  ...SOLUTIONS_TEXT_X,
  ...SOLUTIONS_PERM_X,
  ...SOLUTIONS_PROC_X,
  ...SOLUTIONS_NET_X,
  ...SOLUTIONS_SYS_X,
  ...SOLUTIONS_SHELL_X,
};
