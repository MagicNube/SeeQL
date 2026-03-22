export type NivelLeccion = 'basico' | 'intermedio' | 'avanzado';
export type EsquemaId = 'facil_biblioteca' | 'medio_gym' | 'dificil_aeropuerto';

export interface Leccion {
  id: string;
  orden: number;
  titulo: string;
  nivel: NivelLeccion;
  esquema: EsquemaId;
  teoria: string;
  objetivo: string;
  querySolucion: string;
  pistas: string[];
}

export const planDeEstudios: Leccion[] = [
  {
    id: "lec-1-1-select-all",
    orden: 1,
    titulo: "Tu primer vistazo (SELECT y FROM) - Ejemplo Guiado",
    nivel: "basico",
    esquema: "facil_biblioteca",
    teoria: "Recuperar todas las columnas o columnas específicas de una tabla base. En SQL, usamos SELECT para indicar qué queremos ver y FROM para indicar de qué tabla.",
    objetivo: "Bienvenido a SeeQL. Para empezar a explorar, necesitamos ver el catálogo completo de autores que tenemos en nuestra base de datos.",
    querySolucion: "SELECT * FROM autores;",
    pistas: [
      "Usa el asterisco (*) para pedir todas las columnas.",
      "La tabla que buscas se llama 'autores'.",
      "Estructura: SELECT * FROM nombre_tabla;"
    ]
  },
  {
    id: "lec-1-2-select-columnas",
    orden: 2,
    titulo: "Tu primer vistazo (SELECT y FROM) - Ejercicio 1",
    nivel: "intermedio",
    esquema: "medio_gym",
    teoria: "A menudo no necesitamos toda la información. Podemos sustituir el asterisco (*) por los nombres exactos de las columnas que queremos ver, separados por comas.",
    objetivo: "Muestra únicamente el nombre completo y el email de todos los clientes registrados en el gimnasio.",
    querySolucion: "SELECT nombre_completo, email FROM clientes;",
    pistas: [
      "Escribe los nombres de las columnas separados por coma: nombre_completo, email.",
      "La tabla objetivo es 'clientes'.",
      "Estructura: SELECT col1, col2 FROM nombre_tabla;"
    ]
  },
  {
    id: "lec-1-3-select-avanzado",
    orden: 3,
    titulo: "Tu primer vistazo (SELECT y FROM) - Ejercicio 2",
    nivel: "avanzado",
    esquema: "dificil_aeropuerto",
    teoria: "En bases de datos más grandes, seleccionar solo las columnas necesarias es vital para el rendimiento.",
    objetivo: "Vamos a la base de datos principal. Extrae el fabricante, el nombre del modelo y la capacidad de pasajeros de todos los modelos de avión disponibles.",
    querySolucion: "SELECT fabricante, nombre_modelo, capacidad_pasajeros FROM modelos_avion;",
    pistas: [
      "Necesitas tres columnas: fabricante, nombre_modelo y capacidad_pasajeros.",
      "La tabla se llama 'modelos_avion'.",
      "No olvides terminar tu consulta con un punto y coma (;)."
    ]
  },
  {
    id: "lec-2-1-where-basico",
    orden: 4,
    titulo: "Encontrando la aguja (WHERE básico) - Ejemplo Guiado",
    nivel: "basico",
    esquema: "facil_biblioteca",
    teoria: "Filtrar registros utilizando la cláusula WHERE con operadores de igualdad (=) y comparación matemática sencilla.",
    objetivo: "Vamos a aprender a filtrar datos. Muestra únicamente el título de los libros que pertenezcan exactamente a la categoría 3.",
    querySolucion: "SELECT titulo FROM libros WHERE id_categoria = 3;",
    pistas: [
      "Pide solo la columna 'titulo' de la tabla 'libros'.",
      "Añade WHERE al final para establecer la condición.",
      "La condición es que 'id_categoria' sea igual a 3."
    ]
  },
  {
    id: "lec-2-2-where-mayor",
    orden: 5,
    titulo: "Encontrando la aguja (WHERE básico) - Ejercicio 1",
    nivel: "intermedio",
    esquema: "medio_gym",
    teoria: "Además del igual (=), puedes usar operadores como mayor que (>), menor que (<), mayor o igual (>=), etc., para campos numéricos.",
    objetivo: "Aplica el filtro en la tabla de finanzas. Muestra todos los datos de los pagos que superen estrictamente la cantidad de 50 euros.",
    querySolucion: "SELECT * FROM pagos WHERE monto > 50.00;",
    pistas: [
      "Usa SELECT * para traer todos los datos.",
      "La tabla a consultar es 'pagos'.",
      "Usa el símbolo mayor que (>) para la columna 'monto'."
    ]
  },
  {
    id: "lec-2-3-where-texto",
    orden: 6,
    titulo: "Encontrando la aguja (WHERE básico) - Ejercicio 2",
    nivel: "avanzado",
    esquema: "dificil_aeropuerto",
    teoria: "Cuando filtres por cadenas de texto (VARCHAR), debes envolver el valor a buscar entre comillas simples ('texto').",
    objetivo: "Filtra registros por texto. Muestra el nombre completo de los pasajeros cuya nacionalidad sea exactamente 'Británica'.",
    querySolucion: "SELECT nombre_completo FROM pasajeros WHERE nacionalidad = 'Británica';",
    pistas: [
      "Selecciona solo 'nombre_completo' de la tabla 'pasajeros'.",
      "Atención a las comillas: usa comillas simples para 'Británica'.",
      "Cuidado con las tildes, debe estar escrito exactamente igual."
    ]
  },
  {
    id: "lec-3-1-and",
    orden: 7,
    titulo: "Exigiendo más (AND, OR, IN) - Ejemplo Guiado",
    nivel: "basico",
    esquema: "facil_biblioteca",
    teoria: "Combinar múltiples condiciones lógicas de filtrado en una misma consulta. Usamos AND cuando queremos que se cumplan todas las condiciones a la vez.",
    objetivo: "Los filtros pueden combinarse. Necesitamos los títulos de los libros publicados a partir del año 1900 y de los cuales tengamos estrictamente más de 1 copia disponible.",
    querySolucion: "SELECT titulo FROM libros WHERE anio_publicacion >= 1900 AND copias_disponibles > 1;",
    pistas: [
      "Usa el operador >= para 'a partir del año 1900'.",
      "Une ambas condiciones con la palabra clave AND.",
      "La segunda condición es copias_disponibles > 1."
    ]
  },
  {
    id: "lec-3-2-or",
    orden: 8,
    titulo: "Exigiendo más (AND, OR, IN) - Ejercicio 1",
    nivel: "intermedio",
    esquema: "medio_gym",
    teoria: "El operador OR permite que una fila sea incluida en el resultado si cumple al menos una de las condiciones.",
    objetivo: "Muestra el nombre de las clases que tengan una capacidad máxima de 20 personas o que estén impartidas por el entrenador con el ID 1.",
    querySolucion: "SELECT nombre_clase FROM clases WHERE capacidad_max = 20 OR id_entrenador = 1;",
    pistas: [
      "Selecciona 'nombre_clase' de la tabla 'clases'.",
      "Usa OR para separar las dos opciones válidas.",
      "Revisa los nombres de las columnas en el esquema visual."
    ]
  },
  {
    id: "lec-3-3-in",
    orden: 9,
    titulo: "Exigiendo más (AND, OR, IN) - Ejercicio 2",
    nivel: "avanzado",
    esquema: "dificil_aeropuerto",
    teoria: "La cláusula IN es un atajo para múltiples OR sobre la misma columna. Permite comprobar si un valor coincide con cualquier elemento de una lista (ej: id IN (1, 2, 3)).",
    objetivo: "Usa la cláusula IN para buscar coincidencias múltiples. Muestra el número de vuelo de aquellos que salgan desde los aeropuertos con ID 1 o 3.",
    querySolucion: "SELECT numero_vuelo FROM vuelos WHERE id_aeropuerto_origen IN (1, 3);",
    pistas: [
      "La columna de la condición es 'id_aeropuerto_origen'.",
      "Escribe la lista de valores entre paréntesis: IN (1, 3).",
      "Solo debes devolver la columna 'numero_vuelo'."
    ]
  },
  {
    id: "lec-4-1-order-limit",
    orden: 10,
    titulo: "Orden y Top (ORDER BY y LIMIT) - Ejemplo Guiado",
    nivel: "basico",
    esquema: "facil_biblioteca",
    teoria: "Organizar el conjunto de resultados de forma ascendente (ASC) o descendente (DESC) y restringir la cantidad de filas devueltas (LIMIT).",
    objetivo: "Vamos a organizar la información. Encuentra el nombre del autor más antiguo de nuestra base de datos (mostrando únicamente a una persona, ordenada por su fecha de nacimiento).",
    querySolucion: "SELECT nombre FROM autores ORDER BY fecha_nacimiento ASC LIMIT 1;",
    pistas: [
      "Para que sea el más antiguo, ordena por 'fecha_nacimiento' de forma ascendente (ASC).",
      "ORDER BY se coloca siempre después del WHERE (si lo hubiera).",
      "Añade LIMIT 1 al final para quedarte solo con la primera fila."
    ]
  },
  {
    id: "lec-4-2-order-desc",
    orden: 11,
    titulo: "Orden y Top (ORDER BY y LIMIT) - Ejercicio 1",
    nivel: "intermedio",
    esquema: "medio_gym",
    teoria: "Ordenando de forma descendente (DESC) podemos obtener rápidamente los valores más altos o más recientes de una tabla.",
    objetivo: "Queremos felicitar a las nuevas incorporaciones. Muestra el nombre completo y la fecha de inscripción de los 3 clientes más recientes.",
    querySolucion: "SELECT nombre_completo, fecha_inscripcion FROM clientes ORDER BY fecha_inscripcion DESC LIMIT 3;",
    pistas: [
      "Selecciona las dos columnas pedidas de la tabla 'clientes'.",
      "Los clientes recientes tienen una fecha mayor, usa DESC.",
      "Añade LIMIT 3 al final del todo."
    ]
  },
  {
    id: "lec-4-3-order-top",
    orden: 12,
    titulo: "Orden y Top (ORDER BY y LIMIT) - Ejercicio 2",
    nivel: "avanzado",
    esquema: "dificil_aeropuerto",
    teoria: "La combinación de ORDER BY DESC y LIMIT es el patrón estándar en bases de datos para extraer los clásicos 'Top 10', 'Top 5', etc.",
    objetivo: "Revisa las transacciones VIP. Muestra el ID de reserva y el precio del billete de las 2 reservas más caras del sistema.",
    querySolucion: "SELECT id_reserva, precio_billete FROM reservas ORDER BY precio_billete DESC LIMIT 2;",
    pistas: [
      "La tabla a consultar es 'reservas'.",
      "Ordena por la columna monetaria 'precio_billete' hacia abajo (DESC).",
      "Recorta el resultado a 2 filas con LIMIT."
    ]
  }
];
