import { useNavigate } from 'react-router-dom';
import { SearchX, Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050a15] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Brillo de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 bg-[#1e293b] border border-slate-700/50 p-10 md:p-16 rounded-[2.5rem] shadow-2xl max-w-2xl w-full text-center flex flex-col items-center">

        <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20 shadow-inner rotate-3 hover:rotate-6 transition-transform">
          <SearchX className="w-12 h-12 text-blue-400" />
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">404</h1>

        {/* Guiño SQL */}
        <div className="bg-[#0f172a] border border-slate-700 px-6 py-4 rounded-xl mb-8 font-mono text-sm text-left shadow-inner w-full max-w-sm">
          <p>
            <span className="text-blue-400 font-bold">SELECT</span> * <br/>
            <span className="text-blue-400 font-bold">FROM</span> paginas <br/>
            <span className="text-blue-400 font-bold">WHERE</span> url = <span className="text-orange-400">'actual'</span>;
          </p>
          <div className="w-full h-[1px] bg-slate-700 my-3"></div>
          <p className="text-slate-500 text-xs italic">
            -- Error: 0 filas devueltas
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ruta no encontrada</h2>
        <p className="text-slate-400 text-base md:text-lg mb-10 max-w-md">
          Parece que la página que estás intentando consultar no existe en nuestra base de datos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-xl transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" /> Volver atrás
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-5 h-5" /> Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
