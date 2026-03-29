type FileType = {
  name: string;
  content: string;
};

type Props = {
  files: FileType[];
  setFiles: (files: FileType[]) => void;
  setActiveFile: (file: FileType) => void;
};

const Explorer = ({ files, setFiles, setActiveFile }: Props) => {
  const addFile = () => {
    const newFile = {
      name: `file${files.length + 1}.py`,
      content: "# new file",
    };
    setFiles([...files, newFile]);
  };

  const deleteFile = (name: string) => {
    setFiles(files.filter(f => f.name !== name));
  };

  return (
    <div className="w-[100%] bg-[#1e1e1e] text-white p-2">
      <button onClick={addFile} className="mb-2 text-[8px]">+ New File</button>

      {files.map((file) => (
        <div
          key={file.name}
          className="flex justify-between text-[8px] cursor-pointer hover:bg-white/10 p-1"
          onClick={() => setActiveFile(file)}
        >
          <span>{file.name}</span>
          <button onClick={() => deleteFile(file.name)}>x</button>
        </div>
      ))}
    </div>
  );
};

export default Explorer;