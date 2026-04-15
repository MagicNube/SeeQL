import React, { useMemo, useEffect } from 'react';
import { useSqlVisualizer, evaluateWhere } from '../hooks/useSqlVisualizer';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge
} from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, ArrowUp, ArrowDown, Key, Layers } from 'lucide-react';
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
      <button onClick={() => fitView({ padding: 0.2, duration: 800 })} title="Centrar pizarra" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><Maximize className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
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
    const valA = a[rowKey]; const valB = b[rowKey];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);
    const aNum = isNumeric(valA); const bNum = isNumeric(valB);
    let cmp = 0;
    if (aNum && bNum) cmp = Number(valA) > Number(valB) ? 1 : -1;
    else cmp = String(valA).localeCompare(String(valB));
    return direction === 'DESC' ? -cmp : cmp;
  });
};

export const DatosPreview: React.FC<DatosPreviewProps> = ({ query, tables }) => {
  // EXTRAEMOS EL NUEVO LÍMITE DEL HOOK
  const { activeTables, whereAST, joinDetails, selectedColumns, isSelectAll, orderBy, groupBy, aggregations, havingAST, limit } = useSqlVisualizer(query);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const isColumnSelected = (colName: string, tableName: string) => {
    if (isSelectAll) return true;
    return selectedColumns.some(sc => {
      if (sc.column.toLowerCase() !== colName.toLowerCase()) return false;
      if (sc.table === null) {
        const tablesWithCol = tables.filter(t => activeTables.map(at => at.toLowerCase()).includes(t.tableName.toLowerCase()) && t.columns.some(c => c.name.toLowerCase() === colName.toLowerCase()));
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
        if (String(lRow[`${joinDetails.leftTable}.${joinDetails.leftColumn}`]).toLowerCase() === String(rRow[`${joinDetails.rightTable}.${joinDetails.rightColumn}`]).toLowerCase()) {
          matched = true; mergedRows.push({ ...lRow, ...rRow });
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

  const groupedTable = useMemo(() => {
    if (groupBy.length === 0 && aggregations.length === 0) return null;
    const baseData = mergedTable ? mergedTable.rows : (activeTables.length > 0 ? normalizedTables.find(t => t.tableName.toLowerCase() === activeTables[0].toLowerCase())?.normalizedRows : null);
    if (!baseData || baseData.length === 0) return null;

    const groups: Record<string, any[]> = {};
    baseData.forEach(row => {
      let key = 'all';
      if (groupBy.length > 0) key = groupBy.map(col => {
          const matchedKey = Object.keys(row).find(k => k.toLowerCase().endsWith(col.toLowerCase())) || col;
          return row[matchedKey];
      }).join('-');
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    const groupedRows: any[] = [];
    Object.entries(groups).forEach(([key, groupRows]) => {
       const newRow: any = {};
       if (groupBy.length > 0) groupBy.forEach(col => {
           const matchedKey = Object.keys(groupRows[0]).find(k => k.toLowerCase().endsWith(col.toLowerCase())) || col;
           newRow[col] = groupRows[0][matchedKey];
       });
       aggregations.forEach(agg => {
           const colMatch = agg.column !== '*' ? (Object.keys(groupRows[0]).find(k => k.toLowerCase().endsWith(agg.column.toLowerCase())) || agg.column) : '*';
           let result = 0;
           if (agg.func === 'COUNT') result = agg.column === '*' ? groupRows.length : groupRows.filter(r => r[colMatch] !== null && r[colMatch] !== 'NULL').length;
           else if (agg.func === 'SUM') result = groupRows.reduce((acc, r) => acc + (Number(r[colMatch]) || 0), 0);
           else if (agg.func === 'AVG') {
               const sum = groupRows.reduce((acc, r) => acc + (Number(r[colMatch]) || 0), 0);
               result = groupRows.length ? sum / groupRows.length : 0;
           }
           else if (agg.func === 'MAX') result = Math.max(...groupRows.map(r => Number(r[colMatch]) || -Infinity));
           else if (agg.func === 'MIN') result = Math.min(...groupRows.map(r => Number(r[colMatch]) || Infinity));

           newRow[agg.raw] = typeof result === 'number' && !Number.isInteger(result) ? Number(result.toFixed(2)) : result;
       });
       groupedRows.push(newRow);
    });

    const groupCols: {name: string, type: 'Grupo' | 'Agregacion'}[] = [];
    groupBy.forEach(col => groupCols.push({ name: col, type: 'Grupo' }));
    aggregations.forEach(agg => groupCols.push({ name: agg.raw, type: 'Agregacion' }));

    return { tableName: 'Resultado Agrupación', columns: groupCols, rows: sortRows(groupedRows, orderBy, groupCols.map(c => c.name)) };
  }, [groupBy, aggregations, mergedTable, normalizedTables, activeTables, orderBy]);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // 1. Posicionar Tablas Origen
    normalizedTables.forEach((table, index) => {
      const isTargetTable = activeTables.some(at => at.toLowerCase() === table.tableName.toLowerCase());

      const content = (
        <div className={`min-w-100 max-w-2xl bg-[#1e293b] rounded-lg border transition-all duration-300 ${isTargetTable ? 'border-blue-500 shadow-xl' : 'border-slate-700 opacity-60'}`}>
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
                    const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-3 h-3 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-3 h-3 ml-1 inline-block text-yellow-400" />) : null;
                    const keyIcon = isKey ? <Key className="w-3 h-3 ml-1 inline-block text-fuchsia-400" /> : null;

                    return (
                      <th key={col.name} className={`p-2 font-medium border-b border-slate-800 truncate ${isKey ? 'text-fuchsia-400 bg-fuchsia-900/20' : isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isSel ? 'text-blue-300' : 'text-slate-400 opacity-80'}`}>
                        <div className="flex items-center">{col.name} {keyIcon} {sortIcon}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(() => {
                  let matchCount = 0;
                  return table.normalizedRows.map((row, i) => {
                    const isMatch = evaluateWhere(row, whereAST);

                    let withinLimit = true;
                    if (isMatch && isTargetTable && !joinDetails && !groupedTable) {
                        matchCount++;
                        if (limit !== null && matchCount > limit) {
                            withinLimit = false;
                        }
                    }

                    const isHighlighted = isTargetTable && isMatch && withinLimit && !joinDetails && !groupedTable;
                    const isFaded = isTargetTable && (!isMatch || !withinLimit) && !joinDetails && !groupedTable;

                    return (
                      <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/50 ${isFaded ? 'opacity-40' : 'opacity-100'} ${isHighlighted ? 'border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}>
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
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      );

      newNodes.push({ id: `table-${table.tableName}`, type: 'dataNode', position: { x: index * 450, y: 0 }, data: { content } });
    });

    // 2. Posicionar Tabla Merged (JOIN)
    if (mergedTable && joinDetails) {
      const parentLeft = newNodes.find(n => n.id === `table-${joinDetails.leftTable}`);
      const parentRight = newNodes.find(n => n.id === `table-${joinDetails.rightTable}`);
      const posX = ((parentLeft?.position.x || 0) + (parentRight?.position.x || 0)) / 2;
      const posY = 400;

      const content = (
        <div className="w-200 bg-[#1e293b] rounded-lg border border-fuchsia-500 shadow-2xl overflow-hidden">
           <div className="bg-fuchsia-900/30 border-b border-fuchsia-500/30 p-2.5 flex items-center justify-between">
              <span className="font-semibold text-fuchsia-300 text-xs tracking-wide uppercase">{mergedTable.tableName}</span>
              <span className="text-[9px] text-fuchsia-400 bg-fuchsia-950 px-2 py-0.5 rounded border border-fuchsia-800 animate-pulse">JOIN Activo</span>
           </div>
           <div className="overflow-hidden p-1 bg-[#0f172a]/50 rounded-b-lg">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-[#0f172a]">
                  <tr>
                    {mergedTable.columns.map((col, idx) => {
                      const isSel = isColumnSelected(col.name, col.tableOrigin);
                      const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${col.tableOrigin}.${col.name}`.toLowerCase());
                      const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-3 h-3 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-3 h-3 ml-1 inline-block text-yellow-400" />) : null;

                      return (
                        <th key={idx} className={`p-2 font-medium border-b border-slate-800 truncate ${isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isSel ? 'text-blue-300' : 'text-slate-400 opacity-80'}`}>
                          <div className="flex items-center">{col.tableOrigin}.{col.name} {sortIcon}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(() => {
                    let matchCount = 0;
                    return mergedTable.rows.map((row, i) => {
                      const isMatch = evaluateWhere(row, whereAST);
                      const isNull = Object.values(row).includes('NULL');

                      let withinLimit = true;
                      if (isMatch && !groupedTable) {
                          matchCount++;
                          if (limit !== null && matchCount > limit) {
                              withinLimit = false;
                          }
                      }

                      const isHighlighted = isMatch && withinLimit && !groupedTable;
                      const isFaded = (!isMatch || !withinLimit) && !groupedTable;

                      return (
                        <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/50 ${isFaded ? 'opacity-40' : 'opacity-100'} ${isNull ? 'bg-orange-900/10' : ''}`}>
                          {mergedTable.columns.map((col, j) => {
                             const isSel = isColumnSelected(col.name, col.tableOrigin);
                             const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${col.tableOrigin}.${col.name}`.toLowerCase());
                             const val = row[`${col.tableOrigin}.${col.name}`];
                             return (
                              <td key={j} className={`p-2 truncate ${isSorted ? 'text-yellow-100 bg-yellow-900/10' : isSel ? (val === 'NULL' ? 'text-orange-400 font-bold italic' : isHighlighted ? 'text-emerald-300 font-medium' : 'text-slate-200') : 'text-slate-400 opacity-80'}`}>
                                {String(val)}
                              </td>
                             );
                          })}
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
           </div>
        </div>
      );

      newNodes.push({ id: 'merged-table', type: 'dataNode', position: { x: posX, y: posY }, data: { content } });

      newEdges.push(
        { id: 'e-left-merge', source: `table-${joinDetails.leftTable}`, target: 'merged-table', animated: true, style: { stroke: '#d946ef', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#d946ef' } },
        { id: 'e-right-merge', source: `table-${joinDetails.rightTable}`, target: 'merged-table', animated: true, style: { stroke: '#d946ef', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#d946ef' } }
      );
    }

    // 3. Posicionar Tabla Grouped
    if (groupedTable) {
      const sourceNodeId = mergedTable ? 'merged-table' : `table-${activeTables[0]}`;
      const sourceNode = newNodes.find(n => n.id === sourceNodeId);
      const posX = (sourceNode?.position.x || 0);
      const posY = (sourceNode?.position.y || 0) + 400;

      const content = (
        <div className="min-w-100 bg-[#1e293b] rounded-lg border border-orange-500 shadow-2xl overflow-hidden">
           <div className="bg-orange-900/30 border-b border-orange-500/30 p-2.5 flex items-center justify-between">
              <span className="font-semibold text-orange-300 text-xs tracking-wide uppercase flex items-center gap-2"><Layers className="w-4 h-4"/> {groupedTable.tableName}</span>
              <span className="text-[9px] text-orange-400 bg-orange-950 px-2 py-0.5 rounded border border-orange-800 animate-pulse">Agrupación</span>
           </div>
           <div className="overflow-hidden p-1 bg-[#0f172a]/50 rounded-b-lg">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-[#0f172a]">
                  <tr>
                    {groupedTable.columns.map((col, idx) => {
                      const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase());
                      const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-3 h-3 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-3 h-3 ml-1 inline-block text-yellow-400" />) : null;
                      const isAgg = col.type === 'Agregacion';

                      return (
                        <th key={idx} className={`p-2 font-medium border-b border-slate-800 truncate ${isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isAgg ? 'text-orange-300' : 'text-blue-300'}`}>
                          <div className="flex items-center">{col.name} {sortIcon}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(() => {
                    let matchCount = 0;
                    return groupedTable.rows.map((row, i) => {
                      const isMatch = evaluateWhere(row, havingAST);

                      let withinLimit = true;
                      if (isMatch) {
                          matchCount++;
                          if (limit !== null && matchCount > limit) {
                              withinLimit = false;
                          }
                      }

                      const isHighlighted = isMatch && havingAST && withinLimit;
                      const isFaded = (havingAST && !isMatch) || (!withinLimit);

                      return (
                        <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/50 ${isFaded ? 'opacity-40' : 'opacity-100'} ${isHighlighted ? 'border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}>
                          {groupedTable.columns.map((col, j) => {
                             const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase());
                             const isAgg = col.type === 'Agregacion';
                             const val = row[col.name];
                             return (
                              <td key={j} className={`p-2 truncate ${isSorted ? 'text-yellow-100 bg-yellow-900/10' : isAgg ? 'text-orange-200 font-mono font-bold' : 'text-slate-200'}`}>
                                {String(val)}
                              </td>
                             );
                          })}
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
           </div>
        </div>
      );

      newNodes.push({ id: 'grouped-table', type: 'dataNode', position: { x: posX, y: posY }, data: { content } });

      newEdges.push({
        id: 'e-aggr', source: sourceNodeId, target: 'grouped-table', animated: true,
        style: { stroke: '#f97316', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [normalizedTables, mergedTable, groupedTable, activeTables, whereAST, havingAST, joinDetails, orderBy, isSelectAll, limit]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 800 }}
        panActivationKeyCode={null}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        className="bg-[#0f172a]"
      >
        <Background variant={BackgroundVariant.Dots} color="#334155" gap={24} />
        <ControlesPersonalizados />
      </ReactFlow>
    </div>
  );
};
