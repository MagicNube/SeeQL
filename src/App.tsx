import { useState } from 'react'
import Editor from '@monaco-editor/react' // <--- 1. Importamos la librería

function App() {
  const [codigo, setCodigo] = useState("SELECT * FROM usuarios;") // Estado para guardar lo que escribe el alumno

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* 1. Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">
          SQL Learning TFG
        </h1>
        <button className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-500 transition-colors font-semibold">
          Ejecutar Query ▶
        </button>
      </header>

      {/* 2. Área Principal */}
      <main className="flex flex-1 overflow-hidden">
        {/* Panel Izquierdo */}
        <aside className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 hidden md:block">
          <h2 className="font-semibold mb-4 text-slate-300">Tablas Disponibles</h2>
          <div className="text-sm text-slate-400 space-y-2">
            <div className="p-2 bg-slate-800 rounded border border-slate-700 cursor-pointer hover:border-blue-500">
              📄 usuarios
            </div>
            <div className="p-2 bg-slate-800 rounded border border-slate-700 cursor-pointer hover:border-blue-500">
              📄 pedidos
            </div>
          </div>
        </aside>

        {/* Panel Central */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* AQUI ESTÁ EL CAMBIO IMPORTANTE: El Editor */}
          <div className="flex-1 p-0 relative">
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={codigo}
              onChange={(valor) => setCodigo(valor || "")}
              options={{
                minimap: { enabled: false }, // Quita el mapa pequeño de la derecha
                fontSize: 16,
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Panel de Resultados */}
          <div className="h-1/3 border-t border-slate-700 p-4 bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Resultados</h3>
            <div className="h-full bg-slate-950 rounded border border-slate-800 p-4 font-mono text-sm text-slate-500">
              // Aquí aparecerán los resultados de la consulta...
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
