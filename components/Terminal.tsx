"use client";

/**
 * NEXUS: Linux Quest - interactive terminal component (xterm.js).
 *
 * Props: { shell: Shell }. One submitted line -> shell.execute(input),
 * output printed, fresh prompt. The shell may be the wrapped shell from
 * TerminalGame ({ ...shell, execute }) so every method used here must
 * exist on the wrapped object too (the engine keeps all Shell methods
 * as own properties, which survive the spread).
 */

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import type { Shell } from "@/lib/engine/types";

interface TerminalProps {
  shell: Shell;
}

interface InteractiveShell extends Shell {
  getCwd?: () => string;
  getUser?: () => string;
  displayPath?: () => string;
}

const BG = "#0b0e14";
const FG = "#e6e9f0";
const GREEN = "#4ade80";

export function Terminal({ shell }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef(shell);
  shellRef.current = shell;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontFamily: "'GeistMono', ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 14,
      lineHeight: 1.25,
      theme: {
        background: BG,
        foreground: FG,
        cursor: GREEN,
        cursorAccent: BG,
        selectionBackground: "#263142",
        black: BG,
        brightBlack: "#4b5563",
        green: GREEN,
        brightGreen: GREEN,
        white: FG,
        brightWhite: "#ffffff",
      },
      scrollback: 2000,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(el);
    try {
      fit.fit();
    } catch {
      /* element may be hidden on first mount */
    }

    const sh = () => shellRef.current as InteractiveShell;
    const promptPath = () => {
      const s = sh();
      return typeof s.displayPath === "function" ? s.displayPath() : "~";
    };
    const promptUser = () => {
      const s = sh();
      return typeof s.getUser === "function" ? s.getUser() : "agent";
    };

    const writePrompt = () => {
      term.write(`\x1b[38;2;74;222;128m${promptUser()}@nexus\x1b[0m:${promptPath()}$ `);
    };

    let line = "";
    let cursor = 0;
    let historyIdx = -1; // -1 = current (unsent) line
    let draft = "";

    const history = () => sh().getHistory();

    const redraw = () => {
      // clear current visual line and rewrite prompt + line
      term.write("\x1b[2K\r");
      writePrompt();
      term.write(line);
      const back = line.length - cursor;
      if (back > 0) term.write(`\x1b[${back}D`);
    };

    const submit = () => {
      term.write("\r\n");
      const input = line;
      line = "";
      cursor = 0;
      historyIdx = -1;
      draft = "";
      let out = "";
      try {
        out = sh().execute(input);
      } catch {
        out = "bash: internal error\n";
      }
      if (out) term.write(out.replace(/\n/g, "\r\n"));
      if (!(sh() as { exited?: boolean }).exited) {
        writePrompt();
      } else {
        term.write("\r\n[session ended]\r\n");
      }
    };

    const complete = () => {
      let candidates: string[] = [];
      try {
        candidates = sh().completeTab(line) ?? [];
      } catch {
        candidates = [];
      }
      if (candidates.length === 0) {
        term.write("\x07");
        return;
      }
      // longest common prefix across candidates
      let common = candidates[0];
      for (const c of candidates.slice(1)) {
        let i = 0;
        while (i < common.length && i < c.length && common[i] === c[i]) i++;
        common = common.slice(0, i);
      }
      const uptoCursor = line.slice(0, cursor);
      const lastSpace = Math.max(uptoCursor.lastIndexOf(" "), uptoCursor.lastIndexOf("\t"));
      const wordStart = lastSpace + 1;
      const word = uptoCursor.slice(wordStart);
      if (candidates.length === 1 || common.length > word.length) {
        const suffix = common.slice(word.length);
        line = line.slice(0, cursor) + suffix + line.slice(cursor);
        cursor += suffix.length;
        if (candidates.length === 1 && !common.endsWith("/")) {
          line = line.slice(0, cursor) + " " + line.slice(cursor);
          cursor += 1;
        }
        redraw();
      } else {
        term.write("\r\n" + candidates.join("   ").replace(/\n/g, "\r\n") + "\r\n");
        redraw();
      }
    };

    const onData = term.onData((data: string) => {
      for (let i = 0; i < data.length; i++) {
        const ch = data[i];
        const code = ch.charCodeAt(0);
        // Enter
        if (ch === "\r") {
          submit();
          return;
        }
        // Ctrl+C
        if (ch === "\x03") {
          term.write("^C\r\n");
          line = "";
          cursor = 0;
          historyIdx = -1;
          draft = "";
          writePrompt();
          return;
        }
        // Ctrl+L
        if (ch === "\x0c") {
          term.clear();
          redraw();
          return;
        }
        // Ctrl+U: kill line
        if (ch === "\x15") {
          line = "";
          cursor = 0;
          redraw();
          return;
        }
        // Backspace
        if (ch === "\x7f") {
          if (cursor > 0) {
            line = line.slice(0, cursor - 1) + line.slice(cursor);
            cursor--;
            redraw();
          }
          continue;
        }
        // Delete
        if (data.startsWith("\x1b[3~", i)) {
          if (cursor < line.length) {
            line = line.slice(0, cursor) + line.slice(cursor + 1);
            redraw();
          }
          i += 3;
          continue;
        }
        // Up / Down
        if (data.startsWith("\x1b[A", i) || data.startsWith("\x1b[B", i)) {
          const up = data[i + 1] === "A";
          i += 2;
          const h = history();
          if (h.length === 0) continue;
          if (historyIdx === -1) draft = line;
          if (up) historyIdx = historyIdx === -1 ? h.length - 1 : Math.max(0, historyIdx - 1);
          else historyIdx = historyIdx === -1 ? -1 : historyIdx + 1 >= h.length ? -1 : historyIdx + 1;
          line = historyIdx === -1 ? draft : h[historyIdx];
          cursor = line.length;
          redraw();
          continue;
        }
        // Left / Right
        if (data.startsWith("\x1b[D", i)) {
          if (cursor > 0) {
            cursor--;
            term.write("\x1b[D");
          }
          i += 2;
          continue;
        }
        if (data.startsWith("\x1b[C", i)) {
          if (cursor < line.length) {
            cursor++;
            term.write("\x1b[C");
          }
          i += 2;
          continue;
        }
        // Home / End (also Ctrl+A / Ctrl+E)
        if (data.startsWith("\x1b[H", i) || ch === "\x01") {
          cursor = 0;
          redraw();
          if (data.startsWith("\x1b[H", i)) i += 2;
          continue;
        }
        if (data.startsWith("\x1b[F", i) || ch === "\x05") {
          cursor = line.length;
          redraw();
          if (data.startsWith("\x1b[F", i)) i += 2;
          continue;
        }
        // Tab
        if (ch === "\t") {
          complete();
          continue;
        }
        // Printable
        if (code >= 32 && code !== 127) {
          line = line.slice(0, cursor) + ch + line.slice(cursor);
          cursor++;
          redraw();
        }
      }
    });

    const onResize = () => {
      try {
        fit.fit();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("resize", onResize);

    writePrompt();
    term.focus();

    return () => {
      window.removeEventListener("resize", onResize);
      onData.dispose();
      term.dispose();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" style={{ background: BG }} />;
}

export default Terminal;
