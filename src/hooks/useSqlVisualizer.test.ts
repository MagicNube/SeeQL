// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { evaluateWhere, useSqlVisualizer } from './useSqlVisualizer';

describe('useSqlVisualizer hook', () => {

  it('debería resetear todo con una query vacía', () => {
    const { result } = renderHook(() => useSqlVisualizer('   '));
    expect(result.current.activeTables).toEqual([]);
    expect(result.current.whereAST).toBeNull();
    expect(result.current.joinDetails).toBeNull();
    expect(result.current.selectedColumns).toEqual([]);
    expect(result.current.isSelectAll).toBe(true);
    expect(result.current.orderBy).toBeNull();
    expect(result.current.groupBy).toEqual([]);
    expect(result.current.aggregations).toEqual([]);
    expect(result.current.havingAST).toBeNull();
    expect(result.current.limit).toBeNull();
  });

  it('debería parsear SELECT de varias columnas', () => {
    const query = 'SELECT libros.titulo AS title, anio_publicacion FROM libros';
    const { result } = renderHook(() => useSqlVisualizer(query));

    expect(result.current.activeTables).toEqual(['libros']);
    expect(result.current.selectedColumns).toEqual([
      { table: 'libros', column: 'titulo' },
      { table: null, column: 'anio_publicacion' }
    ]);
    expect(result.current.isSelectAll).toBe(false);
  });

  it('debería parsear SELECT *', () => {
    const { result } = renderHook(() => useSqlVisualizer('SELECT * FROM usuarios'));
    expect(result.current.isSelectAll).toBe(true);

    const { result: res2 } = renderHook(() => useSqlVisualizer('SELECT usuarios.* FROM usuarios'));
    expect(res2.current.isSelectAll).toBe(true);
  });

  it('debería parsear JOINS (INNER y LEFT)', () => {
    const q1 = 'SELECT * FROM usuarios INNER JOIN pedidos ON usuarios.id = pedidos.usuario_id';
    const { result: r1 } = renderHook(() => useSqlVisualizer(q1));
    expect(r1.current.activeTables).toEqual(['usuarios', 'pedidos']);
    expect(r1.current.joinDetails).toEqual({
      type: 'INNER JOIN', leftTable: 'usuarios', rightTable: 'pedidos', leftColumn: 'id', rightColumn: 'usuario_id'
    });

    const q2 = 'SELECT * FROM usuarios LEFT JOIN pedidos ON pedidos.usuario_id = usuarios.id';
    const { result: r2 } = renderHook(() => useSqlVisualizer(q2));
    expect(r2.current.joinDetails).toEqual({
      type: 'LEFT JOIN', leftTable: 'usuarios', rightTable: 'pedidos', leftColumn: 'id', rightColumn: 'usuario_id'
    });
  });

  it('debería parsear JOIN pero de otras expresiones', () => {
    const query = 'SELECT * FROM usuarios JOIN pedidos';
    const { result } = renderHook(() => useSqlVisualizer(query));
    expect(result.current.activeTables).toEqual(['usuarios', 'pedidos']);
  });

  it('debería parsear ORDER BY, GROUP BY, LIMIT y Funciones de Agregación', () => {
    const query = 'SELECT COUNT(id), desc, SUM(pedidos.precio) FROM pedidos GROUP BY pedidos.usuario_id, estado HAVING MAX(precio) > 100 ORDER BY fecha DESC LIMIT 10';
    const { result } = renderHook(() => useSqlVisualizer(query));

    expect(result.current.limit).toBe(10);
    expect(result.current.orderBy).toEqual({ column: 'fecha', direction: 'DESC' });
    expect(result.current.groupBy).toEqual(['usuario_id', 'estado']);
    expect(result.current.aggregations).toEqual([
      { func: 'COUNT', column: 'id', raw: 'COUNT(id)' },
      { func: 'SUM', column: 'precio', raw: 'SUM(pedidos.precio)' }
    ]);
  });

  it('debería parsear correctamente un parser node-sql-parser donde setWhereAST es llamado', () => {
    const query = 'SELECT * FROM libros WHERE anio > 2000';
    const { result } = renderHook(() => useSqlVisualizer(query));
    expect(result.current.whereAST).toBeDefined();
    expect(result.current.whereAST.type).toBe('binary_expr');
  });

  it('debería capturar catch error si hay un error en node-sql-parser', () => {
    const { result } = renderHook(() => useSqlVisualizer('FROM = * SELECT'));
    expect(result.current.whereAST).toBeNull();
  });
});

