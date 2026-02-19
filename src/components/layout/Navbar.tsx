import { Link, useLocation } from 'react-router-dom';
import { Database, GraduationCap, LayoutGrid, LogIn } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  // Función para saber si un link está activo y pintarlo de azul
  const isActive = (path: string) => location.pathname === path
    ? "text-blue-600 bg-blue-50"
    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* LOGO */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Database className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">SeeQL</span>
            </Link>
          </div>

          {/* MENÚ CENTRAL */}
          <div className="hidden md:flex items-center space-x-2">

            <Link to="/lecciones" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/lecciones')}`}>
              <GraduationCap className="w-4 h-4" />
              Lecciones
            </Link>

            <Link to="/sandbox" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/sandbox')}`}>
              <LayoutGrid className="w-4 h-4" />
              Sandbox
            </Link>

          </div>

          {/* BOTÓN LOGIN (DERECHA) */}
          <div className="flex items-center">
            <Link to="/login" className="ml-4 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 flex items-center gap-2 transition shadow-sm hover:shadow-md">
              <LogIn className="w-4 h-4" />
              Entrar
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};
