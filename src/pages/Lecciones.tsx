import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LECCIONES } from '../data/lecciones';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, Play, CheckCircle2, Database } from 'lucide-react';

export default function Lecciones() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leccionesCompletadas, setLeccionesCompletadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgreso();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProgreso = async () => {
    try {
      const { data, error } = await supabase
        .from('progreso_usuarios')
        .select('lesson_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        setLeccionesCompletadas(data.map(fila => fila.lesson_id));
      }
    } catch (error) {
      console.error('Error al cargar el progreso:', error);
    } finally {
      setLoading(false);
    }
  };

  const nivelActual = leccionesCompletadas.length > 0
    ? Math.max(...leccionesCompletadas) + 1
    : 1;

  const handleComenzarLeccion = (id: number) => {
    if (id <= nivelActual) {
      navigate(`/lecciones/${id}`);
    }
  };

  const progresoPorcentaje = Math.round((leccionesCompletadas.length / LECCIONES.length) * 100);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="text-cyan-400 animate-pulse text-xl font-bold">Cargando itinerario...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col font-sans w-full">
      <main className="flex-1 p-8 text-white max-w-7xl mx-auto w-full">
        <div className="mb-10 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
                Itinerario SQL
              </h1>
              <p className="text-slate-400 mt-2">Domina el álgebra relacional paso a paso.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-cyan-400">{progresoPorcentaje}%</span>
              <p className="text-sm text-slate-500">Completado</p>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-linear-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progresoPorcentaje}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {LECCIONES.map((leccion) => {
            const estado = leccionesCompletadas.includes(leccion.id)
              ? 'completada'
              : leccion.id === nivelActual
                ? 'disponible'
                : 'bloqueada';

            return (
              <div key={leccion.id} onClick={() => handleComenzarLeccion(leccion.id)}
                className={`relative flex flex-col rounded-xl border p-5 transition-all duration-300 ${
                  estado === 'bloqueada' ? 'bg-slate-800/50 border-slate-700/50 opacity-60 cursor-not-allowed' :
                  estado === 'completada' ? 'bg-slate-800 border-green-500/30 hover:border-green-500/60 cursor-pointer' :
                  'bg-slate-800 border-cyan-500/50 hover:border-cyan-400 cursor-pointer shadow-md'
                }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${estado === 'bloqueada' ? 'bg-slate-700 text-slate-400' : 'bg-cyan-900/50 text-cyan-400'}`}>
                    Nivel {leccion.id}
                  </span>
                  <div>
                    {estado === 'bloqueada' && <Lock className="w-5 h-5 text-slate-500" />}
                    {estado === 'completada' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    {estado === 'disponible' && <Play className="w-6 h-6 text-cyan-400" fill="currentColor" />}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${estado === 'bloqueada' ? 'text-slate-300' : 'text-white'}`}>{leccion.titulo}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{leccion.concepto}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Database className="w-4 h-4 text-slate-500 mr-1" />
                    <span className="text-xs text-slate-400">3 Ejercicios</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
