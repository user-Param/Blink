import Editor from "@monaco-editor/react";

type Props = {
  activeFile: any;
  updateFileContent: (content: string) => void;
};

const EditorMain = ({ activeFile, updateFileContent }: Props) => {
  return (
    <div className="w-[100%]">
      <Editor
        height="100vh"
        theme="vs-dark"
        language="python"
        value={activeFile?.content}
        onChange={(value) => updateFileContent(value || "")}
      />
    </div>
  );
};

export default EditorMain;