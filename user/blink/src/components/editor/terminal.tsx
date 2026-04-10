import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function TerminalUI({ output }: { output: string }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const lastOutput = useRef<string>("");

  useEffect(() => {
    if (!terminalRef.current) return;

    term.current = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        theme: {
            background: "#000000",
            foreground: "#00ff00",
            cursor: "#00ff00"
        },
        scrollback: 1000,
        disableStdin: true
    });
    
    term.current.open(terminalRef.current);
    term.current.writeln("\x1b[1;32m╔═══════════════════════════════════════════════════════════╗\x1b[0m");
    term.current.writeln("\x1b[1;32m║  🚀 BLINK Research Executor Terminal                       ║\x1b[0m");
    term.current.writeln("\x1b[1;32m║  Ready for strategy execution and testing                  ║\x1b[0m");
    term.current.writeln("\x1b[1;32m╚═══════════════════════════════════════════════════════════╝\x1b[0m");
    term.current.writeln("");

    return () => term.current?.dispose();
  }, []);

  useEffect(() => {
    if (output && term.current && output !== lastOutput.current) {
      lastOutput.current = output;
      // Clear previous output
      term.current.clear();
      
      // Write header
      term.current.writeln("\x1b[1;32m╔═══════════════════════════════════════════════════════════╗\x1b[0m");
      term.current.writeln("\x1b[1;32m║  🚀 BLINK Research Executor Terminal                       ║\x1b[0m");
      term.current.writeln("\x1b[1;32m║  Ready for strategy execution and testing                  ║\x1b[0m");
      term.current.writeln("\x1b[1;32m╚═══════════════════════════════════════════════════════════╝\x1b[0m");
      term.current.writeln("");
      
      // Write output with color coding
      const lines = output.split('\n');
      lines.forEach(line => {
        if (!line.trim()) {
          term.current?.writeln("");
          return;
        }
        
        if (line.includes('✅') || line.includes('successfully') || line.includes('completed')) {
          term.current?.writeln(`\x1b[1;32m${line}\x1b[0m`);
        } else if (line.includes('❌') || line.includes('Error') || line.includes('error') || line.includes('Connection refused') || line.includes('HTTP ')) {
          term.current?.writeln(`\x1b[1;31m${line}\x1b[0m`);
        } else if (line.includes('⏳')) {
          term.current?.writeln(`\x1b[1;33m${line}\x1b[0m`);
        } else if (line.includes('💡') || line.includes('Make sure') || line.includes('Start it') || line.includes('Backend')) {
          term.current?.writeln(`\x1b[1;36m${line}\x1b[0m`);
        } else {
          term.current?.writeln(line);
        }
      });
    }
  }, [output]);

  return (
    <div className="h-full w-full bg-black overflow-hidden rounded-lg">
        <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
}