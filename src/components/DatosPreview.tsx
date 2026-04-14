import React, { useMemo, useEffect } from 'react';
import { useSqlVisualizer, evaluateWhere } from '../hooks/useSqlVisualizer';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
  useNodesState,
  type Node
} from '@xyflow/react';
// 1. AÑADIMOS LOS ICONOS DE LUCIDE AQUÍ
import { ZoomIn, ZoomOut, Maximize, ArrowUp, ArrowDown, Key } from 'lucide-react';
import '@xyflow/react/dist/style.css';

interface ColumnDef { name: string; }
interface TableData { tableName: string; columns: ColumnDef[]; rows: Record<string, any>[]; }
interface DatosPreviewProps { query: string; tables: TableData[]; }

const ControlesPersonalizados = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Panel position="bottom-left" className="flex flex-col gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 shadow-xl">
      <button onClick={() => zoomIn()} title="Acercar zoom" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><ZoomIn className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
      <button onClick={() => zoomOut()} title="Alejar zoom" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><ZoomOut className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
      <button onClick={() => fitView({ padding: 0.15, duration: 800 })} title="Centrar pizarra" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><Maximize className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
    </Panel>
  );
};

const DataNodeComponent = ({ data }: any) => {
  return <>{data.content}</>;
};

const nodeTypes = { dataNode: DataNodeComponent };

const sortRows = (rows: any[], orderBy: { column: string, direction: 'ASC'|'DESC' } | null, columnsKeys: string[]) => {
  if (!orderBy) return rows;
  const { column, direction } = orderBy;

  const rowKey = columnsKeys.find(c => c.toLowerCase().endsWith(column.toLowerCase())) || column;
  if (!columnsKeys.map(c=>c.toLowerCase()).includes(rowKey.toLowerCase())) return rows;

  return [...rows].sort((a, b) => {
    const valA = a[rowKey];
    const valB = b[rowKey];

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);
    const aNum = isNumeric(valA);
    const bNum = isNumeric(valB);

    let cmp = 0;
    if (aNum && bNum) {
      cmp = Number(valA) > Number(valB) ? 1 : -1;
    } else {
      cmp = String(valA).localeCompare(String(valB));
    }

    return direction === 'DESC' ? -cmp : cmp;
  });
};

