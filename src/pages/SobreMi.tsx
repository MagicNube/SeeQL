import { Github, Mail, ExternalLink, Code2, Terminal, Cpu } from 'lucide-react';

export const SobreMi = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Fondos decorativos coherentes con el Dashboard */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl w-full z-10">
        <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-4xl overflow-hidden shadow-2xl">

          {/* Header del Perfil */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-cyan-500">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-3xl bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-xl">
                <Terminal className="w-12 h-12 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="pt-16 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Jesús</h1>
                <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">Creador de SeeQL</p>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://github.com/MagicNube/SeeQL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="mailto:tu-correo@ejemplo.com"
                  className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="space-y-6 text-slate-300">
              <p className="leading-relaxed">
                ¡Hola! Soy el desarrollador detrás de <span className="text-white font-bold">SeeQL</span>. Este proyecto nació como parte de mi TFG con el objetivo de facilitar el aprendizaje de las bases de datos relacionales a través de la visualización interactiva.
              </p>

              <p className="leading-relaxed">
                Me apasiona construir herramientas que transformen conceptos abstractos y complejos en experiencias visuales intuitivas. Creo firmemente que la mejor forma de aprender SQL es viendo cómo fluyen los datos en tiempo real.
              </p>

              {/* Tags de Tecnologías */}
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Stack Tecnológico</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'SQLite', 'Lucide'].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-slate-900/50 border border-slate-700 text-slate-400 text-xs font-bold rounded-lg hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-700/50 flex justify-center">
              <button
                onClick={() => window.history.back()}
                className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
