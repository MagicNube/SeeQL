import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, LayoutGrid, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Dashboard = () => {
  const { user } = useAuth();
  const [leccionesCompletadas, setLeccionesCompletadas] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchProgreso();
    }
  }, [user]);

  const fetchProgreso = async () => {
    try {
      const { count, error } = await supabase
        .from('progreso_usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      setLeccionesCompletadas(count || 0);
    } catch (error) {
      console.error('Error al cargar progreso en dashboard:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Luces de ambiente */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full z-10">
        <div className="text-center mb-12">
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">
            Panel de Control
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            ¿Qué quieres hacer hoy?
          </h1>
          <p className="text-slate-400 text-lg">
            {user
              ? `Bienvenido de nuevo, ${user.user_metadata?.full_name || user.email?.split('@')[0]}`
              : 'Explora SeeQL como invitado o identifícate para guardar tu progreso'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* MÓDULO LECCIONES */}
          <div className={`group relative p-8 rounded-4xl border transition-all duration-500 overflow-hidden ${
            user
            ? 'bg-slate-800/40 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-2xl'
            : 'bg-slate-900/40 border-slate-800 opacity-80'
          }`}>
            <GraduationCap className="absolute -right-8 -top-8 w-40 h-40 text-blue-500/5 -rotate-12 group-hover:text-blue-500/10 transition-colors" />
            <div className="bg-blue-600/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <GraduationCap className="text-blue-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Modo Aprendizaje</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Sigue el plan de estudios basado en el modelo relacional. 10 lecciones interactivas con validación en tiempo real.
            </p>
            {user ? (
              <Link to="/lecciones" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                Continuar curso <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/" className="w-full py-4 bg-slate-800/50 text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95">
                Inicia sesión para entrar
              </Link>
            )}
          </div>

          {/* MÓDULO SANDBOX */}
          <div className="group relative p-8 rounded-4xl bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-500 overflow-hidden shadow-2xl">
            <Zap className="absolute -right-8 -top-8 w-40 h-40 text-emerald-500/5 -rotate-12 group-hover:text-emerald-500/10 transition-colors" />
            <div className="bg-emerald-600/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <LayoutGrid className="text-emerald-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Sandbox Libre</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Entorno sin restricciones. Crea tablas, inserta datos o carga tus propios archivos para practicar libremente.
            </p>
            <Link to="/sandbox" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
              Abrir editor <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer de progreso - Versión Ampliada */}
{user && (
  <div className="mt-16 flex justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 px-10 py-6 rounded-4xl flex items-center gap-6 shadow-2xl ring-1 ring-white/5">
      <div className="flex flex-col">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center sm:text-left">
          Tu Progreso en las lecciones
        </span>
        <div className="flex items-center gap-6">
          <div className="w-48 h-2.5 bg-slate-900/80 rounded-full overflow-hidden shadow-inner border border-slate-700/30">
            <div
              className="h-full bg-linear-to-r from-blue-600 via-blue-400 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              style={{ width: `${(leccionesCompletadas / 10) * 100}%` }}
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{leccionesCompletadas}</span>
            <span className="text-slate-500 font-bold">/ 10</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};
