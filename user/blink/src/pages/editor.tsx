import { useState, useEffect, useRef } from "react";
import Explorer from "../components/editor/explorer";
import TerminalUI from "../components/editor/terminal";
import EditorMain from "../components/editor/editor-main";
import { useWebSocket } from "../hooks/useWebSocket";
import type { FileType } from "../types/editor";

const BACKEND_URL =
  import.meta.env.VITE_RESEARCH_BACKEND_URL || "http://localhost:5000";

const Editor = () => {
  const { isConnected, marketData, subscribe } = useWebSocket();

  const [files, setFiles] = useState<FileType[]>([
    {
      id: "1",
      name: "strategy1.py",
      content:
        "# Python Strategy Example\nimport time\n\ndef main():\n    print('Strategy initialized!')\n    print('Current time:', time.strftime('%Y-%m-%d %H:%M:%S'))\n\nif __name__ == '__main__':\n    main()",
      language: "python",
      path: "engine/algos/strategy1.py",
    },
  ]);

  const [activeFile, setActiveFile] = useState<FileType>(files[0]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(13);
  const [terminalHeight, setTerminalHeight] = useState(30);

  const isDraggingSidebar = useRef(false);
  const isDraggingTerminal = useRef(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const startSidebar = useRef(0);
  const startTerminal = useRef(0);

  useEffect(() => {
    subscribe("price_");
    subscribe("bid_");
    subscribe("ask_");
  }, [subscribe]);

  const updateFileContent = (content: string) => {
    const updated = files.map((f) =>
      f.id === activeFile.id ? { ...f, content } : f
    );
    setFiles(updated);
    setActiveFile({ ...activeFile, content });
  };

const runCode = async () => {
  setOutput("⏳ Running...\n");

  try {
    const res = await fetch(`${BACKEND_URL}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: activeFile.content,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setOutput(`✅ Execution completed\n\n${data.output}`);
    } else {
      setOutput(`❌ Error\n\n${data.error}`);
    }
  } catch (err) {
    setOutput("❌ Backend not running or connection failed");
  }
};
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (isDraggingSidebar.current) {
        const dx = e.clientX - startX.current;
        const percent = (dx / window.innerWidth) * 100;
        const newWidth = startSidebar.current + percent;
        setSidebarWidth(Math.max(10, Math.min(40, newWidth)));
      }

      if (isDraggingTerminal.current) {
        const dy = startY.current - e.clientY;
        const percent = (dy / window.innerHeight) * 100;
        const newHeight = startTerminal.current + percent;
        setTerminalHeight(Math.max(10, Math.min(60, newHeight)));
      }
    };

    const stopDrag = () => {
      isDraggingSidebar.current = false;
      isDraggingTerminal.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
    window.addEventListener("blur", stopDrag);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
      window.removeEventListener("blur", stopDrag);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#1e1e1e]">
      {/* Explorer */}
      <div
        className="h-full border-r border-white/10"
        style={{ width: `${sidebarWidth}%`, flexShrink: 0 }}
      >
        <Explorer
          files={files}
          setFiles={setFiles}
          activeFileId={activeFile.id}
          setActiveFileId={(id: string) => {
            const file = files.find((f) => f.id === id);
            if (file) setActiveFile(file);
          }}
        />
      </div>

      {/* Sidebar Handle */}
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          isDraggingSidebar.current = true;
          startX.current = e.clientX;
          startSidebar.current = sidebarWidth;
          document.body.style.userSelect = "none";
          document.body.style.cursor = "col-resize";
        }}
        className="w-[6px] flex items-center justify-center cursor-col-resize hover:bg-white/10 select-none"
      >
        <div className="w-[2px] h-10 bg-white/30 rounded-full" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-2 flex justify-end border-b border-white/10">
            <button
              onClick={runCode}
              className="bg-[#FF6D1F] text-white px-2 py-1 text-[6px]"
            >
              Run
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <EditorMain
              activeFile={activeFile}
              updateFileContent={updateFileContent}
            />
          </div>
        </div>

        {/* Terminal Handle */}
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            isDraggingTerminal.current = true;
            startY.current = e.clientY;
            startTerminal.current = terminalHeight;
            document.body.style.userSelect = "none";
            document.body.style.cursor = "row-resize";
          }}
          className="h-[10px] flex items-center justify-center cursor-row-resize hover:bg-white/10 select-none"
        >
          <div className="h-[2px] w-20 bg-white/30 rounded-full" />
        </div>

        {/* Terminal */}
        <div
          className="border-t border-white/10 bg-[#181818] flex flex-col overflow-hidden"
          style={{ flexBasis: `${terminalHeight}%`, flexShrink: 0 }}
        >
          <div className="p-2 border-b border-white/10 text-xs text-white/50">
            {isConnected ? "Connected" : "Disconnected"}
          </div>

          <div className="flex-1 min-h-0">
            <TerminalUI output={output} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;