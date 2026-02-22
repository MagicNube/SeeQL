import { Link } from 'react-router-dom';
import { Database, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f172a] flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Decoración de fondo (Efecto de luces difuminadas) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />

      {/* Hero Section */}
      <div className="text-center z-10 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Plataforma Interactiva TFG
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Aprende SQL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">viendo</span> lo que ocurre
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Domina las bases de datos con feedback visual en tiempo real.
          Experimenta libremente o supera nuestros retos diseñados para ti.
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full z-10">

        {/* TARJETA MODO APRENDIZAJE */}
        <div className="group relative bg-slate-800/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 flex flex-col items-start shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />

          <div className="bg-blue-500/20 p-4 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-10 h-10 text-blue-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Modo Aprendizaje</h2>
          <p className="text-slate-400 text-lg mb-10 text-left leading-relaxed">
            Un camino guiado por niveles. Resuelve acertijos SQL y desbloquea nuevos conceptos paso a paso.
          </p>

          <Link
            to="/lecciones"
            className="mt-auto w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-600/20 active:scale-95"
          >
            Empezar Curso <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* TARJETA SANDBOX */}
        <div className="group relative bg-slate-800/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 flex flex-col items-start shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />

          <div className="bg-emerald-500/20 p-4 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
            <Database className="w-10 h-10 text-emerald-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Sandbox Libre</h2>
          <p className="text-slate-400 text-lg mb-10 text-left leading-relaxed">
            Entorno sin restricciones. Crea tablas, inserta datos o carga tus propios archivos CSV para practicar.
          </p>

          <Link
            to="/sandbox"
            className="mt-auto w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-600/20 active:scale-95"
          >
            Abrir Editor <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
