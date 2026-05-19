import { describe, it, expect, beforeEach, vi } from 'vitest';
import { traducirErrorSQL } from './traductorSQL';

describe('Traductor de Errores SQL', () => {

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('debería manejar una consulta vacía para empty query', () => {
    const errorOriginal = 'empty query';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toBe('La consulta está vacía. Escribe algo de código SQL para poder ejecutarlo.');
  });

  it('debería manejar una consulta vacía para syntax error at end of input', () => {
    const errorOriginal = 'syntax error at end of input';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toBe('La consulta está vacía. Escribe algo de código SQL para poder ejecutarlo.');
  });

  it('debería devolver error desconocido si se pasa un string vacío o nulo', () => {
    const resultadoVacio = traducirErrorSQL('');
    expect(resultadoVacio).toBe('Error desconocido en la consulta.');

    const resultadoNulo = traducirErrorSQL(undefined as any);
    expect(resultadoNulo).toBe('Error desconocido en la consulta.');
  });

  it('debería detectar una columna ambigua y extraer su nombre', () => {
    const errorOriginal = 'ambiguous column name: "id"';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Hay más de una tabla que tiene la columna "id"');
  });

  it('debería detectar una columna ambigua sin comillas si falla el regex', () => {
    const errorOriginal = 'ambiguous column name: id';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Hay más de una tabla que tiene la columna "id"');
  });

  it('debería detectar cuando una tabla no existe', () => {
    const errorOriginal = 'no such table: usuarios_falsos';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Tabla no encontrada: Estás intentando usar la tabla "usuarios_falsos"');
  });

  it('debería detectar cuando una columna no existe "no such column"', () => {
    const errorOriginal = 'no such column: nombre_falso';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Columna inexistente: No encuentro la columna "nombre_falso"');
  });

  it('debería detectar errores de sintaxis y mostrar cerca de dónde ocurrió', () => {
    const errorOriginal = 'near "FROMM": syntax error';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Hay algo raro cerca de "FROMM"');
  });

  it('debería detectar errores de sintaxis sin un "cerca de" claro', () => {
    const errorOriginal = 'syntax error';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Error de sintaxis: Revisa la estructura de tu consulta, hay algo que no encaja.');
  });

  it('debería detectar errores de tipos (datatype mismatch)', () => {
    const errorOriginal = 'datatype mismatch';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Error de tipos: Estás intentando operar o comparar cosas incompatibles');
  });

  it('debería devolver un mensaje por defecto si el error no es reconocido', () => {
    const errorOriginal = 'un error extrañísimo de sqlite';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toBe('Ups, error del motor SQL: un error extrañísimo de sqlite');
  });

});

describe('Missing coverage cases traductorSQL', () => {
  it('ambiguous fallback', () => {
    const res = traducirErrorSQL('ambiguous column name:');
    expect(res).toContain('ambigua');
  });

  it('relation fallback', () => {
    const res = traducirErrorSQL('no such table:');
    expect(res).toContain('que has escrito');
  });

  it('column fallback', () => {
    const res = traducirErrorSQL('no such column:');
    expect(res).toContain('que has escrito');
  });
});
