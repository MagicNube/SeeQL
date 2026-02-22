import React from 'react';
import { Link } from 'react-router-dom';
import { Database, LogIn, UserPlus, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Database className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SeeQL</span>
          </Link>

          {/* Navegación Derecha */}
          <div className="flex items-center gap-4">

            {/* Selector de Idioma (Estético) */}
            <button className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold">ES</span>
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            {/* Renderizado Condicional según Autenticación */}
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2 border border-blue-400/20"
                >
                  <UserPlus className="w-4 h-4" />
                  Empezar gratis
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Estudiante</span>
                  <span className="text-sm text-white font-bold">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="p-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl transition-all border border-slate-700 hover:border-red-500/20 group"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
