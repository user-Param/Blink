import { Plus, FileCode, Code, Book, X, FileText } from "lucide-react";
import type { FileType } from "../../types/editor";

type Props = {
  files: FileType[];
  setFiles: React.Dispatch<React.SetStateAction<FileType[]>>;
  activeFileId: string;
  setActiveFileId: (id: string) => void;
};

const Explorer = ({ files, setFiles, activeFileId, setActiveFileId }: Props) => {
  const addFile = (language: "cpp" | "python" | "ipynb") => {
    const id = Date.now().toString();
    const extension = language === "ipynb" ? "ipynb" : language === "cpp" ? "cpp" : "py";
    const name = `strategy_${files.length + 1}.${extension}`;
    const path = language === "ipynb" ? `research/${name}` : `engine/algos/${name}`;
    
    let content = "";
    if (language === "cpp") {
        content = `#include "algo.h"\n\nclass MyStrategy : public Algo {\npublic:\n    void onTick(const MarketData& md) override {\n        // Your optimized C++ logic here\n    }\n};`;
    } else if (language === "ipynb") {
        content = JSON.stringify([
            { id: "c1", type: "markdown", content: "# New Research\nDescribe your hypothesis here." },
            { id: "c2", type: "code", content: "# Start researching\nimport pandas as pd", output: "" }
        ]);
    } else {
        content = "# Python Strategy Implementation\nimport time\n\ndef main():\n    pass";
    }

    const newFile: FileType = { id, name, content, language, path };
    setFiles([...files, newFile]);
    setActiveFileId(id);
  };

  const deleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      <div className="p-3 border-b border-white/5 space-y-2">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">New Strategy</p>
        <div className="grid grid-cols-3 gap-1">
            <button 
                onClick={() => addFile("cpp")}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/50 transition-all group"
                title="New C++ Strategy"
            >
                <FileCode size={14} className="text-blue-400 mb-1" />
                <span className="text-[8px] font-bold text-white/40 group-hover:text-white transition-colors">C++</span>
            </button>
            <button 
                onClick={() => addFile("ipynb")}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-[#FF6D1F]/20 border border-white/5 hover:border-[#FF6D1F]/50 transition-all group"
                title="New Notebook"
            >
                <Book size={14} className="text-[#FF6D1F] mb-1" />
                <span className="text-[8px] font-bold text-white/40 group-hover:text-white transition-colors">NB</span>
            </button>
            <button 
                onClick={() => addFile("python")}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-green-500/20 border border-white/5 hover:border-green-500/50 transition-all group"
                title="New Python Script"
            >
                <Code size={14} className="text-green-400 mb-1" />
                <span className="text-[8px] font-bold text-white/40 group-hover:text-white transition-colors">PY</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-4 mb-2">Files</p>
        {files.map((file) => (
            <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all ${
                    activeFileId === file.id ? "bg-[#FF6D1F]/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {file.language === "cpp" ? <FileCode size={14} className="shrink-0 text-blue-400" /> : 
                     file.language === "ipynb" ? <Book size={14} className="shrink-0 text-[#FF6D1F]" /> : 
                     <Code size={14} className="shrink-0 text-green-400" />}
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[11px] font-medium truncate">{file.name}</span>
                        <span className="text-[8px] text-white/20 truncate">{file.path}</span>
                    </div>
                </div>
                <button 
                    onClick={(e) => deleteFile(e, file.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                >
                    <X size={12} />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Explorer;