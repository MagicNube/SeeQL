import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  getSmoothStepPath,
  BaseEdge,
  EdgeLabelRenderer,
  BackgroundVariant,
  Panel,
  useReactFlow,
  addEdge,
  reconnectEdge,
  type Connection,
  type Node,
  type Edge,
  type EdgeProps
} from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import '@xyflow/react/dist/style.css';

// 1. FLECHA PERSONALIZADA (Sin puntas de flecha y blindada)
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, data }: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const sourceTable = String(data?.sourceTable || 'Origen');
  const targetTable = String(data?.targetTable || 'Destino');

  return (
    <>
      {/* Forzamos markerEnd y markerStart a undefined para que no dibuje flechas */}
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={undefined} markerStart={undefined} />
      <EdgeLabelRenderer>
        <div style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: 'all' }} className="group z-50">
          <div className="text-[10px] font-bold text-slate-300 font-mono bg-[#1e293b] px-2 py-0.5 rounded border border-slate-600 shadow-md cursor-help hover:bg-blue-900 transition-colors">
            N : 1
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-800 text-slate-300 text-[11px] rounded-lg border border-slate-600 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
            <p>1 registro de <b className="text-blue-400 uppercase">{targetTable}</b> tiene N <b className="text-fuchsia-400 uppercase">{sourceTable}</b>.</p>
            <p>1 registro de <b className="text-fuchsia-400 uppercase">{sourceTable}</b> pertenece a 1 <b className="text-blue-400 uppercase">{targetTable}</b>.</p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-b border-r border-slate-600 rotate-45"></div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes = { custom: CustomEdge };

