import { useState } from "react";
import Explorer from "../components/editor/explorer";
import TerminalUI  from "../components/editor/terminal";
import EditorMain from "../components/editor/editor-main";


type FileType = {
  name: string;
  content: string;
};


const Editor = () => {
    const [files, setFiles] = useState<FileType[]>([
    { name: "strategy1.py", content: "print('Hello Strategy')" },
    ]);

    const [activeFile, setActiveFile] = useState<FileType>(files[0]);
    const [output, setOutput] = useState("");

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
    setOutput("Error running code: " + err.message);
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
                <div className="h-[100%] w-[22%] border-l border-white/10 bg-black">
                    <TerminalUI output={output}/>
                </div>
            </div>
        </>
    )
}
export default Editor;