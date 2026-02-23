import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ArrowRight, UserCircle } from 'lucide-react';
import { Login } from './Login'; // Reutilizaremos tus componentes
import { Register } from './Register';

export const Landing = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* COLUMNA IZQUIERDA: MARCA */}
        <div className="hidden lg:block space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Database className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide uppercase">TFG Project • 2026</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-tight">
            Domina SQL <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
              viendo los datos
            </span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
            La plataforma interactiva que transforma consultas complejas en diagramas visuales comprensibles.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Únete a otros estudiantes <br /> en este entorno interactivo.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: AUTH */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">

            {/* Toggle Login/Register */}
            <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Entrar
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Registrarse
              </button>
            </div>

            {/* Formulario Dinámico */}
            {isLogin ? <Login embed /> : <Register embed />}

            {/* Opción Invitado */}
            <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-semibold transition-colors group"
              >
                <UserCircle className="w-5 h-5" />
                Continuar como invitado
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
