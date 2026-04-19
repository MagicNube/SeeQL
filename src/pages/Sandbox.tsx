import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { SqlEditor } from '../components/editor/SqlEditor';
import { DatosPreview } from '../components/DatosPreview';
import { PizarraInteractiva } from '../components/PizarraInteractiva';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { traducirErrorSQL } from '../utils/traductorSQL';

type EsquemaId = 'facil_biblioteca' | 'medio_gym' | 'dificil_aeropuerto';
type ColumnaDef = { name: string; type: string; isPk?: boolean; };
type ConsoleLog = { status: 'idle' | 'success' | 'error'; message: string; timestamp?: string; };

const QUERIES_POR_DEFECTO: Record<EsquemaId, string> = {
  facil_biblioteca: "SELECT *\nFROM libros\nWHERE anio_publicacion > 1990",
  medio_gym: "SELECT nombre_completo, email\nFROM clientes\nORDER BY nombre_completo ASC",
  dificil_aeropuerto: "SELECT numero_vuelo, hora_salida\nFROM vuelos\nWHERE id_aeropuerto_origen = 1"
};

export function Sandbox() {
  const esquemas: { id: EsquemaId; nombre: string }[] = [
    { id: 'facil_biblioteca', nombre: 'Biblioteca (Fácil)' },
    { id: 'medio_gym', nombre: 'Gimnasio (Medio)' },
    { id: 'dificil_aeropuerto', nombre: 'Aeropuerto (Difícil)' }
  ];

  const [esquemaActivo, setEsquemaActivo] = useState<EsquemaId>(esquemas[0].id);
  const [consulta, setConsulta] = useState<string>(QUERIES_POR_DEFECTO[esquemas[0].id]);

  const [estructuraActual, setEstructuraActual] = useState<Record<string, ColumnaDef[]>>({});
  const [relacionesActuales, setRelacionesActuales] = useState<any[]>([]);
  const [previewDatos, setPreviewDatos] = useState<Record<string, any[]>>({});
  const [loadingPizarra, setLoadingPizarra] = useState<boolean>(true);
  const [resultadosQuery, setResultadosQuery] = useState<any[]>([]);
  const [columnasQuery, setColumnasQuery] = useState<string[]>([]);
  const [loadingOutput, setLoadingOutput] = useState<boolean>(false);
  const [consoleLog, setConsoleLog] = useState<ConsoleLog>({ status: 'idle', message: 'Entorno de pruebas listo. Escribe cualquier consulta SELECT para empezar.' });
  const [viewModePizarra, setViewModePizarra] = useState<'estructura' | 'datos'>('datos');

  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(400);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX - 16;
      if (newWidth < 280) newWidth = 280;
      if (newWidth > 800) newWidth = 800;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const tablesForPreview = useMemo(() => {
    return Object.entries(previewDatos)
      // AÑADIDO: Ordenamos alfabéticamente para garantizar consistencia visual
      .sort(([nombreA], [nombreB]) => nombreA.localeCompare(nombreB))
      .map(([nombre, filas]) => ({
        tableName: nombre,
        columns: estructuraActual[nombre] || [],
        rows: filas
      }));
  }, [previewDatos, estructuraActual]);

  useEffect(() => {
    async function cargarEntorno() {
      setLoadingPizarra(true);

      setConsoleLog({ status: 'idle', message: `Conectado al esquema: ${esquemaActivo}. Entorno listo.` });
      setResultadosQuery([]);
      setColumnasQuery([]);
      setConsulta(QUERIES_POR_DEFECTO[esquemaActivo]);

      try {
        const { data: dataEstructura, error: errorEstructura } = await supabase.rpc('obtener_estructura_esquema', { esquema_nombre: esquemaActivo });
        if (errorEstructura) throw errorEstructura;
        const estructura = dataEstructura || {};
        setEstructuraActual(estructura);

        const { data: dataRelaciones } = await supabase.rpc('obtener_relaciones_esquema', { esquema_nombre: esquemaActivo });
        setRelacionesActuales(dataRelaciones || []);

        const tablas = Object.keys(estructura);
        const nuevosDatosPreview: Record<string, any[]> = {};
        await Promise.all(
          tablas.map(async (tabla) => {
            const { data } = await supabase.schema(esquemaActivo).from(tabla).select('*').limit(5);
            nuevosDatosPreview[tabla] = data || [];
          })
        );
        setPreviewDatos(nuevosDatosPreview);
      } catch (err: any) {
        setEstructuraActual({}); setRelacionesActuales([]); setPreviewDatos({});
      } finally {
        setLoadingPizarra(false);
      }
    }
    cargarEntorno();
  }, [esquemaActivo]);

  const ejecutarQuery = async () => {
    setLoadingOutput(true);
    setIsConsoleOpen(true);
    const time = new Date().toLocaleTimeString();

    try {
      if (!consulta.trim().toLowerCase().startsWith('select')) {
        throw new Error("El Sandbox solo soporta consultas SELECT por motivos de seguridad.");
      }
      const { data, error: dbError } = await supabase.rpc('ejecutar_sql_sandbox', { query_text: consulta, esquema_nombre: esquemaActivo });
      if (dbError) throw dbError;

      const filas = data || [];
      setResultadosQuery(filas);
      setColumnasQuery(filas.length > 0 ? Object.keys(filas[0]) : []);
      setConsoleLog({ status: 'success', message: `Query ejecutada con éxito. Filas devueltas: ${filas.length}.`, timestamp: time });
    } catch (err: any) {
      // Pasamos el error crudo por nuestro traductor mágico
      const mensajeOriginal = err.message || String(err);
      const mensajeAmigable = traducirErrorSQL(mensajeOriginal);

      setConsoleLog({ status: 'error', message: mensajeAmigable, timestamp: time });
      setResultadosQuery([]); setColumnasQuery([]);
    } finally {
      setLoadingOutput(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#050a15] p-4 gap-4 font-sans overflow-hidden">

      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="flex flex-col gap-4 shrink-0 h-full overflow-hidden pb-6"
      >
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 shadow-lg flex flex-col shrink-0">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Entorno de Datos</label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-[#0f172a] border border-slate-700 pl-4 pr-10 py-3 rounded-xl text-sm text-blue-400 font-bold outline-none cursor-pointer focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              value={esquemaActivo}
              onChange={(e) => setEsquemaActivo(e.target.value as EsquemaId)}
            >
              {esquemas.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 shadow-lg flex flex-col flex-1 min-h-0">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Editor SQL</label>
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-800 bg-[#1e1e1e]">
            <SqlEditor
              value={consulta}
              onChange={(val) => setConsulta(val || '')}
              estructura={estructuraActual}
            />
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 shadow-lg flex flex-col shrink-0">
          <button onClick={ejecutarQuery} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer">
            EJECUTAR QUERY
          </button>
        </div>
      </aside>

      <div
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        className={`w-1.5 hover:w-2 hover:bg-blue-500 cursor-col-resize rounded-full transition-all duration-150 flex items-center justify-center shrink-0 z-10 -mx-1.5 py-10 ${isResizing ? 'bg-blue-500 w-2' : 'bg-slate-800'}`}
        title="Arrastra para redimensionar"
      >
        <div className="flex flex-col gap-1">
          <div className={`w-1 h-1 rounded-full ${isResizing ? 'bg-white' : 'bg-slate-600'}`}></div>
          <div className={`w-1 h-1 rounded-full ${isResizing ? 'bg-white' : 'bg-slate-600'}`}></div>
        </div>
      </div>

      <main className="flex-1 flex flex-col gap-4 min-w-0 h-full pl-2">
        <section className="flex-1 bg-[#1e293b] rounded-2xl border border-slate-700/50 shadow-lg relative flex flex-col overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 bg-[#0f172a]/90 backdrop-blur-md p-1 rounded-md z-20 border border-slate-700/50 shadow-sm">
            <button onClick={() => setViewModePizarra('datos')} className={`px-6 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all ${viewModePizarra === 'datos' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Datos</button>
            <button onClick={() => setViewModePizarra('estructura')} className={`px-6 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all ${viewModePizarra === 'estructura' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Estructura</button>
          </div>

          <div className="flex-1 relative bg-[#0f172a]">
            {loadingPizarra ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : viewModePizarra === 'estructura' ? (
              <PizarraInteractiva estructura={estructuraActual} relaciones={relacionesActuales} />
            ) : (
              <DatosPreview query={consulta} tables={tablesForPreview} />
            )}
          </div>
        </section>

        <section className={`${isConsoleOpen ? 'h-[40%]' : 'h-11'} transition-all duration-300 ease-in-out bg-[#1e293b] rounded-2xl border border-slate-700/50 shadow-lg flex flex-col overflow-hidden shrink-0`}>

          <div className="bg-[#0f172a] px-4 flex justify-between border-b border-slate-800 shrink-0">
            <div className="flex">
              {/* Simulamos una pestaña activa para mantener la consistencia visual con Lecciones */}
              <div className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 border-blue-500 text-white bg-blue-500/5 cursor-default">
                <span className="w-3.5 h-3.5 flex items-center justify-center font-mono text-blue-400">{'>_'}</span> Output
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Indicadores de estado de la consulta */}


              {/* Botón de minimizar a la derecha, igual que en Lecciones */}
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className="p-2 my-auto text-slate-500 hover:text-slate-300 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
                title={isConsoleOpen ? "Minimizar consola" : "Maximizar consola"}
              >
                {isConsoleOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-auto bg-[#0a0f1d] p-0 flex flex-col ${isConsoleOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 custom-scrollbar`}>
            <div className="p-4 border-b border-slate-800/50 shrink-0">
              {loadingOutput ? (
                  <span className="text-xs text-blue-400 font-mono animate-pulse">Ejecutando consulta...</span>
              ) : (
                  <span className={`text-xs font-mono ${consoleLog.status === 'success' ? 'text-emerald-400' : consoleLog.status === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
                    {consoleLog.message}
                  </span>
              )}
            </div>

            <div className="flex-1 overflow-auto relative p-4 pt-0">
              {resultadosQuery.length > 0 && !loadingOutput && consoleLog.status === 'success' && (
                <table className="w-full text-left text-[11px] text-slate-300 mt-2">
                  <thead className="bg-slate-800 text-slate-400 uppercase tracking-tighter">
                    <tr>
                      {columnasQuery.map((col) => <th key={col} className="p-2 border border-slate-700 font-bold">{col}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {resultadosQuery.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        {columnasQuery.map((col) => <td key={col} className="p-2 border border-slate-800/50">{String(row[col])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
