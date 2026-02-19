import { useState } from 'react';
import { SqlEditor } from '../components/editor/SqlEditor';
import { Play, Table, Database } from 'lucide-react'; // Iconos para darle vida

export const Sandbox = () => {
  const [codigo, setCodigo] = useState("SELECT * FROM usuarios;");

  const ejecutarQuery = () => {
    console.log("Ejecutando:", codigo);
    // Aquí conectaremos con useSql más adelante
  };

  return (
    <div className="flex flex-col h-[calc(100-64px)] bg-slate-900 text-white overflow-hidden">

      {/* 1. Barra de Herramientas Local */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">DB: local_sandbox.sqlite</span>
          </div>
        </div>
        <button
          onClick={ejecutarQuery}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all font-bold shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          Ejecutar Query
        </button>
      </div>

      {/* 2. Área Principal de Trabajo */}
      <main className="flex flex-1 overflow-hidden">

        {/* Panel Izquierdo: Explorador de tablas */}
        <aside className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 hidden lg:block overflow-y-auto">
          <h2 className="text-xs font-bold mb-4 text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Table className="w-3 h-3" />
            Tablas Disponibles
          </h2>
          <div className="space-y-1">
            {['usuarios', 'pedidos', 'productos'].map((tabla) => (
              <div
                key={tabla}
                className="group flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 border border-transparent hover:border-slate-600 cursor-pointer transition-all"
              >
                <span className="text-sm text-slate-300 group-hover:text-blue-400">📄 {tabla}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Panel Central: Editor y Resultados */}
        <section className="flex-1 flex flex-col min-w-0 p-4 gap-4">

          {/* El Editor que creamos antes */}
          <div className="flex-1 min-h-0">
            <SqlEditor codigo={codigo} setCodigo={setCodigo} />
          </div>

          {/* Panel de Resultados inferior */}
          <div className="h-1/3 min-h-[150px] bg-slate-800/30 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Resultados de la consulta
              </h3>
            </div>
            <div className="flex-1 p-4 font-mono text-sm text-slate-500 overflow-auto">
               <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                 Lista de resultados vacía
               </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};
