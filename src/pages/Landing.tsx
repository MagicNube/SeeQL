import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ArrowRight, UserCircle } from 'lucide-react';
import { Login } from './Login';
import { Register } from './Register';

export const Landing = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* COLUMNA IZQUIERDA */}
        <div className="hidden lg:flex flex-col items-center text-center justify-center space-y-6 px-8">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Database className="w-5 h-5" />
            <span className="text-sm font-bold tracking-widest uppercase tracking-tighter">SeeQL</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            Domina SQL <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
              viendo los datos
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-90 mx-auto">
            Transforma consultas complejas en diagramas visuales comprensibles.
          </p>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="flex flex-col w-full max-w-95 mx-auto lg:mr-auto">
          <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 p-6 sm:px-8 sm:py-6 rounded-4xl shadow-2xl relative">

            {/* SELECTOR DE AUTH - Reducido mb-8 a mb-4 */}
            <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-4 relative z-10">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Entrar
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Registrarse
              </button>
            </div>

            {/* TEXTO DE BIENVENIDA - Reducido mb-6 a mb-3 */}
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-white leading-tight">
                {isLogin ? 'Continúa por donde lo dejaste' : 'Empieza tu viaje con SeeQL'}
              </h2>
            </div>

            {/* min-h ajustado para ser más compacto */}
            <div className="min-h-fit flex flex-col justify-center py-2">
              {isLogin ? <Login /> : <Register />}
            </div>

            {/* Pie reducido de mt-6 a mt-3 */}
            <div className="mt-3 pt-4 border-t border-slate-700/50 text-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold transition-colors group cursor-pointer"
              >
                <UserCircle className="w-4 h-4" />
                Continuar como invitado
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
