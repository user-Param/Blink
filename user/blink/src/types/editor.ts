export type FileType = {
  id: string;
  name: string;
  content: string;
  language: "cpp" | "python" | "ipynb";
  path: string;
};