export const DatosPreview: React.FC<DatosPreviewProps> = ({ query, tables }) => {
  const { activeTables, whereAST, joinDetails, selectedColumns, isSelectAll, orderBy } = useSqlVisualizer(query);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

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
        table.columns.forEach(col => { newRow[`${table.tableName}.${col.name}`] = row[col.name]; });
        return newRow;
      });

      const colKeys = table.columns.map(c => `${table.tableName}.${c.name}`);
      const sortedRows = sortRows(normalizedRows, orderBy, colKeys);

      return { ...table, normalizedRows: sortedRows };
    });
  }, [tables, orderBy]);

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

    const colKeys = mergedCols.map(c => `${c.tableOrigin}.${c.name}`);
    const sortedMergedRows = sortRows(mergedRows, orderBy, colKeys);

    return { tableName: `Resultado Fusión: ${joinDetails.type}`, columns: mergedCols, rows: sortedMergedRows };
  }, [joinDetails, normalizedTables, orderBy]);

  useEffect(() => {
    setNodes((oldNodes) => {
      const newNodes: Node[] = [];

      normalizedTables.forEach((table, index) => {
        const existingNode = oldNodes.find(n => n.id === `table-${table.tableName}`);
        const isTableActive = activeTables.length === 0 || activeTables.some(at => at.toLowerCase() === table.tableName.toLowerCase());
        const isTargetTable = activeTables.some(at => at.toLowerCase() === table.tableName.toLowerCase());

        const content = (
          <div className={`min-w-100 max-w-2xl bg-[#1e293b] rounded-lg border transition-all duration-300 ${isTableActive ? 'opacity-100' : 'opacity-60'} ${isTargetTable ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700'}`}>
            <div className={`border-b border-slate-700 p-2.5 flex items-center justify-between ${isTargetTable ? 'bg-blue-900/30' : 'bg-slate-800/80'}`}>
              <span className={`font-semibold text-xs tracking-wide ${isTargetTable ? 'text-blue-300' : 'text-slate-200'}`}>{table.tableName}</span>
              <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">Origen</span>
            </div>
            <div className="overflow-hidden p-1 bg-[#0f172a]/50 rounded-b-lg">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-[#0f172a]">
                  <tr>
                    {table.columns.map(col => {
                      const isKey = (joinDetails?.leftTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.leftColumn.toLowerCase() === col.name.toLowerCase()) ||
                                    (joinDetails?.rightTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.rightColumn.toLowerCase() === col.name.toLowerCase());
                      const isSel = isColumnSelected(col.name, table.tableName);

                      const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${table.tableName}.${col.name}`.toLowerCase());

                      // 2. RENDERIZAMOS LOS ICONOS DE LUCIDE EN LUGAR DE EMOJIS
                      const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-3 h-3 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-3 h-3 ml-1 inline-block text-yellow-400" />) : null;
                      const keyIcon = isKey ? <Key className="w-3 h-3 ml-1 inline-block text-fuchsia-400" /> : null;

                      return (
                        <th key={col.name} className={`p-2 font-medium border-b border-slate-800 truncate ${isKey ? 'text-fuchsia-400 bg-fuchsia-900/20' : isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isSel ? 'text-blue-300' : 'text-slate-400 opacity-80'}`}>
                          <div className="flex items-center">
                            {col.name} {keyIcon} {sortIcon}
                          </div>
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
                      <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/50 ${!isMatch && isTargetTable && !joinDetails ? 'opacity-40' : 'opacity-100'} ${isHighlighted ? 'border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}>
                        {table.columns.map((col, j) => {
                          const isKey = (joinDetails?.leftTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.leftColumn.toLowerCase() === col.name.toLowerCase()) ||
                                        (joinDetails?.rightTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.rightColumn.toLowerCase() === col.name.toLowerCase());
                          const isSel = isColumnSelected(col.name, table.tableName);
                          const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${table.tableName}.${col.name}`.toLowerCase());

                          const val = row[`${table.tableName}.${col.name}`];
                          return (
                            <td key={j} className={`p-2 truncate ${isKey ? 'text-fuchsia-300 bg-fuchsia-900/10 opacity-100 font-bold' : isSorted ? 'text-yellow-100 bg-yellow-900/10' : isSel ? (isHighlighted ? 'text-emerald-300 bg-emerald-900/10' : 'text-slate-200 opacity-100') : 'text-slate-400 opacity-80'}`}>
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

        newNodes.push({
          id: `table-${table.tableName}`,
          type: 'dataNode',
          position: existingNode ? existingNode.position : { x: (index % 2) * 450 + 50, y: Math.floor(index / 2) * 350 + 50 },
          data: { content }
        });
      });

      if (mergedTable) {
        const existingNode = oldNodes.find(n => n.id === `merged-table`);
        const content = (
          <div className="w-200 bg-[#1e293b] rounded-lg border border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] overflow-hidden flex flex-col">
             <div className="bg-fuchsia-900/30 border-b border-fuchsia-500/30 p-2.5 flex items-center justify-between">
                <span className="font-semibold text-fuchsia-300 text-xs tracking-wide uppercase">{mergedTable.tableName}</span>
                <span className="text-[9px] text-fuchsia-400 bg-fuchsia-950 px-2 py-0.5 rounded border border-fuchsia-800 animate-pulse">Tabla Virtual Generada</span>
             </div>
             <div className="overflow-hidden p-1 bg-[#0f172a]/50 rounded-b-lg">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      {mergedTable.columns.map((col, idx) => {
                        const isSel = isColumnSelected(col.name, col.tableOrigin);
                        const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${col.tableOrigin}.${col.name}`.toLowerCase());

                        // 3. RENDERIZAMOS ICONOS EN LA TABLA FUSIONADA TAMBIÉN
                        const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-3 h-3 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-3 h-3 ml-1 inline-block text-yellow-400" />) : null;

                        return (
                          <th key={idx} className={`p-2 font-medium border-b border-slate-800 truncate ${isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isSel ? 'text-blue-300' : 'text-slate-400 opacity-80'}`}>
                            <div className="flex items-center">
                              {col.tableOrigin}.{col.name} {sortIcon}
                            </div>
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
                        <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/50 ${!isMatch ? 'opacity-40' : 'opacity-100'} ${isNull ? 'bg-orange-900/10' : ''}`}>
                          {mergedTable.columns.map((col, j) => {
                             const isSel = isColumnSelected(col.name, col.tableOrigin);
                             const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${col.tableOrigin}.${col.name}`.toLowerCase());
                             const val = row[`${col.tableOrigin}.${col.name}`];
                             return (
                              <td key={j} className={`p-2 truncate ${isSorted ? 'text-yellow-100 bg-yellow-900/10' : isSel ? (val === 'NULL' ? 'text-orange-400 font-bold italic' : isMatch ? 'text-emerald-300 font-medium' : 'text-slate-200') : 'text-slate-400 opacity-80'}`}>
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

        newNodes.push({
          id: `merged-table`,
          type: 'dataNode',
          position: existingNode ? existingNode.position : { x: 50, y: Math.ceil(normalizedTables.length / 2) * 350 + 50 },
          data: { content }
        });
      }

      return newNodes;
    });
  }, [normalizedTables, mergedTable, activeTables, whereAST, joinDetails, selectedColumns, isSelectAll, orderBy]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        className="bg-[#0f172a] [&_.react-flow__attribution]:hidden"
      >
        <Background variant={BackgroundVariant.Dots} color="#334155" gap={24} size={1} style={{ backgroundColor: '#0f172a' }} />
        <ControlesPersonalizados />
      </ReactFlow>
    </div>
  );
};
