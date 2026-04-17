import { useState } from 'react';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 1. Añadimos la interfaz para las propiedades
interface RegisterProps {
  onSuccess: () => void;
}

// 2. Recibimos onSuccess por parámetros
export const Register = ({ onSuccess }: RegisterProps) => {
  const { signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.name
      });

      // Limpiamos los campos
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });

      // 3. Avisamos a Landing de que todo ha ido bien
      onSuccess();

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error en el registro.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error con Google:', error);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        {message && message.type === 'error' && (
          <div className="p-3 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
            {message.text}
          </div>
        )}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Nombre completo"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="password"
            placeholder="Contraseña"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Crear cuenta'}
        </button>
      </form>

      <div className="flex flex-col items-center mt-6 gap-4">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">O regístrate con</span>
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  );
};