// 2. NODO DE TABLA
const TableNode = ({ data }: any) => {
  const dotStyle = "w-3 h-3 rounded-full bg-slate-600 border-2 border-[#1e293b] hover:bg-blue-400 hover:scale-150 transition-all z-10 cursor-crosshair";

  return (
    <div className="bg-[#1e293b] rounded-lg border border-slate-700 shadow-xl overflow-hidden min-w-55 relative group">

      {/* TARGETS (Puntos de ENTRADA) */}
      <Handle type="target" position={Position.Top} id="t-top" className={dotStyle} />
      <Handle type="target" position={Position.Right} id="t-right" className={dotStyle} />
      <Handle type="target" position={Position.Bottom} id="t-bottom" className={dotStyle} />
      <Handle type="target" position={Position.Left} id="t-left" className={dotStyle} />

      {/* SOURCES (Puntos de SALIDA) */}
      <Handle type="source" position={Position.Top} id="s-top" className={dotStyle} />
      <Handle type="source" position={Position.Right} id="s-right" className={dotStyle} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className={dotStyle} />
      <Handle type="source" position={Position.Left} id="s-left" className={dotStyle} />

      <div className="bg-slate-800/80 border-b border-slate-700 p-2.5 flex items-center justify-between">
        <span className="font-bold text-blue-300 text-xs tracking-wide uppercase">{data.label}</span>
      </div>

      <div className="flex flex-col p-1.5 bg-[#0f172a]/50">
        {data.columns.map((col: any) => (
          <div key={col.name} className="flex justify-between items-center py-1.5 px-2.5 border-b border-slate-800/50 last:border-0">
            <div className="flex items-center gap-2">
              {col.isPk && <span className="text-fuchsia-400 text-[10px] font-bold" title="Primary Key">🔑 PK</span>}
              <span className={`text-[11px] ${col.isPk ? 'font-medium text-slate-200' : 'text-slate-400'}`}>{col.name}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">{col.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = { table: TableNode };

// 3. CONTROLES DE ZOOM
const ControlesPersonalizados = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Panel position="bottom-left" className="flex flex-col gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 shadow-xl">
      <button onClick={() => zoomIn()} title="Acercar zoom" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><ZoomIn className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
      <button onClick={() => zoomOut()} title="Alejar zoom" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><ZoomOut className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
      <button onClick={() => fitView({ duration: 800 })} title="Centrar pizarra" className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors group"><Maximize className="w-4 h-4 text-slate-400 group-hover:text-white" /></button>
    </Panel>
  );
};

// 4. PIZARRA PRINCIPAL
export const PizarraInteractiva = ({ estructura, relaciones }: { estructura: any, relaciones: any[] }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        type: 'custom',
        data: { sourceTable: params.source, targetTable: params.target },
        style: { stroke: '#475569', strokeWidth: 2, opacity: 0.8 }
      }, eds));
    },
    [setEdges]
  );

  useEffect(() => {
    // 1. GENERAR NODOS CON DISEÑO EN "ESCALERA"
    const newNodes: Node[] = Object.entries(estructura).map(([nombreTabla, columnas], index) => {
      const x = (index % 3) * 380 + 50;
      const y = Math.floor(index / 3) * 350 + ((index % 3) * 120) + 50;

      return {
        id: nombreTabla,
        type: 'table',
        position: { x, y },
        data: { label: nombreTabla, columns: columnas }
      };
    });

    // 2. ENRUTADOR INTELIGENTE Y REPARTIDOR HÍBRIDO
    const usedHandles = new Set<string>(); // Aquí guardamos los puntos que ya tienen cable

    // Función que busca el primer punto libre basado en una lista de preferencias
    const getBestHandle = (nodeId: string, prefs: string[], isSource: boolean) => {
      const prefix = isSource ? 's-' : 't-';
      for (const p of prefs) {
        const handleId = `${nodeId}-${prefix}${p}`;
        if (!usedHandles.has(handleId)) {
          usedHandles.add(handleId); // Lo marcamos como ocupado
          return `${prefix}${p}`;
        }
      }
      // Si por algún casual la tabla tiene más de 4 flechas (todos ocupados), repetimos el primero
      return `${prefix}${prefs[0]}`;
    };

    const newEdges: Edge[] = relaciones.map((rel, idx) => {
      const sourceNode = newNodes.find(n => n.id === rel.tabla_origen);
      const targetNode = newNodes.find(n => n.id === rel.tabla_destino);

      let sourceHandle = 's-bottom';
      let targetHandle = 't-top';

      if (sourceNode && targetNode) {
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;

        let sourcePrefs: string[] = [];
        let targetPrefs: string[] = [];

        // Calculamos la dirección y montamos las preferencias de mejor a peor
        if (Math.abs(dx) > Math.abs(dy)) {
          // Separación mayoritariamente Horizontal
          if (dx > 0) { // Destino a la derecha
            sourcePrefs = dy > 0 ? ['right', 'bottom', 'top', 'left'] : ['right', 'top', 'bottom', 'left'];
            targetPrefs = dy > 0 ? ['left', 'top', 'bottom', 'right'] : ['left', 'bottom', 'top', 'right'];
          } else { // Destino a la izquierda
            sourcePrefs = dy > 0 ? ['left', 'bottom', 'top', 'right'] : ['left', 'top', 'bottom', 'right'];
            targetPrefs = dy > 0 ? ['right', 'top', 'bottom', 'left'] : ['right', 'bottom', 'top', 'left'];
          }
        } else {
          // Separación mayoritariamente Vertical
          if (dy > 0) { // Destino abajo
            sourcePrefs = dx > 0 ? ['bottom', 'right', 'left', 'top'] : ['bottom', 'left', 'right', 'top'];
            targetPrefs = dx > 0 ? ['top', 'left', 'right', 'bottom'] : ['top', 'right', 'left', 'bottom'];
          } else { // Destino arriba
            sourcePrefs = dx > 0 ? ['top', 'right', 'left', 'bottom'] : ['top', 'left', 'right', 'bottom'];
            targetPrefs = dx > 0 ? ['bottom', 'left', 'right', 'top'] : ['bottom', 'right', 'left', 'top'];
          }
        }

        // Asignamos el mejor punto que esté libre
        sourceHandle = getBestHandle(rel.tabla_origen, sourcePrefs, true);
        targetHandle = getBestHandle(rel.tabla_destino, targetPrefs, false);
      }

      return {
        id: `edge-${rel.tabla_origen}-${rel.tabla_destino}-${idx}`,
        source: rel.tabla_origen,
        sourceHandle: sourceHandle,
        target: rel.tabla_destino,
        targetHandle: targetHandle,
        type: 'custom',
        data: { sourceTable: rel.tabla_origen, targetTable: rel.tabla_destino },
        style: { stroke: '#475569', strokeWidth: 2, opacity: 0.8 },
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [estructura, relaciones]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        panActivationKeyCode={null}
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
