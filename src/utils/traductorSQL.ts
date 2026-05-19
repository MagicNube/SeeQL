export const traducirErrorSQL = (mensajeOriginal: string): string => {
  if (!mensajeOriginal) return 'Error desconocido en la consulta.';

  const msg = mensajeOriginal.toLowerCase();

  if (msg.includes('empty query') || msg.includes('syntax error at end of input')) {
    return 'La consulta está vacía. Escribe algo de código SQL para poder ejecutarlo.';
  }

  console.log("SQL.js error original:", mensajeOriginal);

  if (msg.includes('ambiguous column name')) {
    const match = mensajeOriginal.match(/ambiguous column name:\s*["']?([^"'\s]+)["']?/i);
    const columna = match ? match[1] : 'ambigua';
    return `Columna ambigua: Hay más de una tabla que tiene la columna "${columna}". Tienes que ser más específico escribiendo "nombre_tabla.${columna}".`;
  }

  if (msg.includes('no such table')) {
    const match = mensajeOriginal.match(/no such table:\s*["']?([^"'\s]+)["']?/i);
    const tabla = match ? match[1] : 'que has escrito';
    return `Tabla no encontrada: Estás intentando usar la tabla "${tabla}", pero no existe en este esquema. ¡Revisa si hay algún error tipográfico!`;
  }

  if (msg.includes('no such column')) {
    const match = mensajeOriginal.match(/no such column:\s*["']?([^"'\s]+)["']?/i);
    const columna = match ? match[1] : 'que has escrito';
    return `Columna inexistente: No encuentro la columna "${columna}". Revisa en la pizarra de estructura que esté bien escrita y que pertenezca a la tabla correcta.`;
  }

  if (msg.includes('syntax error')) {
    const match = mensajeOriginal.match(/near ["']?([^"']+)["']?:\s*syntax error/i);
    const cercaDe = match ? match[1] : '';
    return cercaDe
      ? `Error de sintaxis: Hay algo raro cerca de "${cercaDe}". Revisa si te falta alguna coma o si has escrito mal una palabra reservada. Recuerda que en SeeQL no utilizamos punto y coma al final.`
      : `Error de sintaxis: Revisa la estructura de tu consulta, hay algo que no encaja.`;
  }

  if (msg.includes('datatype mismatch')) {
    return `Error de tipos: Estás intentando operar o comparar cosas incompatibles (por ejemplo, texto con números). Revisa los tipos de datos en la estructura.`;
  }

  return `Ups, error del motor SQL: ${mensajeOriginal}`;
};
