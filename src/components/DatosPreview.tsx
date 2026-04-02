import React from 'react';
import { useSqlVisualizer, evaluateWhere } from '../hooks/useSqlVisualizer';

interface ColumnDef {
  name: string;
}

interface TableData {
  tableName: string;
  columns: ColumnDef[];
  rows: Record<string, any>[];
}

interface DatosPreviewProps {
  query: string;
  tables: TableData[];
}

export const DatosPreview: React.FC<DatosPreviewProps> = ({ query, tables }) => {
  const { activeTables, whereAST } = useSqlVisualizer(query);

  return (
    <div className="flex flex-col gap-6 p-4 w-full h-full overflow-y-auto">
      {tables.map((table) => {
        const isTableActive = activeTables.length === 0 || activeTables.includes(table.tableName);
        const isTargetTable = activeTables.includes(table.tableName);

        const containerOpacity = isTableActive ? 'opacity-100' : 'opacity-40 grayscale';
        const containerBorder = isTargetTable ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-gray-700';

        return (
          <div key={table.tableName} className={`transition-all duration-300 border-2 rounded-xl bg-gray-900 overflow-hidden ${containerOpacity} ${containerBorder}`}>
            <div className={`p-3 border-b transition-colors duration-300 ${isTargetTable ? 'bg-blue-900/30 border-blue-500/50' : 'bg-gray-800 border-gray-700'}`}>
              <h3 className={`text-lg font-bold transition-colors duration-300 ${isTargetTable ? 'text-blue-400' : 'text-gray-300'}`}>
                {table.tableName}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    {table.columns.map((col) => (
                      <th key={col.name} className="p-3 text-gray-400 font-medium border-b border-gray-700">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, index) => {
                    const isRowMatch = isTableActive && evaluateWhere(row, whereAST);
                    const isHighlighted = isTargetTable && isRowMatch;

                    const rowBg = isHighlighted ? 'bg-green-900/20 text-green-300' : 'bg-transparent text-gray-300';
                    const rowBorder = isHighlighted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-transparent';
                    const dimRow = !isRowMatch && isTargetTable ? 'opacity-30' : 'opacity-100';

                    return (
                      <tr key={index} className={`border-b border-gray-800 transition-all duration-300 ${rowBg} ${rowBorder} ${dimRow}`}>
                        {table.columns.map((col) => (
                          <td key={col.name} className="p-3">
                            {row[col.name]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
