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

    // Simulate edge case of null/undefined
    const resultadoNulo = traducirErrorSQL(undefined as any);
    expect(resultadoNulo).toBe('Error desconocido en la consulta.');
  });

  it('debería detectar una columna ambigua y extraer su nombre', () => {
    const errorOriginal = 'column reference "id" is ambiguous';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Hay más de una tabla que tiene la columna "id"');
  });

  it('debería detectar una columna ambigua sin comillas si falla el regex', () => {
    const errorOriginal = 'column id is ambiguous';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Hay más de una tabla que tiene la columna "id"');
  });

  it('debería detectar cuando una tabla no existe', () => {
    const errorOriginal = 'relation "usuarios_falsos" does not exist';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Tabla no encontrada: Estás intentando usar la tabla "usuarios_falsos"');
  });

  it('debería detectar cuando una columna no existe "does not exist"', () => {
    const errorOriginal = 'column "nombre_falso" does not exist';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Columna inexistente: No encuentro la columna "nombre_falso"');
  });

  it('debería detectar cuando una columna no existe "could not find"', () => {
    const errorOriginal = 'could not find the "nombre_falso" column';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Columna inexistente: No encuentro la columna "nombre_falso"');
  });

  it('debería detectar errores de sintaxis y mostrar cerca de dónde ocurrió', () => {
    const errorOriginal = 'syntax error at or near "FROMM"';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Hay algo raro cerca de "FROMM"');
  });

  it('debería detectar errores de sintaxis sin un "cerca de" claro', () => {
    const errorOriginal = 'syntax error sin mas';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Error de sintaxis: Revisa la estructura de tu consulta, hay algo que no encaja.');
  });

  it('debería detectar errores de tipos (operator does not exist)', () => {
    const errorOriginal = 'operator does not exist';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Error de tipos: Estás intentando operar o comparar cosas incompatibles');
  });

  it('debería detectar errores de tipos (invalid input syntax)', () => {
    const errorOriginal = 'invalid input syntax';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toContain('Error de tipos: Estás intentando operar o comparar cosas incompatibles');
  });

  it('debería devolver un mensaje por defecto si el error no es reconocido', () => {
    const errorOriginal = 'un error extrañísimo de postgres';
    const resultado = traducirErrorSQL(errorOriginal);
    expect(resultado).toBe('Ups, error del motor SQL: un error extrañísimo de postgres');
  });

});
describe('Missing coverage cases traductorSQL', () => {
  it('ambiguous fallback', () => {
    const res = traducirErrorSQL('ambiguous');
    expect(res).toContain('ambigua');
  });
  it('relation fallback', () => {
    const res = traducirErrorSQL('relationdoes not exist');
    expect(res).toContain('que has escrito');
  });
  it('column fallback', () => {
    const res = traducirErrorSQL('columndoes not exist');
    expect(res).toContain('que has escrito');
  });
});
