import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { SqlEditor } from '../components/editor/SqlEditor';
import { DatosPreview } from '../components/DatosPreview';
import { PizarraInteractiva } from '../components/PizarraInteractiva';
import { LECCIONES } from '../data/lecciones';
import { useAuth } from '../context/AuthContext';
import { traducirErrorSQL } from '../utils/traductorSQL';
import {
  Target,
  Lightbulb,
  Terminal,
  RotateCcw,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type TabId = 'output' | 'objetivo' | 'pista';
type ColumnaDef = { name: string; type: string; isPk?: boolean; };

export function LeccionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const leccionId = Number(id);

  const leccion = LECCIONES.find(l => l.id === leccionId);
  const [ejercicioActualIdx, setEjercicioActualIdx] = useState(0);
  const ejercicio = leccion?.ejercicios[ejercicioActualIdx];

  const [consulta, setConsulta] = useState(ejercicio?.codigoInicial || '');
  const [estructuraActual, setEstructuraActual] = useState<Record<string, ColumnaDef[]>>({});
  const [relacionesActuales, setRelacionesActuales] = useState<any[]>([]);
  const [previewDatos, setPreviewDatos] = useState<Record<string, Record<string, any>[]>>({});
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabId>('output');
  const [viewModePizarra, setViewModePizarra] = useState<'estructura' | 'datos'>('datos');

  const [sidebarWidth, setSidebarWidth] = useState<number>(450);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);

  const [resultadosQuery, setResultadosQuery] = useState<Record<string, any>[]>([]);
  const [columnasQuery, setColumnasQuery] = useState<string[]>([]);
  const [mensajeConsola, setMensajeConsola] = useState('El motor está listo. Envía tu consulta SQL para validar el ejercicio.');
  const [isSuccess, setIsSuccess] = useState(false);

  const [resultadoEsperado, setResultadoEsperado] = useState<Record<string, any>[]>([]);
  const [columnasEsperadas, setColumnasEsperadas] = useState<string[]>([]);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 1. Efecto de seguridad (Debe ser el primero)
  useEffect(() => {
    const verificarAcceso = async () => {
      if (!leccion) {
        navigate('/lecciones');
        return;
      }
      if (leccionId === 1 || !user) return;

      const { data } = await supabase
        .from('progreso_usuarios')
        .select('lesson_id')
        .eq('user_id', user.id);

      const leccionesCompletadas = data ? data.map(p => p.lesson_id) : [];

      if (!leccionesCompletadas.includes(leccionId - 1)) {
        navigate('/lecciones');
      }
    };

    verificarAcceso();
  }, [leccionId, user, navigate, leccion]);

  useEffect(() => {
    if (leccionId === 1 && ejercicioActualIdx === 0) {
      const hasSeenOnboarding = localStorage.getItem('seeql_onboarding_seen');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [leccionId, ejercicioActualIdx]);

  const cerrarOnboarding = () => {
    localStorage.setItem('seeql_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    setEjercicioActualIdx(0);
    setShowSuccessPopup(false);
    setIsExploring(false);
  }, [leccionId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX - 16;
      if (newWidth < 300) newWidth = 300;
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

  useEffect(() => {
    let isCancelled = false;

    const cargarTodo = async () => {
      if (!ejercicio) return;
      setLoading(true);
      try {
        const { data: estructura } = await supabase.rpc('obtener_estructura_esquema', { esquema_nombre: ejercicio.esquema });
        if (isCancelled) return;
        setEstructuraActual(estructura || {});

        const { data: relaciones } = await supabase.rpc('obtener_relaciones_esquema', { esquema_nombre: ejercicio.esquema });
        if (isCancelled) return;
        setRelacionesActuales(relaciones || []);

        const tablas = Object.keys(estructura || {});
        const nuevosDatos: Record<string, Record<string, any>[]> = {};
        await Promise.all(tablas.map(async (t) => {
          const { data } = await supabase.schema(ejercicio.esquema).from(t).select('*').limit(5);
          nuevosDatos[t] = data || [];
        }));
        if (isCancelled) return;
        setPreviewDatos(nuevosDatos);

        const { data: dataResultado } = await supabase.rpc('ejecutar_sql_sandbox', {
          query_text: ejercicio.solucionEsperada,
          esquema_nombre: ejercicio.esquema
        });
        if (isCancelled) return;
        if (dataResultado) {
          setResultadoEsperado(dataResultado);
          setColumnasEsperadas(dataResultado.length > 0 ? Object.keys(dataResultado[0]) : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (ejercicio) {
      setConsulta(ejercicio.codigoInicial || '');
      setIsSuccess(false);
      setIsExploring(false);
      setResultadosQuery([]);
      setColumnasQuery([]);
      setMensajeConsola('El motor está listo. Envía tu consulta SQL para validar el ejercicio.');
      setIsConsoleOpen(false);
      cargarTodo();
    }

    return () => {
      isCancelled = true;
    };
  }, [ejercicioActualIdx, leccionId, ejercicio]);

  const sonResultadosIguales = (arr1: any[], arr2: any[]) => {
    if (arr1.length !== arr2.length) return false;
    if (ejercicio?.solucionEsperada.toUpperCase().includes('ORDER BY')) {
       return JSON.stringify(arr1) === JSON.stringify(arr2);
    }
    const strArr1 = arr1.map(row => JSON.stringify(row)).sort();
    const strArr2 = arr2.map(row => JSON.stringify(row)).sort();
    return JSON.stringify(strArr1) === JSON.stringify(strArr2);
  };

  const ejecutarQuery = async () => {
    if (!ejercicio || isExploring) return;

    if (!consulta.trim()) {
    setMensajeConsola('La consulta está vacía. Escribe tu código SQL antes de validar.');
    setActiveTab('output');
    setIsConsoleOpen(true);
    return;
  }

    setMensajeConsola('Verificando...');
    setActiveTab('output');
    setIsConsoleOpen(true);

    try {
      const { data, error } = await supabase.rpc('ejecutar_sql_sandbox', {
        query_text: consulta,
        esquema_nombre: ejercicio.esquema
      });
      if (error) throw error;

      const filas = data || [];
      setResultadosQuery(filas);
      setColumnasQuery(filas.length > 0 ? Object.keys(filas[0]) : []);

      const isCorrect = sonResultadosIguales(filas, resultadoEsperado);

      if (isCorrect) {
        setMensajeConsola('¡Excelente! Has conseguido los datos que buscábamos.');
        setIsSuccess(true);

        // --- AÑADIMOS EL RETARDO AQUÍ ---
        setTimeout(() => {
          setShowSuccessPopup(true);
        }, 600);
        // --------------------------------

        if (ejercicioActualIdx === leccion.ejercicios.length - 1 && user) {
          await supabase.from('progreso_usuarios').upsert({
            user_id: user.id,
            lesson_id: leccionId,
            completado_at: new Date().toISOString()
          });
        }
      } else {
        setMensajeConsola('La consulta se ha ejecutado, pero los datos devueltos no son exactamente los solicitados.');
        setIsSuccess(false);
      }
    } catch (err: any) {
      const mensajeAmigable = traducirErrorSQL(err.message || '');
      setMensajeConsola(mensajeAmigable);
      setIsSuccess(false);
    }
  };

  const finalizarLeccion = () => {
    const nextLeccion = LECCIONES.find(l => l.id === leccionId + 1);
    setEjercicioActualIdx(0);
    setShowSuccessPopup(false);
    setIsExploring(false);

    if (nextLeccion) {
        navigate(`/lecciones/${nextLeccion.id}`);
    } else {
        navigate('/lecciones');
    }
  };

  const tablesForPreview = useMemo(() => {
    return Object.entries(previewDatos).sort(([a], [b]) => a.localeCompare(b)).map(([nombre, filas]) => ({
      tableName: nombre,
      columns: estructuraActual[nombre] || [],
      rows: filas
    }));
  }, [previewDatos, estructuraActual]);

  if (!leccion || !ejercicio) return <div className="text-white p-10 flex items-center justify-center h-full">Cargando Lección...</div>;

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#050a15] p-4 gap-4 overflow-hidden">

      <aside style={{ width: `${sidebarWidth}px` }} className="flex flex-col gap-4 shrink-0 h-full">

        <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/50 shadow-lg flex flex-col shrink-0 max-h-[60%] overflow-auto custom-scrollbar relative">
          <div className="flex justify-between items-center mb-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Ejercicio Actual</span>
            <span className="text-sm font-black bg-blue-600/30 text-blue-200 px-4 py-1.5 rounded-xl border border-blue-400/30 shadow-md">
              {ejercicioActualIdx + 1} de {leccion.ejercicios.length}
            </span>
          </div>

          <h2 className="text-white font-black text-2xl mb-6 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-500" /> Lección {leccion.id}. {leccion.titulo}
          </h2>

          {ejercicio.teoria && (
            <div className="mb-6">
              <h3 className="text-[14px] font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                 Explicación
              </h3>
              <div className="text-white text-base leading-relaxed prose prose-invert prose-p:my-1 prose-code:text-blue-300 prose-code:bg-blue-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md max-w-none">
                <ReactMarkdown>{ejercicio.teoria}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="mt-auto">
             <h3 className="text-[14px] font-bold uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                {ejercicioActualIdx === 0 ? 'Enunciado Resuelto' : 'Enunciado a resolver'}
             </h3>
             {ejercicioActualIdx === 0 && (
                <p className="text-base text-blue-400 mb-3 font-medium italic">
                  Explora las tablas hasta familiarizarte con las tablas.
                </p>
             )}
             <div className="bg-blue-500/10 border-l-4 border-blue-500 p-5 rounded-r-xl shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
               <div className="text-blue-100 text-lg font-bold italic leading-snug relative z-10 prose prose-invert prose-p:my-0 prose-strong:text-blue-300 prose-code:text-blue-200 prose-code:bg-blue-900/30 prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown>{`"${ejercicio.enunciado}"`}</ReactMarkdown>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 shadow-lg flex flex-col flex-1 min-h-0 relative">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Editor SQL</label>
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-800">
            <SqlEditor
              value={consulta}
              onChange={(val) => setConsulta(val || '')}
              estructura={estructuraActual}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            <button
               onClick={() => setConsulta(ejercicio.codigoInicial || '')}
               className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-95 border border-slate-700 cursor-pointer shadow-md"
               title="Restaurar editor"
            >
               <RotateCcw className="w-5 h-5" />
            </button>

            {/* El botón azul siempre es el primario */}
            <button
              onClick={ejecutarQuery}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
            >
              {isExploring ? 'VOLVER A EJECUTAR' : 'EJECUTAR Y VALIDAR'}
            </button>
          </div>

          {/* El botón de avanzar aparece debajo, grande y llamativo */}
          {isExploring && (
             <button
               onClick={() => {
                 if (ejercicioActualIdx < leccion.ejercicios.length - 1) {
                    setEjercicioActualIdx(f => f + 1);
                    setIsExploring(false);
                 } else {
                    finalizarLeccion();
                 }
               }}
               className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] animate-pulse"
             >
               {ejercicioActualIdx < leccion.ejercicios.length - 1 ? 'Pasar al Siguiente Ejercicio' : 'Finalizar Lección'} <ArrowRight className="w-4 h-4"/>
             </button>
          )}
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

      <main className="flex-1 flex flex-col gap-4 min-w-0 h-full">

        <section className="flex-1 bg-[#1e293b] rounded-2xl border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 bg-[#0f172a]/90 backdrop-blur-md p-1.5 rounded-xl z-20 border border-slate-700/50 shadow-xl">
            <button onClick={() => setViewModePizarra('datos')} className={`px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase cursor-pointer transition-all ${viewModePizarra === 'datos' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Datos</button>
            <button onClick={() => setViewModePizarra('estructura')} className={`px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase cursor-pointer transition-all ${viewModePizarra === 'estructura' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Estructura</button>
          </div>
          <div className="w-full h-full bg-[#0f172a]">
             {loading ? <div className="h-full flex items-center justify-center animate-pulse text-blue-500 font-mono text-sm tracking-widest uppercase">Cargando entorno seguro...</div> : viewModePizarra === 'estructura' ? <PizarraInteractiva estructura={estructuraActual} relaciones={relacionesActuales} /> : <DatosPreview query={consulta} tables={tablesForPreview} />}
          </div>
        </section>

        <section className={`${isConsoleOpen ? 'h-[30%]' : 'h-11'} transition-all duration-300 ease-in-out bg-[#1e293b] rounded-2xl border border-slate-700/50 shadow-lg flex flex-col overflow-hidden shrink-0`}>

          <div className="bg-[#0f172a] px-4 flex justify-between border-b border-slate-800 shrink-0">
            <div className="flex">
              {[{ id: 'output', label: 'Output', icon: Terminal }, { id: 'objetivo', label: 'Resultado Esperado', icon: Target }, { id: 'pista', label: 'Pista', icon: Lightbulb }].map(tab => (
                <button
  key={tab.id}
  onClick={() => { setActiveTab(tab.id as TabId); setIsConsoleOpen(true); }}
  className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 cursor-pointer
    ${activeTab === tab.id
      ? (isSuccess && tab.id === 'output' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-blue-500 text-white bg-blue-500/5')
      : 'border-transparent text-slate-500 hover:text-slate-300'}`}
>
  <tab.icon className={`w-3.5 h-3.5 ${isSuccess && tab.id === 'output' && activeTab === tab.id ? 'text-emerald-400' : ''}`} />
  {tab.label}
</button>
              ))}
            </div>

            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="p-2 my-auto text-slate-500 hover:text-slate-300 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
              title={isConsoleOpen ? "Minimizar consola" : "Maximizar consola"}
            >
              {isConsoleOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>

          <div className={`flex-1 overflow-auto bg-[#0a0f1d] p-4 font-mono text-sm custom-scrollbar ${isConsoleOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
             {activeTab === 'output' && (
               <>
                 <p className={`mb-4 ${isSuccess ? 'text-emerald-400 font-black' : 'text-slate-400'}`}>{mensajeConsola}</p>
                 {resultadosQuery.length > 0 && <table className="w-full text-left text-[11px] text-slate-300"><thead className="bg-slate-800 text-slate-400 uppercase tracking-tighter"><tr>{columnasQuery.map(c => <th key={c} className="p-2 border border-slate-700 font-bold">{c}</th>)}</tr></thead><tbody>{resultadosQuery.slice(0, 10).map((r, i) => <tr key={i} className="hover:bg-slate-800/40 transition-colors">{columnasQuery.map(c => <td key={c} className="p-2 border border-slate-800/50">{String(r[c])}</td>)}</tr>)}</tbody></table>}
               </>
             )}
             {activeTab === 'objetivo' && (
               <>
                 <p className="mb-4 text-blue-400 flex items-center gap-2 font-sans font-black text-xs uppercase tracking-widest"><Target className="w-4 h-4"/> Tabla Objetivo:</p>
                 {resultadoEsperado.length > 0 ? <table className="w-full text-left text-[11px] text-slate-300"><thead className="bg-slate-800 text-slate-400 uppercase tracking-tighter"><tr>{columnasEsperadas.map(c => <th key={c} className="p-2 border border-slate-700 font-bold">{c}</th>)}</tr></thead><tbody>{resultadoEsperado.slice(0, 10).map((r, i) => <tr key={i} className="hover:bg-slate-800/40 transition-colors">{columnasEsperadas.map(c => <td key={c} className="p-2 border border-slate-800/50">{String(r[c])}</td>)}</tr>)}</tbody></table> : <div className="animate-pulse text-slate-500 italic">Cargando solución esperada...</div>}
               </>
             )}
             {activeTab === 'pista' && <p className="text-amber-400/90 font-sans flex items-center gap-3 bg-amber-900/10 p-4 rounded-xl border border-amber-900/30 shadow-inner"><Lightbulb className="w-6 h-6 shrink-0"/> <span className="font-medium text-sm leading-relaxed"><ReactMarkdown>{ejercicio.pista}</ReactMarkdown></span></p>}
          </div>
        </section>
      </main>

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="relative overflow-hidden bg-slate-900 border border-blue-500/30 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(59,130,246,0.2)] max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-blue-500/5 shadow-inner">
                <BookOpen className="w-10 h-10 text-blue-400" />
            </div>

            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">¡Bienvenido a SeeQL!</h3>

            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Para que te familiarices con la interfaz, el <b>primer ejercicio</b> de cada lección aparecerá siempre <b>ya resuelto</b>.
            </p>

            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Aprovéchalo para explorar las tablas en la pizarra y ver cómo se transforman los datos. En los ejercicios <b>2 y 3</b>, ¡será tu turno de escribir el código!
            </p>

            <button
              onClick={cerrarOnboarding}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-widest"
            >
              ¡Entendido, vamos allá! <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 animate-in fade-in duration-300 pointer-events-none">
          <div className="relative overflow-hidden bg-slate-900 border border-emerald-500/40 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_80px_-15px_rgba(16,185,129,0.5)] max-w-md w-full text-center animate-in zoom-in-95 duration-300 pointer-events-auto">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-70"></div>

            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/5 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">¡Misión Cumplida!</h3>

            <p className="text-slate-300 mb-8 text-sm leading-relaxed">
              {ejercicioActualIdx < leccion.ejercicios.length - 1
                ? `Has superado el ejercicio ${ejercicioActualIdx + 1} correctamente.`
                : '¡Has completado toda la lección!'}
            </p>

            <div className="flex flex-col gap-3">
              {ejercicioActualIdx < leccion.ejercicios.length - 1 ? (
                <button
                  onClick={() => { setShowSuccessPopup(false); setEjercicioActualIdx(f => f + 1); setIsExploring(false); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-widest"
                >
                  Siguiente Ejercicio <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={finalizarLeccion}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-widest"
                >
                  Finalizar Lección <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => { setShowSuccessPopup(false); setIsExploring(true); }}
                className="text-slate-400 hover:text-white mt-2 text-xs font-bold uppercase tracking-widest transition-colors py-2 cursor-pointer"
              >
                Quedarme explorando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
