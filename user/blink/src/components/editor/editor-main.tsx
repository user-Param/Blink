import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import type { FileType } from "../../types/editor";
import { Play, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  activeFile: FileType;
  updateFileContent: (content: string) => void;
};

type NotebookCell = {
    id: string;
    type: "code" | "markdown";
    content: string;
    output?: string;
};

const EditorMain = ({ activeFile, updateFileContent }: Props) => {
  // Logic for .ipynb files
  const [cells, setCells] = useState<NotebookCell[]>([]);

  useEffect(() => {
    if (activeFile.language === "ipynb") {
        try {
            setCells(JSON.parse(activeFile.content));
        } catch (e) {
            setCells([]);
        }
    }
  }, [activeFile.id, activeFile.language]);

  const updateCell = (id: string, content: string) => {
    const newCells = cells.map(c => c.id === id ? { ...c, content } : c);
    setCells(newCells);
    updateFileContent(JSON.stringify(newCells));
  };

  const addCell = (type: "code" | "markdown") => {
    const newCell: NotebookCell = {
        id: Date.now().toString(),
        type,
        content: type === "code" ? "# New code cell" : "### New Section",
        output: ""
    };
    const newCells = [...cells, newCell];
    setCells(newCells);
    updateFileContent(JSON.stringify(newCells));
  };

  const deleteCell = (id: string) => {
    const newCells = cells.filter(c => c.id !== id);
    setCells(newCells);
    updateFileContent(JSON.stringify(newCells));
  };

  const runCell = (id: string) => {
    const newCells = cells.map(c => {
        if (c.id === id && c.type === "code") {
            return { ...c, output: `[EXECUTION ${new Date().toLocaleTimeString()}]: Cell executed successfully.\nResult: DataFrame head visualized.` };
        }
        return c;
    });
    setCells(newCells);
    updateFileContent(JSON.stringify(newCells));
  };

  if (activeFile.language === "ipynb") {
    return (
        <div className="h-full overflow-y-auto p-8 bg-[#0a0a0a] space-y-6">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {cells.map((cell, index) => (
                    <div key={cell.id} className="group relative">
                        <div className="absolute -left-12 top-0 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-white/20">[{index + 1}]</span>
                            {cell.type === "code" && (
                                <button 
                                    onClick={() => runCell(cell.id)}
                                    className="p-1.5 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all"
                                >
                                    <Play size={12} fill="currentColor" />
                                </button>
                            )}
                            <button 
                                onClick={() => deleteCell(cell.id)}
                                className="p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                        
                        <div className={`rounded-xl border transition-all ${cell.type === "code" ? "bg-[#0d0d0d] border-white/5 focus-within:border-[#FF6D1F]/50" : "bg-transparent border-transparent"}`}>
                            {cell.type === "markdown" ? (
                                <textarea
                                    className="w-full bg-transparent p-4 text-white/80 resize-none focus:outline-none min-h-[40px] text-lg font-medium"
                                    value={cell.content}
                                    onChange={(e) => updateCell(cell.id, e.target.value)}
                                    placeholder="Write markdown here..."
                                    rows={cell.content.split('\n').length}
                                />
                            ) : (
                                <div className="p-0 overflow-hidden rounded-xl">
                                    <Editor
                                        height={`${Math.max(100, cell.content.split('\n').length * 20 + 40)}px`}
                                        theme="vs-dark"
                                        language="python"
                                        value={cell.content}
                                        options={{
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            fontSize: 13,
                                            lineNumbers: "on",
                                            folding: false,
                                            glyphMargin: false,
                                            lineDecorationsWidth: 0,
                                            lineNumbersMinChars: 3,
                                            automaticLayout: true
                                        }}
                                        onChange={(val) => updateCell(cell.id, val || "")}
                                    />
                                    {cell.output && (
                                        <div className="p-4 bg-black/40 border-t border-white/5 font-mono text-[11px] text-white/40 whitespace-pre-wrap">
                                            {cell.output}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex items-center justify-center gap-4 py-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => addCell("code")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-[#FF6D1F]/10 hover:border-[#FF6D1F]/50 text-xs font-bold transition-all"
                    >
                        <Plus size={14} /> Add Code Cell
                    </button>
                    <button 
                        onClick={() => addCell("markdown")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 text-xs font-bold transition-all"
                    >
                        <Plus size={14} /> Add Markdown Cell
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        theme="vs-dark"
        language={activeFile.language === "cpp" ? "cpp" : "python"}
        value={activeFile.content}
        options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            automaticLayout: true,
            padding: { top: 20 }
        }}
        onChange={(value) => updateFileContent(value || "")}
      />
    </div>
  );
};

export default EditorMain;