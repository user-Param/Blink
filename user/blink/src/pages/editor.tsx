import { useState, useEffect } from "react";
import Explorer from "../components/editor/explorer";
import TerminalUI from "../components/editor/terminal";
import EditorMain from "../components/editor/editor-main";
import { useWebSocket } from "../hooks/useWebSocket";
import { Folder, Save, Play, Code, FileCode, Book, Info } from "lucide-react";
import type { FileType } from "../types/editor";

const Editor = () => {
    const { isConnected, marketData, subscribe } = useWebSocket();
    const [output, setOutput] = useState("");
    
    const [files, setFiles] = useState<FileType[]>([
        { 
            id: "1", 
            name: "initial_research.ipynb", 
            language: "ipynb", 
            path: "research/initial_research.ipynb",
            content: JSON.stringify([
                { id: "c1", type: "markdown", content: "# Market Analysis\nResearching BTC price patterns." },
                { id: "c2", type: "code", content: "import pandas as pd\ndf = pd.read_csv('bitcoin_final.csv')\ndf.head()", output: "   timestamp      price\n0  1711843200  65420.5\n1  1711843260  65421.2" }
            ])
        }
    ]);

    const [activeFileId, setActiveFileId] = useState<string>(files[0].id);
    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    useEffect(() => {
        subscribe("price_");
        subscribe("bid_");
        subscribe("ask_");
    }, [subscribe]);

    const updateFileContent = (content: string) => {
        setFiles(prev => prev.map(f => 
            f.id === activeFileId ? { ...f, content } : f
        ));
    };

    const handleSave = () => {
        const file = activeFile;
        console.log(`Saving ${file.name} to ${file.path}`);
        setOutput(`[SYSTEM]: File saved successfully to ${file.path}\n`);
    };

    const runCode = async () => {
        setOutput(prev => prev + `[RUNNING]: ${activeFile.name}...\n`);
        
        // Simulating execution
        setTimeout(() => {
            if (activeFile.language === "cpp") {
                setOutput(prev => prev + "[SUCCESS]: Compilation successful. Execution time: 0.12ms\n[OUTPUT]: Strategy initialized.\n");
            } else {
                setOutput(prev => prev + "[OUTPUT]: Research cell executed. Data visualization updated.\n");
            }
        }, 800);
    };

    return (
        <div className="flex h-full bg-[#0a0a0a] overflow-hidden text-white">
            {/* Left: Explorer */}
            <div className="w-64 border-r border-white/10 flex flex-col bg-[#0d0d0d]">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Folder size={16} className="text-[#FF6D1F]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Explorer</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Explorer
                        files={files}
                        setFiles={setFiles}
                        activeFileId={activeFileId}
                        setActiveFileId={setActiveFileId}
                    />
                </div>
            </div>

            {/* Middle: Editor */}
            <div className="flex-1 flex flex-col bg-[#0f0f0f]">
                {/* Editor Header */}
                <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#111]">
                    <div className="flex items-center gap-3">
                        {activeFile.language === "cpp" ? <FileCode size={16} className="text-blue-400" /> : 
                         activeFile.language === "ipynb" ? <Book size={16} className="text-[#FF6D1F]" /> : 
                         <Code size={16} className="text-green-400" />}
                        <span className="text-xs font-mono text-white/80">{activeFile.path}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleSave}
                            className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors title='Save'"
                        >
                            <Save size={16} />
                        </button>
                        <button 
                            onClick={runCode}
                            className="flex items-center gap-2 bg-[#FF6D1F] hover:bg-[#e55d1a] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-[#FF6D1F]/10"
                        >
                            <Play size={14} fill="currentColor" /> RUN STRATEGY
                        </button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-hidden relative">
                    <EditorMain
                        activeFile={activeFile}
                        updateFileContent={updateFileContent}
                    />
                </div>
            </div>

            {/* Right: Terminal & Info */}
            <div className="w-80 border-l border-white/10 flex flex-col bg-[#0d0d0d]">
                {/* Connection Status */}
                <div className="p-4 border-b border-white/10 bg-[#111]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"}`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{isConnected ? "Connected" : "Offline"}</span>
                        </div>
                        <Info size={14} className="text-white/20" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                            <p className="text-[8px] text-white/20 font-bold uppercase mb-1">Price</p>
                            <p className="text-[11px] font-mono font-bold text-white">{marketData?.price?.toFixed(1) || "--"}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                            <p className="text-[8px] text-white/20 font-bold uppercase mb-1">Bid</p>
                            <p className="text-[11px] font-mono font-bold text-green-400">{marketData?.bid?.toFixed(1) || "--"}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                            <p className="text-[8px] text-white/20 font-bold uppercase mb-1">Ask</p>
                            <p className="text-[11px] font-mono font-bold text-red-400">{marketData?.ask?.toFixed(1) || "--"}</p>
                        </div>
                    </div>
                </div>

                {/* Terminal */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-white/10 bg-[#151515] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Execution Output</span>
                        <button onClick={() => setOutput("")} className="text-[10px] text-white/20 hover:text-white transition-colors">Clear</button>
                    </div>
                    <div className="flex-1 bg-black p-0">
                        <TerminalUI output={output} />
                    </div>
                </div>

                {/* Strategy Helper */}
                <div className="p-4 border-t border-white/10 bg-[#111]">
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Research Tips</h4>
                    <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-[11px] text-blue-400/80 leading-relaxed">
                                Use <span className="text-blue-400 font-mono">.ipynb</span> for data visualization and backtest analysis before implementing in C++.
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FF6D1F]/5 border border-[#FF6D1F]/10">
                            <p className="text-[11px] text-[#FF6D1F]/80 leading-relaxed">
                                C++ strategies in <span className="text-[#FF6D1F] font-mono">engine/algos</span> are automatically hot-reloaded by the execution engine.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editor;