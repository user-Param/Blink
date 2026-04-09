import { useState, useEffect } from "react";
import Explorer from "../components/editor/explorer";
import TerminalUI  from "../components/editor/terminal";
import EditorMain from "../components/editor/editor-main";
import { useWebSocket } from "../hooks/useWebSocket";
import type { FileType } from "../types/editor";







const Editor = () => {
    const { isConnected, marketData, subscribe } = useWebSocket();

    const [files, setFiles] = useState<FileType[]>([
    { id: "1", 
    name: "strategy1.py", 
    content: "print('Hello Strategy')", 
    language: "python", 
    path: "engine/algos/strategy1.py"  },
    ]);

    const [activeFile, setActiveFile] = useState<FileType>(files[0]);
    const [output, setOutput] = useState("");

    useEffect(() => {
        subscribe("price_");
        subscribe("bid_");
        subscribe("ask_");
    }, [subscribe]);

    const updateFileContent = (content: string) => {
    const updated = files.map((f) =>
      f.name === activeFile.name ? { ...f, content } : f
    );
    setFiles(updated);
    setActiveFile({ ...activeFile, content });
  };

    const runCode = async () => {
  try {
    const res = await fetch("http://localhost:5000/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: activeFile.content }),
    });

    const data = await res.text();
    setOutput(data);
  } catch (err) {
    setOutput("Error running code: " + (err as Error).message);
  }
};

    return(
        <>
            <div className="flex h-screen bg-[#1e1e1e]">
                <div className="h-[100%] w-[13%] border-r border-white/10">
                    <Explorer
                    files={files}
                    setFiles={setFiles}
                    setActiveFile={setActiveFile}
                    />
                </div>
                <div className="flex flex-col h-[100%] w-[65%]">
                    <div className=" p-2 flex justify-end border-b border-white/10">
                        <button 
                            onClick={runCode}
                            className="bg-[#FF6D1F] hover:bg-[#0062a3] text-white px-2 py-1 rounded text-[6px] transition-colors"
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
                <div className="h-[100%] w-[22%] border-l border-white/10 bg-black flex flex-col">
                    <div className="p-2 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span className="text-white/50 text-xs">{isConnected ? "Connected" : "Disconnected"}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className="text-white">P: <span className="font-bold">{marketData?.price?.toFixed(2) || "--"}</span></span>
                            <span className="text-green-400">B: <span className="font-bold">{marketData?.bid?.toFixed(2) || "--"}</span></span>
                            <span className="text-red-400">A: <span className="font-bold">{marketData?.ask?.toFixed(2) || "--"}</span></span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <TerminalUI output={output}/>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Editor;