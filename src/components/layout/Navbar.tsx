import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Database, Globe, LogOut, Sun, Moon, Github, Info, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  const [lang, setLang] = useState<'ES' | 'EN'>('ES');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO - Redirige a / */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 rounded-xl group-hover:rotate-12 group-hover:scale-105 transition-all shadow-lg shadow-blue-500/20">
              <Database className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SeeQL</span>
          </Link>

          {/* ENLACES CENTRALES */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors">
              <Info className="w-4 h-4" />
              Sobre mí
            </a>
            <a
              href="https://github.com/MagicNube/SeeQL"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              Repositorio
            </a>
          </div>

          {/* ACCIONES DERECHA */}
          <div className="flex items-center gap-2 sm:gap-4">

            <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Cambiar tema"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              <div className="w-px h-4 bg-slate-700 mx-1"></div>

              <button
                onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-slate-700 select-none cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                  {lang}
                </span>
              </button>
            </div>

            {!user ? (
              !isLanding && (
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
              )
            ) : (
              <div className="flex items-center gap-4 ml-2">
                <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
                <div className="flex items-center gap-3 bg-slate-800/30 pl-3 pr-1 py-1 rounded-full border border-slate-800">
                  <span className="hidden sm:inline-block text-xs text-slate-300 font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-colors cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
