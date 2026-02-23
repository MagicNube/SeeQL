import { Link } from 'react-router-dom';
import { GraduationCap, LayoutGrid, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Fondo decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-emerald-600/10 rounded-full blur-[120px]" />

      <div className="max-w-5xl w-full z-10">
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6 inline-block">
            Panel de Control
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            ¿Qué quieres hacer hoy?
          </h1>
          <p className="text-slate-400 text-lg">
            {user ? `Bienvenido de nuevo, ${user.user_metadata.full_name || 'estudiante'}` : 'Explora SeeQL como invitado o identifícate para guardar tu progreso'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* MÓDULO LECCIONES */}
          <div className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 ${
            user
            ? 'bg-slate-800/40 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60'
            : 'bg-slate-900/40 border-slate-800 opacity-75 grayscale-[0.5]'
          }`}>
            <div className="bg-blue-600/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="text-blue-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              Modo Aprendizaje
              {!user && <Lock className="w-4 h-4 text-slate-500" />}
            </h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Sigue un camino guiado por niveles. Resuelve acertijos SQL y desbloquea conceptos paso a paso.
            </p>

            {user ? (
              <Link to="/lecciones" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                Continuar curso <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/login" className="w-full py-4 bg-slate-700 text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-2 border border-slate-600 hover:bg-slate-600 transition-all">
                Inicia sesión para entrar
              </Link>
            )}
          </div>

          {/* MÓDULO SANDBOX (Siempre libre) */}
          <div className="group relative p-8 rounded-[2.5rem] bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-500">
            <div className="bg-emerald-600/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <LayoutGrid className="text-emerald-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Sandbox Libre</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Entorno sin restricciones. Crea tablas, inserta datos o carga tus propios archivos CSV para practicar libremente.
            </p>
            <Link to="/sandbox" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
              Abrir editor <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
