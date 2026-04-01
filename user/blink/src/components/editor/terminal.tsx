import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function TerminalUI({ output }: { output: string }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    term.current = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        theme: {
            background: "#000000",
            foreground: "#ffffff"
        }
    });
    
    term.current.open(terminalRef.current);
    term.current.writeln("\x1b[1;34mBlink Execution Terminal\x1b[0m");
    term.current.writeln("Ready for strategy deployment...");

    return () => term.current?.dispose();
  }, []);

  useEffect(() => {
    if (output && term.current) {
      term.current.write(output + "\r\n");
    }
  }, [output]);

  return (
    <div className="h-full w-full bg-black overflow-hidden">
        <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
}