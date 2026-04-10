import React, { useMemo } from 'react';
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
  const { activeTables, whereAST, joinDetails, selectedColumns, isSelectAll } = useSqlVisualizer(query);

  const isColumnSelected = (colName: string, tableName: string) => {
    if (isSelectAll) return true;
    return selectedColumns.some(sc => {
      if (sc.column.toLowerCase() !== colName.toLowerCase()) return false;
      if (sc.table === null) {
        const tablesWithCol = tables.filter(t =>
          activeTables.map(at => at.toLowerCase()).includes(t.tableName.toLowerCase()) &&
          t.columns.some(c => c.name.toLowerCase() === colName.toLowerCase())
        );
        return tablesWithCol.length === 1 && tablesWithCol[0].tableName.toLowerCase() === tableName.toLowerCase();
      }
      return sc.table.toLowerCase() === tableName.toLowerCase();
    });
  };

  const normalizedTables = useMemo(() => {
    return tables.map(table => {
      const normalizedRows = table.rows.map(row => {
        const newRow: any = {};
        table.columns.forEach(col => {
          newRow[`${table.tableName}.${col.name}`] = row[col.name];
        });
        return newRow;
      });
      return { ...table, normalizedRows };
    });
  }, [tables]);

  const mergedTable = useMemo(() => {
    if (!joinDetails) return null;
    const leftData = normalizedTables.find(t => t.tableName.toLowerCase() === joinDetails.leftTable.toLowerCase());
    const rightData = normalizedTables.find(t => t.tableName.toLowerCase() === joinDetails.rightTable.toLowerCase());
    if (!leftData || !rightData) return null;

    const mergedRows: any[] = [];
    const mergedCols = [
      ...leftData.columns.map(c => ({ name: c.name, tableOrigin: joinDetails.leftTable })),
      ...rightData.columns.map(c => ({ name: c.name, tableOrigin: joinDetails.rightTable }))
    ];

    leftData.normalizedRows.forEach(lRow => {
      let matched = false;
      rightData.normalizedRows.forEach(rRow => {
        const leftVal = lRow[`${joinDetails.leftTable}.${joinDetails.leftColumn}`];
        const rightVal = rRow[`${joinDetails.rightTable}.${joinDetails.rightColumn}`];
        if (String(leftVal).toLowerCase() === String(rightVal).toLowerCase()) {
          matched = true;
          mergedRows.push({ ...lRow, ...rRow });
        }
      });
      if (!matched && joinDetails.type.toUpperCase().includes('LEFT JOIN')) {
        const nullRightRow: any = {};
        rightData.columns.forEach(c => { nullRightRow[`${joinDetails.rightTable}.${c.name}`] = 'NULL'; });
        mergedRows.push({ ...lRow, ...nullRightRow });
      }
    });

    return { tableName: `Resultado Fusión: ${joinDetails.type}`, columns: mergedCols, rows: mergedRows };
  }, [joinDetails, normalizedTables]);

  return (
    <div className="flex flex-col gap-8 w-full pb-16 h-full overflow-y-auto">
      <div className="flex flex-wrap gap-6 justify-center items-start shrink-0">
        {normalizedTables.map((table) => {
          const isTableActive = activeTables.length === 0 || activeTables.some(at => at.toLowerCase() === table.tableName.toLowerCase());
          const isTargetTable = activeTables.some(at => at.toLowerCase() === table.tableName.toLowerCase());

          return (
            <div key={table.tableName} className={`max-w-md bg-[#1e293b] rounded-lg border transition-all duration-300 ${isTableActive ? 'opacity-100' : 'opacity-30 grayscale'} ${isTargetTable ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700'}`}>
              <div className={`border-b border-slate-700 p-2.5 flex items-center justify-between ${isTargetTable ? 'bg-blue-900/30' : 'bg-slate-800/80'}`}>
                <span className={`font-semibold text-xs tracking-wide ${isTargetTable ? 'text-blue-300' : 'text-slate-200'}`}>{table.tableName}</span>
                <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">Origen</span>
              </div>
              <div className="overflow-x-auto p-1">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      {table.columns.map(col => {
                        const isKey = (joinDetails?.leftTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.leftColumn.toLowerCase() === col.name.toLowerCase()) ||
                                      (joinDetails?.rightTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.rightColumn.toLowerCase() === col.name.toLowerCase());
                        const isSel = isColumnSelected(col.name, table.tableName);
                        return (
                          <th key={col.name} className={`p-2 font-medium border-b border-slate-800 whitespace-nowrap ${isKey ? 'text-fuchsia-400 bg-fuchsia-900/20' : isSel ? 'text-blue-300' : 'text-slate-500 opacity-40'}`}>
                            {col.name} {isKey && '🔑'}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {table.normalizedRows.map((row, i) => {
                      const isMatch = evaluateWhere(row, whereAST);
                      const isHighlighted = isTargetTable && isMatch && !joinDetails;
                      return (
                        <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/50 ${!isMatch && isTargetTable && !joinDetails ? 'opacity-30' : 'opacity-100'} ${isHighlighted ? 'border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}>
                          {table.columns.map((col, j) => {
                            const isKey = (joinDetails?.leftTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.leftColumn.toLowerCase() === col.name.toLowerCase()) ||
                                          (joinDetails?.rightTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.rightColumn.toLowerCase() === col.name.toLowerCase());
                            const isSel = isColumnSelected(col.name, table.tableName);
                            const val = row[`${table.tableName}.${col.name}`];
                            return (
                              <td key={j} className={`p-2 truncate max-w-32 ${isKey ? 'text-fuchsia-300 bg-fuchsia-900/10 opacity-100 font-bold' : isSel ? (isHighlighted ? 'text-emerald-300 bg-emerald-900/10' : 'text-slate-200 opacity-100') : 'text-slate-500 opacity-30'}`}>
                                {String(val)}
                              </td>
                            );
                          })}
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

      {mergedTable && (
        <div className="flex justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500 shrink-0 mt-4">
          <div className="w-full max-w-4xl bg-[#1e293b] rounded-lg border border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] overflow-hidden flex flex-col">
             <div className="bg-fuchsia-900/30 border-b border-fuchsia-500/30 p-2.5 flex items-center justify-between">
                <span className="font-semibold text-fuchsia-300 text-xs tracking-wide uppercase">{mergedTable.tableName}</span>
                <span className="text-[9px] text-fuchsia-400 bg-fuchsia-950 px-2 py-0.5 rounded border border-fuchsia-800 animate-pulse">Tabla Virtual Generada</span>
             </div>
             <div className="overflow-x-auto p-1">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      {mergedTable.columns.map((col, idx) => {
                        const isSel = isColumnSelected(col.name, col.tableOrigin);
                        return (
                          <th key={idx} className={`p-2 font-medium border-b border-slate-800 whitespace-nowrap ${isSel ? 'text-blue-300' : 'text-slate-500 opacity-40'}`}>
                            {col.tableOrigin}.{col.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {mergedTable.rows.map((row, i) => {
                      const isMatch = evaluateWhere(row, whereAST);
                      const isNull = Object.values(row).includes('NULL');
                      return (
                        <tr key={i} className={`transition-all duration-300 ${!isMatch ? 'opacity-30' : 'opacity-100'} ${isNull ? 'bg-orange-900/10' : ''}`}>
                          {mergedTable.columns.map((col, j) => {
                             const isSel = isColumnSelected(col.name, col.tableOrigin);
                             const val = row[`${col.tableOrigin}.${col.name}`];
                             return (
                              <td key={j} className={`p-2 truncate max-w-32 ${isSel ? (val === 'NULL' ? 'text-orange-400 font-bold italic' : isMatch ? 'text-emerald-300 font-medium' : 'text-slate-200') : 'text-slate-500 opacity-30'}`}>
                                {String(val)}
                              </td>
                             );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
