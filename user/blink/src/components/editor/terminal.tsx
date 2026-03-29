import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";





export default function TerminalUI

({ output }) {
  const terminalRef = useRef(null);
  const term = useRef<Terminal | null>(null);

  useEffect(() => {
    term.current = new Terminal();
    term.current.open(terminalRef.current!);

    return () => term.current?.dispose();
  }, []);

  useEffect(() => {
    if (output && term.current) {
      term.current.write(output + "\r\n");
    }
  }, [output]);

  return(
    <div ref={terminalRef} style={{ height: "100%", fontSize: "8px"}} />
  );
}