describe('Evaluador de condiciones WHERE (evaluateWhere)', () => {
  const filaEjemplo = {
    'libros.titulo': 'Harry Potter',
    'libros.anio_publicacion': 1997,
    'libros.copias': 5,
    'autor_id': 1
  };

  it('debería devolver true si no hay AST', () => {
    expect(evaluateWhere(filaEjemplo, null)).toBe(true);
  });

  it('debería devolver el valor de un boolean AST', () => {
    expect(evaluateWhere(filaEjemplo, { type: 'bool', value: true })).toBe(true);
    expect(evaluateWhere(filaEjemplo, { type: 'boolean', value: false })).toBe(false);
  });

  it('debería evaluar columna sola sin tabla si está duplicada o existe en la fila', () => {
    expect(evaluateWhere(filaEjemplo, { type: 'column_ref', column: 'autor_id' })).toBe(1);
    expect(evaluateWhere({ 'a.id': 1, 'b.id': 2 }, { type: 'column_ref', column: 'id' })).toBe(false);

    const astOr = {
      type: 'binary_expr',
      operator: 'OR',
      left: { type: 'binary_expr', operator: '=', left: { type: 'column_ref', column: 'missing' }, right: { type: 'number', value: 1 } },
      right: { type: 'binary_expr', operator: '=', left: { type: 'column_ref', column: 'autor_id' }, right: { type: 'number', value: 1 } }
    };
    expect(evaluateWhere(filaEjemplo, astOr)).toBe(true);
  });

  it('debería devolver false en comparación si leftVal es un column_ref inválido', () => {
    const missingColAst = {
      type: 'binary_expr', operator: '=',
      left: { type: 'column_ref', column: 'invento_columna' },
      right: { type: 'number', value: 2 }
    };
    expect(evaluateWhere(filaEjemplo, missingColAst)).toBe(false);
  });

  it('debería operar comparaciones (>, <, >=, <=, !=, <>, =)', () => {
    const runOp = (op: string, l: any, r: any) => evaluateWhere(filaEjemplo, {
      type: 'binary_expr', operator: op,
      left: { type: 'number', value: l }, right: { type: 'number', value: r }
    });

    expect(runOp('>', 5, 2)).toBe(true);
    expect(runOp('<', 2, 5)).toBe(true);
    expect(runOp('>=', 5, 5)).toBe(true);
    expect(runOp('<=', 5, 5)).toBe(true);
    expect(runOp('!=', 5, 2)).toBe(true);
    expect(runOp('<>', 5, 2)).toBe(true);
    expect(runOp('=', 5, 5)).toBe(true);
    expect(runOp('UNKNOWN_OP', 5, 5)).toBe(true);
  });

  it('debería resolver strings en literales o single_quote_string', () => {
    const stringOp = {
      type: 'binary_expr', operator: '=',
      left: { type: 'string', value: 'a' }, right: { type: 'single_quote_string', value: 'a' }
    };
    expect(evaluateWhere(filaEjemplo, stringOp)).toBe(true);
  });

  it('debería evaluar correctamente una comparación numérica (>)', () => {
    const astMayor = {
      type: 'binary_expr',
      operator: '>',
      left: { type: 'column_ref', table: 'libros', column: 'anio_publicacion' },
      right: { type: 'number', value: 1990 }
    };
    expect(evaluateWhere(filaEjemplo, astMayor)).toBe(true);
  });

  it('debería evaluar correctamente una igualdad de texto (=)', () => {
    const astIgual = {
      type: 'binary_expr',
      operator: '=',
      left: { type: 'column_ref', table: 'libros', column: 'titulo' },
      right: { type: 'string', value: 'Harry Potter' }
    };
    expect(evaluateWhere(filaEjemplo, astIgual)).toBe(true);
  });

  it('debería funcionar con el operador LIKE y comodines %', () => {
    const astLike = {
      type: 'binary_expr',
      operator: 'LIKE',
      left: { type: 'column_ref', table: 'libros', column: 'titulo' },
      right: { type: 'string', value: 'Harry%' }
    };
    expect(evaluateWhere(filaEjemplo, astLike)).toBe(true);
  });

  it('debería evaluar lógicas combinadas (AND)', () => {
    const astAnd = {
      type: 'binary_expr',
      operator: 'AND',
      left: {
        type: 'binary_expr', operator: '>',
        left: { type: 'column_ref', column: 'anio_publicacion' },
        right: { type: 'number', value: 1990 }
      },
      right: {
        type: 'binary_expr', operator: '>',
        left: { type: 'column_ref', column: 'copias' },
        right: { type: 'number', value: 10 }
      }
    };
    expect(evaluateWhere(filaEjemplo, astAnd)).toBe(false);
  });
});
describe('Missing coverage cases evaluateWhere', () => {
  it('node value fallback', () => {
    expect(evaluateWhere({}, { type: 'binary_expr', operator: '=', left: { type: 'custom', value: 1 }, right: { type: 'number', value: 1 } })).toBe(true);
  });
  it('default ast type', () => {
    expect(evaluateWhere({}, { type: 'unknown_ast' })).toBe(true);
  });
});
