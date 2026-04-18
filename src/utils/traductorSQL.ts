export const traducirErrorSQL = (mensajeOriginal: string): string => {
  if (!mensajeOriginal) return 'Error desconocido en la consulta.';

  const msg = mensajeOriginal.toLowerCase();

  // Chivato oculto para ti en desarrollo
  console.log("Supabase error original:", mensajeOriginal);

  // 1. Error de columna ambigua (La ponemos la primera para evitar conflictos)
  if (msg.includes('ambiguous')) {
    const match = mensajeOriginal.match(/column(?: reference)? ["']?([^"'\s]+)["']?/i);
    const columna = match ? match[1] : 'ambigua';
    return `Columna ambigua: Hay más de una tabla que tiene la columna "${columna}". Tienes que ser más específico escribiendo "nombre_tabla.${columna}".`;
  }

  // 2. Error de tabla que no existe
  if (msg.includes('relation') && msg.includes('does not exist')) {
    const match = mensajeOriginal.match(/relation ["']?([^"'\s]+)["']?/i);
    const tabla = match ? match[1] : 'que has escrito';
    return `Tabla no encontrada: Estás intentando usar la tabla "${tabla}", pero no existe en este esquema. ¡Revisa si hay algún error tipográfico!`;
  }

  // 3. Error de columna que no existe
  if (msg.includes('column') && (msg.includes('does not exist') || msg.includes('could not find'))) {
    const match = mensajeOriginal.match(/column ["']?([^"'\s]+)["']?/i) || mensajeOriginal.match(/find the ["']?([^"'\s]+)["']? column/i);
    const columna = match ? match[1] : 'que has escrito';
    return `Columna inexistente: No encuentro la columna "${columna}". Revisa en la pizarra de estructura que esté bien escrita y que pertenezca a la tabla correcta.`;
  }

  // 4. Error de sintaxis básica (Con tu frase añadida)
  if (msg.includes('syntax error')) {
    const match = mensajeOriginal.match(/syntax error at or near ["']?([^"']+)["']?/i);
    const cercaDe = match ? match[1] : '';
    return cercaDe
      ? `Error de sintaxis: Hay algo raro cerca de "${cercaDe}". Revisa si te falta alguna coma o si has escrito mal una palabra reservada. Recuerda que en SeeQl no utilizamos punto y coma al final.`
      : `Error de sintaxis: Revisa la estructura de tu consulta, hay algo que no encaja.`;
  }

  // 5. Error de tipos
  if (msg.includes('operator does not exist') || msg.includes('invalid input syntax')) {
    return `Error de tipos: Estás intentando operar o comparar cosas incompatibles (por ejemplo, texto con números). Revisa los tipos de datos en la estructura.`;
  }

  // Error por defecto
  return `Ups, error del motor SQL: ${mensajeOriginal}`;
};
