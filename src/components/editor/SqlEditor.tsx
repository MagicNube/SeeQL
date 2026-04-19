import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

export interface Props {
  value?: string;
  onChange?: (value: string | undefined) => void;
  estructura?: Record<string, { name: string; type: string; isPk?: boolean }[]>;
}

export const SqlEditor = ({ value, onChange, estructura = {} }: Props) => {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    const provider = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'SET', 'DELETE',
          'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'AS',
          'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
          'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN', 'LIKE',
          'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC'
        ];

        const keywordSuggestions = keywords.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range: range,
        }));

        const tables = Object.keys(estructura);
        const tableSuggestions = tables.map((tableName) => ({
          label: tableName,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: tableName,
          detail: 'Tabla',
          range: range,
        }));

        const columnSuggestions: any[] = [];
        const addedColumns = new Set<string>();

        tables.forEach(tableName => {
          estructura[tableName].forEach(col => {
            if (!addedColumns.has(col.name)) {
              addedColumns.add(col.name);
              columnSuggestions.push({
                label: col.name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: col.name,
                detail: `Columna (${col.type})`,
                range: range,
              });
            }
          });
        });

        return { suggestions: [...keywordSuggestions, ...tableSuggestions, ...columnSuggestions] };
      },
    });

    return () => {
      provider.dispose();
    };
  }, [monaco, estructura]);

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
          cursorSmoothCaretAnimation: "on",
          quickSuggestions: true,
          quickSuggestionsDelay: 10,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          wordBasedSuggestions: "off"
        }}
      />
    </div>
  );
};
