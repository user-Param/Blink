import { useState, useEffect, useRef } from "react";
import Explorer from "../components/editor/explorer";
import TerminalUI from "../components/editor/terminal";
import EditorMain from "../components/editor/editor-main";
import { useWebSocket } from "../hooks/useWebSocket";
import type { FileType } from "../types/editor";
import { Shield, AlertCircle, X, CheckCircle2, Play } from "lucide-react";

const BACKEND_URL =
  (import.meta as any).env?.VITE_RESEARCH_BACKEND_URL || "http://localhost:5000";

const Editor = () => {
  const { isConnected, marketData, subscribe, sendMessage } = useWebSocket();

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
  const [showDeployWarning, setShowDeployWarning] = useState(false);

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

  const handleSave = async () => {
    setOutput("🔍 Validating strategy components...\n");
    try {
      const res = await fetch(`${BACKEND_URL}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language
        }),
      });
      
      const data = await res.json();
      if (data.valid) {
        setOutput("✅ Validation successful. Strategy structure is correct.\n");
        setShowDeployWarning(true);
      } else {
        setOutput(`❌ Validation failed:\n${data.error}\n`);
      }
    } catch (err) {
      setOutput("❌ Validation backend error. Please ensure Research Executor is running.\n");
    }
  };

  const confirmSave = () => {
    setOutput("💾 Persisting strategy to database...\n");
    
    const payload = {
      request: "save_strategy",
      data: {
        name: activeFile.name.split('.')[0],
        language: activeFile.language,
        content: activeFile.content,
        path: activeFile.path
      }
    };

    sendMessage(JSON.stringify(payload));
    setShowDeployWarning(false);
    setOutput("✨ Strategy successfully saved and deployed to simulation engine!\n");
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
        language: activeFile.language
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
          <div className="p-2 flex justify-end items-center border-b border-white/10 gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/30 px-3 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={12} /> Save
            </button>
            <button
              onClick={runCode}
              className="bg-[#FF6D1F] hover:bg-[#e55d1a] text-white px-4 py-1 text-[10px] font-bold rounded shadow-lg shadow-[#FF6D1F]/10 transition-all flex items-center gap-1.5"
            >
              <Play size={12} fill="currentColor" /> Run
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

      {/* Deployment Warning Modal */}
      {showDeployWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-[#FF6D1F]" />
                Strategy Deployment
              </h3>
              <button
                onClick={() => setShowDeployWarning(false)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h4 className="text-white text-lg font-bold mb-3">Risk Acknowledgment</h4>
                <p className="text-white/50 text-sm leading-relaxed">
                  You are about to save and deploy <span className="text-white font-bold">"{activeFile.name}"</span>. 
                  By proceeding, you acknowledge that you are <span className="text-red-400 font-semibold underline decoration-red-400/30">solely responsible</span> for any financial outcomes resulting from the use of this strategy with real capital.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-3 items-start">
                <Shield size={16} className="text-[#FF6D1F] mt-0.5 shrink-0" />
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                  Ensure the strategy has been thoroughly backtested and validated against historical datasets before production use.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeployWarning(false)}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="bg-[#FF6D1F] hover:bg-[#e55d1a] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#FF6D1F]/20 active:scale-95"
              >
                I Understand, Save & Deploy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;