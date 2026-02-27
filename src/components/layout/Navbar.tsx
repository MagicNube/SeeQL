import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Estado local simple para cambiar la selección visualmente
  const [lang, setLang] = useState<'ES' | 'EN'>('ES');

  return (
    <nav className="bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
              <Database className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SeeQL</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Botón que cambia entre ES y EN al hacer clic */}
            <button
              onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700 select-none"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest w-4 text-center">
                {lang}
              </span>
            </button>

            {!isLanding && user && (
              <div className="flex items-center gap-4 ml-1">
                <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-sm text-slate-300 font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
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
