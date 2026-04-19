import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sandbox } from './pages/Sandbox';
import { Dashboard } from './pages/Dashboard';
import Lecciones from './pages/Lecciones';
import { Landing } from './pages/Landing';
import { Navbar } from './components/layout/Navbar';
import { SobreMi } from './pages/SobreMi';
import {LeccionView} from './pages/LeccionView.tsx';
import { NotFound } from './pages/NotFound';

// Componente para proteger rutas privadas (Lecciones)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  // Si no hay sesión, mandamos al usuario a la Landing para que se identifique
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Componente para la Landing: si ya estás logueado, te lleva al Dashboard directamente
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Contenedor global con el color de fondo correcto del tema */}
        <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Entrada principal: gestiona Login/Register visualmente */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Landing />
                  </PublicRoute>
                }
              />

              {/* Redirecciones automáticas para mantener compatibilidad con enlaces del Navbar */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />

              {/* Rutas de acceso libre (Invitados) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/sobre-mi" element={<SobreMi />} />

              {/* Rutas de aprendizaje (Solo alumnos registrados) */}
              <Route
                path="/lecciones"
                element={
                  <ProtectedRoute>
                    <Lecciones />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lecciones/:id"
                element={
                  <ProtectedRoute>
                    <LeccionView />
                  </ProtectedRoute>
                }
              />

              {/* En caso de ruta no encontrada, volvemos al inicio */}
            <Route path="*" element={<NotFound />} />            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
