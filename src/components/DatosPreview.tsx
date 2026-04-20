import React, { useMemo, useEffect, useState } from 'react';
import { useSqlVisualizer, evaluateWhere } from '../hooks/useSqlVisualizer';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
  type Node,
  type Edge
} from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, ArrowUp, ArrowDown, Key, Layers, Maximize2, Minimize2, X } from 'lucide-react';
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
      <button onClick={() => fitView({ padding: 0.2, duration: 500 })} title="Centrar pizarra" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><Maximize className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
    </Panel>
  );
};

const AutoCentrador = ({ focusedTable }: { focusedTable: string | null }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400, maxZoom: 1.5 });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [focusedTable, fitView]);

  return null;
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

export const DatosPreviewContent: React.FC<DatosPreviewProps> = ({ query, tables }) => {
  const {fitView} = useReactFlow();
  const { activeTables, whereAST, joinDetails, selectedColumns, isSelectAll, orderBy, groupBy, aggregations, havingAST, limit } = useSqlVisualizer(query);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [focusedTable, setFocusedTable] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(true);



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
    Object.entries(groups).forEach(([_key, groupRows]) => {
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
    if (mergedTable || groupedTable) {
      setShowNotification(true);
    }
  }, [mergedTable, groupedTable]);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Referencia para colocar resultados debajo de las tablas base
    let maxTableY = 0;

    const tablesToRender = focusedTable
      ? normalizedTables.filter(t => t.tableName === focusedTable)
      : normalizedTables;

    // 1. Renderizado de Tablas de Origen con posicionamiento fijo
    tablesToRender.forEach((table, index) => {
      const isTargetTable = activeTables.some(at => at.toLowerCase() === table.tableName.toLowerCase());

      // Cuadrícula automática por defecto
      const cols = 3;
      let posX = (index % cols) * 850;
      let posY = Math.floor(index / cols) * 600;

      // Coordenadas manuales PRO (Con más espacio para los datos)
      const esGimnasio = tables.some(t => t.tableName === 'clientes');
      const esAeropuerto = tables.some(t => t.tableName === 'vuelos');
      const esBiblioteca = tables.some(t => t.tableName === 'libros');

      if (esGimnasio) {
        if (table.tableName === 'reservas') { posX = 700; posY = 90; }
        else if (table.tableName === 'pagos') { posX = 200; posY = 0; }
        else if (table.tableName === 'clientes') { posX = 300; posY = 600; }
        else if (table.tableName === 'entrenadores') { posX = 900; posY = 600; }
        else if (table.tableName === 'clases') { posX = 1100; posY = 270; }
      }
      else if (esAeropuerto) {
        if (table.tableName === 'modelos_avion') { posX = 450; posY = 400; }
        else if (table.tableName === 'aviones') { posX = 0; posY = 400; }
        else if (table.tableName === 'aeropuertos') { posX = 750; posY = 0; }
        else if (table.tableName === 'reservas') { posX = 980; posY = 400; }
        else if (table.tableName === 'vuelos') { posX = 0; posY = 0; }
        else if (table.tableName === 'pilotos') { posX = 980; posY = 780; }
        else if (table.tableName === 'pasajeros') { posX = 450; posY = 780; }
      }
      else if (esBiblioteca) {
        if (table.tableName === 'autores') { posX = 0; posY = 550; }
        else if (table.tableName === 'libros') { posX = 0; posY = 0; }
        else if (table.tableName === 'categorias') { posX = 1150; posY = 550; }
        else if (table.tableName === 'usuarios') { posX = 550; posY = 550; }
        else if (table.tableName === 'prestamos') { posX = 900; posY = 200; }
      }

      // Guardamos la posición más baja para el JOIN/GROUP BY posterior
      if (posY > maxTableY) {
        maxTableY = posY;
      }

      const VISIBLE_ROWS = 15;
      const rowsToRender = table.normalizedRows.slice(0, VISIBLE_ROWS);
      const hiddenRowsCount = table.normalizedRows.length - VISIBLE_ROWS;
const content = (
        <div className={`w-max min-w-[320px] bg-[#1e293b] rounded-xl border transition-all duration-300 ...
        ${isTargetTable ? 'border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] scale-[1.02]' : 'border-slate-700 opacity-70'}`}>
          <div className={`border-b border-slate-700 p-3 flex items-center justify-between
            ${isTargetTable ? 'bg-blue-900/30' : 'bg-slate-800/80'}`}>
            <div className="flex items-center gap-3">
              <span className={`font-black text-sm tracking-wide ${isTargetTable ? 'text-blue-300' : 'text-slate-200'}`}>
                {table.tableName}
              </span>
              <button
                onClick={() => setFocusedTable(focusedTable === table.tableName ? null : table.tableName)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={focusedTable ? "Volver a ver todas las tablas" : "Centrar esta tabla"}
              >
                {focusedTable ? <Minimize2 className="w-4 h-4 text-emerald-400" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700 uppercase tracking-widest">
              Origen
            </span>
          </div>

          <div className="overflow-x-auto p-1.5 bg-[#0f172a]/50 rounded-b-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f172a]">
                <tr>
                  {table.columns.map((col) => {
                    const isKey = (joinDetails?.leftTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.leftColumn.toLowerCase() === col.name.toLowerCase()) ||
                                  (joinDetails?.rightTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.rightColumn.toLowerCase() === col.name.toLowerCase());
                    const isSel = isColumnSelected(col.name, table.tableName);
                    const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${table.tableName}.${col.name}`.toLowerCase());

                    const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-4 h-4 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-4 h-4 ml-1 inline-block text-yellow-400" />) : null;
                    const keyIcon = isKey && !focusedTable ? <Key className="w-3.5 h-3.5 ml-1 inline-block text-fuchsia-400" /> : null;

                    return (
                      <th key={col.name} className={`p-3 font-semibold border-b border-slate-800 whitespace-nowrap
                        ${isKey && !focusedTable ? 'text-fuchsia-400 bg-fuchsia-900/20' : isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isSel ? 'text-blue-300' : 'text-slate-400 opacity-80'}`}>
                        <div className="flex items-center">{col.name} {keyIcon} {sortIcon}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {(() => {
                  let matchCount = 0;
                  return rowsToRender.map((row, i) => {
                    const isMatch = evaluateWhere(row, whereAST);

                    let withinLimit = true;
                    if (isMatch && isTargetTable && !joinDetails && !groupedTable) {
                        matchCount++;
                        if (limit !== null && matchCount > limit) { withinLimit = false; }
                    }

                    const isHighlighted = isTargetTable && isMatch && withinLimit && !joinDetails && !groupedTable;
                    const isFaded = isTargetTable && (!isMatch || !withinLimit) && !joinDetails && !groupedTable;

                    return (
                      <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/60 ${isFaded ? 'opacity-30' : 'opacity-100'} ${isHighlighted ? 'border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                        {table.columns.map((col, j) => {
                          const isKey = (joinDetails?.leftTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.leftColumn.toLowerCase() === col.name.toLowerCase()) ||
                                        (joinDetails?.rightTable.toLowerCase() === table.tableName.toLowerCase() && joinDetails?.rightColumn.toLowerCase() === col.name.toLowerCase());
                          const isSel = isColumnSelected(col.name, table.tableName);
                          const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${table.tableName}.${col.name}`.toLowerCase());
                          const val = row[`${table.tableName}.${col.name}`];
                          return (
                            <td key={j} className={`p-3 whitespace-nowrap ${isKey && !focusedTable ? 'text-fuchsia-300 bg-fuchsia-900/10 opacity-100 font-bold' : isSorted ? 'text-yellow-100 bg-yellow-900/10' : isSel ? (isHighlighted ? 'text-emerald-300 bg-emerald-900/10 font-medium' : 'text-slate-200 opacity-100') : 'text-slate-400 opacity-80'}`}>
                              {String(val ?? '')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            {hiddenRowsCount > 0 && (
              <div className="bg-[#0f172a] text-center py-2.5 px-4 text-xs text-slate-500 font-bold border-t border-slate-800/80 shadow-inner rounded-b-xl">
                + {hiddenRowsCount} fila{hiddenRowsCount > 1 ? 's' : ''} más en la base de datos...
              </div>
            )}
          </div>
        </div>
      );

      newNodes.push({ id: `table-${table.tableName}`, type: 'dataNode', position: { x: posX, y: posY }, data: { content } });
    });
// 2. Posicionar resultados (JOIN / GROUP BY) dinámicamente
    const baseVirtualY = maxTableY + 350;

    if (!focusedTable && mergedTable && joinDetails) {
      const esEsquemaAncho = tables.some(t => t.tableName === 'vuelos' || t.tableName === 'libros');
      const posX = esEsquemaAncho ? 850 : 425;
      const posY = baseVirtualY;

      const content = (
        <div className="w-max min-w-125 bg-[#1e293b] rounded-xl border border-fuchsia-500 shadow-[0_0_40px_-10px_rgba(217,70,239,0.3)] overflow-hidden scale-[1.05]">
           <div className="bg-fuchsia-900/30 border-b border-fuchsia-500/30 p-3 flex items-center justify-between">
              <span className="font-black text-fuchsia-300 text-sm tracking-wide uppercase">
                {mergedTable.tableName || 'Resultado Fusión'}
              </span>
              <span className="text-[10px] font-bold text-fuchsia-400 bg-fuchsia-950 px-2.5 py-1 rounded-md border border-fuchsia-800 animate-pulse uppercase tracking-widest">
                JOIN Activo
              </span>
           </div>
           <div className="overflow-x-auto p-1.5 bg-[#0f172a]/50 rounded-b-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0f172a]">
                  <tr>
                    {mergedTable.columns.map((col, idx) => {
                      const isSel = isColumnSelected(col.name, col.tableOrigin);
                      const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${col.tableOrigin}.${col.name}`.toLowerCase());
                      const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-4 h-4 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-4 h-4 ml-1 inline-block text-yellow-400" />) : null;
                      return (
                        <th key={idx} className={`p-3 font-semibold border-b border-slate-800 whitespace-nowrap ${isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isSel ? 'text-blue-300' : 'text-slate-400 opacity-80'}`}>
                          <div className="flex items-center">{col.tableOrigin}.{col.name} {sortIcon}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {(() => {
                    let matchCount = 0;
                    const VISIBLE_ROWS_JOIN = 15;
                    const rowsToRenderJoin = mergedTable.rows.slice(0, VISIBLE_ROWS_JOIN);
                    const hiddenRowsCountJoin = mergedTable.rows.length - VISIBLE_ROWS_JOIN;

                    return (
                        <React.Fragment>
                        {rowsToRenderJoin.map((row, i) => {
                            const isMatch = evaluateWhere(row, whereAST);
                            const isNull = Object.values(row).includes('NULL');

                            let withinLimit = true;
                            if (isMatch && !groupedTable) {
                                matchCount++;
                                if (limit !== null && matchCount > limit) { withinLimit = false; }
                            }

                            const isHighlighted = isMatch && withinLimit && !groupedTable;
                            const isFaded = (!isMatch || !withinLimit) && !groupedTable;

                            return (
                                <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/60 ${isFaded ? 'opacity-30' : 'opacity-100'} ${isNull ? 'bg-orange-900/10' : ''} ${isHighlighted ? 'border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                                {mergedTable.columns.map((col, j) => {
                                    const isSel = isColumnSelected(col.name, col.tableOrigin);
                                    const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase() || orderBy.column.toLowerCase() === `${col.tableOrigin}.${col.name}`.toLowerCase());
                                    const val = row[`${col.tableOrigin}.${col.name}`] !== undefined ? row[`${col.tableOrigin}.${col.name}`] : row[col.name];
                                    return (
                                    <td key={j} className={`p-3 whitespace-nowrap ${isSorted ? 'text-yellow-100 bg-yellow-900/10' : isSel ? (val === 'NULL' ? 'text-orange-400 font-bold italic' : isHighlighted ? 'text-emerald-300 font-medium' : 'text-slate-200') : 'text-slate-400 opacity-80'}`}>
                                        {String(val ?? '')}
                                    </td>
                                    );
                                })}
                                </tr>
                            );
                        })}
                        {hiddenRowsCountJoin > 0 && (
                            <tr>
                                <td colSpan={mergedTable.columns.length} className="bg-[#0f172a] text-center py-2.5 px-4 text-xs text-slate-500 font-bold border-t border-slate-800/80 shadow-inner rounded-b-xl">
                                    + {hiddenRowsCountJoin} resultados más del JOIN...
                                </td>
                            </tr>
                        )}
                        </React.Fragment>
                    );
                  })()}
                </tbody>
              </table>
           </div>
        </div>
      );

      newNodes.push({ id: 'merged-table', type: 'dataNode', position: { x: posX, y: posY }, data: { content } });
      newEdges.push(
        { id: 'e-left-merge', source: `table-${joinDetails.leftTable}`, target: 'merged-table', animated: true, style: { stroke: '#d946ef', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#d946ef' } },
        { id: 'e-right-merge', source: `table-${joinDetails.rightTable}`, target: 'merged-table', animated: true, style: { stroke: '#d946ef', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#d946ef' } }
      );
    }

    if (!focusedTable && groupedTable) {
      const sourceNodeId = mergedTable ? 'merged-table' : `table-${activeTables[0]}`;
      const esEsquemaAncho = tables.some(t => t.tableName === 'vuelos' || t.tableName === 'libros');
      const posX = esEsquemaAncho ? 850 : 425;
      const posY = mergedTable ? baseVirtualY + 350 : baseVirtualY;

      const content = (
        <div className="w-max min-w-87.5 bg-[#1e293b] rounded-xl border border-orange-500 shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)] overflow-hidden scale-[1.05]">
           <div className="bg-orange-900/30 border-b border-orange-500/30 p-3 flex items-center justify-between">
              <span className="font-black text-orange-300 text-sm tracking-wide uppercase flex items-center gap-2">
                <Layers className="w-5 h-5"/> {groupedTable.tableName || 'Agrupación Final'}
              </span>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-950 px-2.5 py-1 rounded-md border border-orange-800 animate-pulse uppercase tracking-widest">
                Agrupación
              </span>
           </div>
           <div className="overflow-x-auto p-1.5 bg-[#0f172a]/50 rounded-b-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0f172a]">
                  <tr>
                    {groupedTable.columns.map((col, idx) => {
                      const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase());
                      const sortIcon = isSorted ? (orderBy.direction === 'DESC' ? <ArrowDown className="w-4 h-4 ml-1 inline-block text-yellow-400" /> : <ArrowUp className="w-4 h-4 ml-1 inline-block text-yellow-400" />) : null;
                      const isAgg = col.type === 'Agregacion';

                      return (
                        <th key={idx} className={`p-3 font-semibold border-b border-slate-800 whitespace-nowrap ${isSorted ? 'text-yellow-400 font-bold bg-yellow-900/10' : isAgg ? 'text-orange-300' : 'text-blue-300'}`}>
                          <div className="flex items-center">{col.name} {sortIcon}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {(() => {
                    let matchCount = 0;
                    const VISIBLE_ROWS_GROUP = 15;
                    const rowsToRenderGroup = groupedTable.rows.slice(0, VISIBLE_ROWS_GROUP);
                    const hiddenRowsCountGroup = groupedTable.rows.length - VISIBLE_ROWS_GROUP;

                    return (
                        <React.Fragment>
                        {rowsToRenderGroup.map((row, i) => {
                            const isMatch = evaluateWhere(row, havingAST);

                            let withinLimit = true;
                            if (isMatch) {
                                matchCount++;
                                if (limit !== null && matchCount > limit) { withinLimit = false; }
                            }

                            const isHighlighted = isMatch && havingAST && withinLimit;
                            const isFaded = (havingAST && !isMatch) || (!withinLimit);

                            return (
                                <tr key={i} className={`transition-all duration-300 hover:bg-slate-800/60 ${isFaded ? 'opacity-30' : 'opacity-100'} ${isHighlighted ? 'border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}>
                                {groupedTable.columns.map((col, j) => {
                                    const isSorted = orderBy && (orderBy.column.toLowerCase() === col.name.toLowerCase());
                                    const isAgg = col.type === 'Agregacion';
                                    const val = row[col.name];
                                    return (
                                    <td key={j} className={`p-3 whitespace-nowrap ${isSorted ? 'text-yellow-100 bg-yellow-900/10' : isAgg ? 'text-orange-200 font-mono font-bold' : 'text-slate-200'}`}>
                                        {String(val ?? '')}
                                    </td>
                                    );
                                })}
                                </tr>
                            );
                        })}
                        {hiddenRowsCountGroup > 0 && (
                            <tr>
                                <td colSpan={groupedTable.columns.length} className="bg-[#0f172a] text-center py-2.5 px-4 text-xs text-slate-500 font-bold border-t border-slate-800/80 shadow-inner rounded-b-xl">
                                    + {hiddenRowsCountGroup} grupos más calculados...
                                </td>
                            </tr>
                        )}
                        </React.Fragment>
                    );
                  })()}
                </tbody>
              </table>
           </div>
        </div>
      );

      newNodes.push({ id: 'grouped-table', type: 'dataNode', position: { x: posX, y: posY }, data: { content } });
      newEdges.push({
        id: 'e-aggr', source: sourceNodeId, target: 'grouped-table', animated: true,
        style: { stroke: '#f97316', strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);

  }, [normalizedTables, mergedTable, groupedTable, activeTables, whereAST, havingAST, joinDetails, orderBy, isSelectAll, limit, focusedTable, query, tables, setNodes, setEdges, setFocusedTable]);

  return (
    <div className="relative w-full h-full bg-[#0f172a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25, duration: 0, maxZoom: 1.2, minZoom: 0.05 }}
        panActivationKeyCode={null}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        className="[&_.react-flow__attribution]:hidden"
      >
        <Background variant={BackgroundVariant.Dots} color="#334155" gap={24} size={1} style={{ backgroundColor: '#0f172a' }} />
        <ControlesPersonalizados />
        <AutoCentrador focusedTable={focusedTable} />
      </ReactFlow>

      {/* Banner de aviso controlado por el estado showNotification */}
      {showNotification && (mergedTable || groupedTable) && (
        <div className="absolute top-6 left-6 z-100 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex flex-col gap-3 bg-slate-900/95 backdrop-blur-md border border-fuchsia-500/50 p-4 rounded-2xl shadow-2xl max-w-70 relative overflow-hidden">

            {/* BOTÓN X: Ahora es una X real y más visible */}
            <button
              onClick={() => setShowNotification(false)}
              className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer group"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pr-6">
              <div className="bg-fuchsia-500/20 p-2 rounded-xl">
                <Layers className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div>
                <p className="text-[11px] font-black text-fuchsia-400 uppercase tracking-widest">Consulta procesada</p>
                <p className="text-sm text-slate-200">
                  {groupedTable ? 'Agrupación lista' : 'Fusión de tablas lista'}.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFocusedTable(null);
                setShowNotification(false);
                setTimeout(() => {
                  fitView({
                    nodes: [{ id: groupedTable ? 'grouped-table' : 'merged-table' }],
                    duration: 500,
                    padding: 0.2
                  });
                }, 100);
              }}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-900/20"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Ver resultado ahora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DatosPreview = (props: DatosPreviewProps) => (
  <ReactFlowProvider>
    <DatosPreviewContent {...props} />
  </ReactFlowProvider>
);
