import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, UserCircle, CheckCircle2 } from 'lucide-react';
import { Login } from './Login';
import { Register } from './Register';

export const Landing = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const closePopupAndLogin = () => {
    setShowSuccessPopup(false);
    setIsLogin(true);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center p-4 overflow-hidden relative">

      {/* --- NUEVO FONDO DINÁMICO --- */}
      {/* 1. Cuadrícula sutil (Estilo DevTools) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0" />

      {/* 2. Orbes de luz ambiental */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none z-0" />
      {/* ---------------------------- */}

      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">

        <div className="hidden lg:flex flex-col items-center text-center justify-center space-y-6 px-8">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 backdrop-blur-md">
            <Database className="w-5 h-5" />
            <span className="text-sm font-bold tracking-widest uppercase tracking-tighter">SeeQL</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-lg">
            Domina SQL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              viendo los datos
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-90 mx-auto">
            Transforma consultas complejas en diagramas visuales comprensibles.
          </p>
        </div>

        <div className="flex flex-col w-full max-w-95 mx-auto lg:mr-auto">
          {/* Añadido un sutil borde luminoso superior a la tarjeta */}
          <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 p-6 sm:px-8 sm:py-6 rounded-4xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

            <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-4 relative z-10 border border-slate-800/50">
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

            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-white leading-tight">
                {isLogin ? 'Continúa por donde lo dejaste' : 'Empieza tu viaje con SeeQL'}
              </h2>
            </div>

            <div className="min-h-fit flex flex-col justify-center py-2">
              {isLogin ? <Login /> : <Register onSuccess={() => setShowSuccessPopup(true)} />}
            </div>

            <div className="mt-3 pt-4 border-t border-slate-700/50 flex flex-col items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold transition-colors group cursor-pointer"
              >
                <UserCircle className="w-4 h-4" />
                Continuar como invitado
              </button>

              <button
                onClick={() => setShowSuccessPopup(true)}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest cursor-pointer"
              >
                [Dev] Ver Popup
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL GLOBAL */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative overflow-hidden bg-slate-900 border border-slate-700/50 p-8 rounded-3xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">¡Cuenta creada!</h3>

            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Tu registro se ha completado correctamente. Por favor, confirma tu correo electrónico antes de acceder a la plataforma.
            </p>

            <button
              onClick={closePopupAndLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 cursor-pointer active:scale-[0.98]"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
