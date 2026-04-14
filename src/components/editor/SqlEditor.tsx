import Editor from '@monaco-editor/react';

export interface Props {
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export const SqlEditor = ({ value, onChange }: Props) => {
  return (
    <div className="flex-1 h-full overflow-hidden border border-slate-700 rounded-lg shadow-2xl">
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          padding: { top: 20 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: "'Fira Code', monospace",
          cursorSmoothCaretAnimation: "on"
        }}
      />
    </div>
  );
};
