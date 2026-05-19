// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sandbox } from '../pages/Sandbox';
import { dbManager } from '../services/dbManager';
import { supabase } from '../lib/supabase';

vi.mock('../components/editor/SqlEditor', () => ({
  SqlEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="sql-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}));

vi.mock('../services/dbManager', () => ({
  dbManager: {
    createLocalDbFromSupabase: vi.fn()
  }
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}));

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

describe('Pruebas de Integración: SeeQL Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Flujo Principal: Ejecución de un INNER JOIN y renderizado visual', async () => {
    const user = userEvent.setup();

    (supabase.rpc as any).mockResolvedValue({ data: { 'libros': [], 'autores': [] } });

    const mockExec = vi.fn().mockReturnValue([{
      columns: ['titulo', 'nombre_autor'],
      values: [['El Quijote', 'Cervantes']]
    }]);

    (dbManager.createLocalDbFromSupabase as any).mockResolvedValue({
      exec: mockExec
    });

    render(<Sandbox />);

    const btnEjecutar = await screen.findByText(/EJECUTAR QUERY/i);
    expect(btnEjecutar).toBeDefined();

    const editor = screen.getByTestId('sql-editor');

    await user.clear(editor);
    const queryPrueba = 'SELECT * FROM libros INNER JOIN autores ON libros.id_autor = autores.id';
    await user.type(editor, queryPrueba);

    await user.click(btnEjecutar);

    expect(mockExec).toHaveBeenCalledWith(queryPrueba);

    const etiquetaVisualJoin = await screen.findByText('JOIN Activo');
    expect(etiquetaVisualJoin).toBeDefined();

    const resultadoConsola = await screen.findByText('El Quijote');
    expect(resultadoConsola).toBeDefined();
  });
});
