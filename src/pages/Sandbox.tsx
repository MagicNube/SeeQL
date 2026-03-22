import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SqlEditor } from '../components/editor/SqlEditor';

type EsquemaId = 'facil_biblioteca' | 'medio_gym' | 'dificil_aeropuerto';

type ColumnaDef = {
  name: string;
  type: string;
  isPk?: boolean;
};

type ConsoleLog = {
  status: 'idle' | 'success' | 'error';
  message: string;
  timestamp?: string;
};

export default function Sandbox() {
  const esquemas: { id: EsquemaId; nombre: string }[] = [
    { id: 'facil_biblioteca', nombre: 'Biblioteca (Fácil)' },
    { id: 'medio_gym', nombre: 'Gimnasio (Medio)' },
    { id: 'dificil_aeropuerto', nombre: 'Aeropuerto (Difícil)' }
  ];

  const [esquemaActivo, setEsquemaActivo] = useState<EsquemaId>(esquemas[0].id);
  const [consulta, setConsulta] = useState<string>('SELECT * \nFROM libros;');

  const [estructuraActual, setEstructuraActual] = useState<Record<string, ColumnaDef[]>>({});
  const [previewDatos, setPreviewDatos] = useState<Record<string, any[]>>({});
  const [loadingPizarra, setLoadingPizarra] = useState<boolean>(true);

  const [resultadosQuery, setResultadosQuery] = useState<any[]>([]);
  const [columnasQuery, setColumnasQuery] = useState<string[]>([]);
  const [loadingOutput, setLoadingOutput] = useState<boolean>(false);

  const [consoleLog, setConsoleLog] = useState<ConsoleLog>({
    status: 'idle',
    message: 'Ejecuta una consulta para ver los resultados.'
  });

  const [viewModePizarra, setViewModePizarra] = useState<'estructura' | 'datos'>('estructura');

  useEffect(() => {
    async function cargarEntorno() {
      setLoadingPizarra(true);
      try {
        const { data: dataEstructura, error: errorEstructura } = await supabase.rpc('obtener_estructura_esquema', {
          esquema_nombre: esquemaActivo
        });

        if (errorEstructura) throw errorEstructura;

        const estructura = dataEstructura || {};
        setEstructuraActual(estructura);

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
        setEstructuraActual({});
        setPreviewDatos({});
      } finally {
        setLoadingPizarra(false);
      }
    }

    cargarEntorno();
  }, [esquemaActivo]);

  const ejecutarQuery = async () => {
    setLoadingOutput(true);
    const time = new Date().toLocaleTimeString();

    try {
      if (!consulta.trim().toLowerCase().startsWith('select')) {
        throw new Error("El Sandbox solo soporta consultas SELECT por motivos de seguridad.");
      }

      const { data, error: dbError } = await supabase.rpc('ejecutar_sql_sandbox', {
        query_text: consulta,
        esquema_nombre: esquemaActivo
      });

      if (dbError) throw dbError;

      const filas = data || [];
      setResultadosQuery(filas);
      setColumnasQuery(filas.length > 0 ? Object.keys(filas[0]) : []);

      setConsoleLog({
        status: 'success',
        message: `Query ejecutada con éxito. Filas devueltas: ${filas.length}.`,
        timestamp: time
      });

    } catch (err: any) {
      setConsoleLog({
        status: 'error',
        message: err.message || String(err),
        timestamp: time
      });
      setResultadosQuery([]);
      setColumnasQuery([]);
    } finally {
      setLoadingOutput(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#050a15] p-4 gap-4 font-sans overflow-hidden">

      <aside className="w-87.5 flex flex-col gap-4 shrink-0 h-full">
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 shadow-lg flex flex-col shrink-0">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Entorno de Datos
          </label>
          <select
            className="w-full bg-[#0f172a] border border-slate-700 p-2.5 rounded-lg text-xs text-blue-400 font-medium focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
            value={esquemaActivo}
            onChange={(e) => setEsquemaActivo(e.target.value as EsquemaId)}
          >
            {esquemas.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 shadow-lg flex flex-col flex-1 min-h-0">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Editor SQL
          </label>
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-800 bg-[#1e1e1e]">
            <SqlEditor codigo={consulta} setCodigo={setConsulta} />
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 shadow-lg flex flex-col shrink-0">
          <button
            onClick={ejecutarQuery}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            EJECUTAR QUERY
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-4 min-w-0 h-full">

        <section className="flex-[0.6] bg-[#1e293b] rounded-2xl border border-slate-700/50 shadow-lg relative flex flex-col overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 bg-[#0f172a]/90 backdrop-blur-md p-1 rounded-md z-20 border border-slate-700/50 shadow-sm">
            <button
              onClick={() => setViewModePizarra('estructura')}
              className={`px-6 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all ${
                viewModePizarra === 'estructura' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Estructura
            </button>
            <button
              onClick={() => setViewModePizarra('datos')}
              className={`px-6 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all ${
                viewModePizarra === 'datos' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Datos
            </button>
          </div>

          <div
            className="flex-1 overflow-auto p-8 pt-20 relative"
            style={{
              backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#0f172a'
            }}
          >
            {loadingPizarra ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Sincronizando esquema...</p>
              </div>
            ) : viewModePizarra === 'estructura' ? (
              <div className="flex flex-wrap gap-6 justify-center items-start">
                {Object.entries(estructuraActual).map(([nombreTabla, columnasTabla]) => (
                  <div key={nombreTabla} className="w-64 bg-[#1e293b] rounded-lg border border-slate-700 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-slate-800/80 border-b border-slate-700 p-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-xs tracking-wide">
                        {nombreTabla}
                      </span>
                    </div>
                    <div className="flex flex-col p-1.5">
                      {columnasTabla.map((col) => (
                        <div key={col.name} className="flex justify-between items-center py-1.5 px-2.5 border-b border-slate-800/50 last:border-0">
                          <div className="flex items-center gap-2">
                            {col.isPk && <span className="text-blue-400 text-[10px] font-bold" title="Primary Key">PK</span>}
                            <span className={`text-[11px] ${col.isPk ? 'font-medium text-slate-200' : 'text-slate-400'}`}>{col.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 justify-center items-start">
                {Object.entries(previewDatos).map(([nombreTabla, filas]) => (
                  <div key={nombreTabla} className="max-w-md bg-[#1e293b] rounded-lg border border-slate-700 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-slate-800/80 border-b border-slate-700 p-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-xs tracking-wide">
                         {nombreTabla}
                      </span>
                      <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">Muestra: 5 filas</span>
                    </div>
                    <div className="overflow-x-auto p-1">
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-[#0f172a] text-slate-400">
                          <tr>
                            {filas[0] ? Object.keys(filas[0]).map(k => <th key={k} className="p-2 font-medium border-b border-slate-800 whitespace-nowrap">{k}</th>) : <th className="p-2">Sin datos</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filas.length > 0 ? filas.map((f, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                              {Object.values(f).map((val: any, j) => (
                                <td key={j} className="p-2 text-slate-300 truncate max-w-32" title={String(val)}>{String(val)}</td>
                              ))}
                            </tr>
                          )) : (
                            <tr><td className="p-4 text-center text-slate-500 italic">Tabla sin registros</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="flex-[0.4] bg-[#1e293b] rounded-2xl border border-slate-700/50 shadow-lg flex flex-col overflow-hidden">
          <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Output Consola</span>
             <div className="flex items-center gap-2">
               {consoleLog.timestamp && <span className="text-[9px] text-slate-500 font-mono">{consoleLog.timestamp}</span>}
               <span className={`h-2 w-2 rounded-full ${consoleLog.status === 'success' ? 'bg-emerald-500' : consoleLog.status === 'error' ? 'bg-red-500' : 'bg-slate-600'}`}></span>
             </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#0a0f1d] p-0 flex flex-col">
            <div className="p-4 border-b border-slate-800/50 shrink-0">
              {loadingOutput ? (
                 <span className="text-xs text-blue-400 font-mono animate-pulse">Ejecutando consulta...</span>
              ) : (
                 <span className={`text-xs font-mono ${consoleLog.status === 'success' ? 'text-emerald-400' : consoleLog.status === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
                   {consoleLog.message}
                 </span>
              )}
            </div>

            <div className="flex-1 overflow-auto relative">
              {resultadosQuery.length > 0 && !loadingOutput && consoleLog.status === 'success' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1e293b] text-slate-300 sticky top-0 shadow-sm">
                    <tr>
                      {columnasQuery.map((col) => <th key={col} className="p-2.5 px-4 font-semibold border-b border-slate-700 whitespace-nowrap">{col}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {resultadosQuery.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        {columnasQuery.map((col) => <td key={col} className="p-2.5 px-4 text-slate-400 font-mono whitespace-nowrap">{String(row[col])}</td>)}
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
