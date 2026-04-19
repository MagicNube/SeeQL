export type Dificultad = 'Fácil' | 'Medio' | 'Difícil';
// Usamos los IDs exactos de la base de datos para evitar errores de mapeo
export type EsquemaId = 'facil_biblioteca' | 'medio_gym' | 'dificil_aeropuerto';

export interface EjercicioLeccion {
  nivel: number;
  dificultad: Dificultad;
  esquema: EsquemaId;
  enunciado: string;
  teoria?: string;
  pista: string;
  codigoInicial?: string;
  solucionEsperada: string;
}

export interface Leccion {
  id: number;
  titulo: string;
  concepto: string;
  ejercicios: EjercicioLeccion[];
}

export const LECCIONES: Leccion[] = [
  {
    id: 1,
    titulo: 'SELECT y FROM',
    concepto: 'Proyección de atributos y selección de relaciones.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Muestra todos los datos de la tabla de autores.',
        teoria: 'La sentencia `SELECT *` se utiliza para pedir todas las columnas de una tabla. El `FROM` indica el nombre de la tabla que contiene los datos.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        codigoInicial: 'SELECT *\nFROM autores',
        solucionEsperada: 'SELECT * FROM autores'
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Muestra el nombre completo y el email de todos los clientes.',
        pista: 'Sustituye el asterisco (*) por los nombres de las columnas separados por coma: nombre_completo, email.',
        solucionEsperada: 'SELECT nombre_completo, email FROM clientes'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'Lista el fabricante, el modelo y la capacidad de pasajeros de todos los modelos de aviones.',
        pista: 'Consulta las columnas "fabricante", "nombre_modelo" y "capacidad_pasajeros" en la tabla "modelos_avion".',
        solucionEsperada: 'SELECT fabricante, nombre_modelo, capacidad_pasajeros FROM modelos_avion'
      }
    ]
  },
  {
    id: 2,
    titulo: 'WHERE',
    concepto: 'Restricción de tuplas mediante operadores de comparación.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Título de los libros cuyo año de publicación sea igual o posterior al año 2000.',
        teoria: 'La cláusula ``WHERE`` permite filtrar las filas. Solo aparecerán los registros que cumplan la condición.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        codigoInicial: 'SELECT titulo\nFROM libros\nWHERE anio_publicacion >= 2000',
        solucionEsperada: 'SELECT titulo FROM libros WHERE anio_publicacion >= 2000'
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Obtén todos los datos de los pagos que superen los 50 euros.',
        pista: 'Recuerda que para seleccionar todos los campos se utiliza el asterisco (*).',
        solucionEsperada: 'SELECT * FROM pagos WHERE monto > 50'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'Busca el nombre completo de los pasajeros que tengan nacionalidad Británica.',
        codigoInicial: 'SELECT nombre_completo\nFROM pasajeros\nWHERE nacionalidad = \'Británica\'',
        pista: "Recuerda poner el texto entre comillas simples: nacionalidad = 'Británica'.",
        solucionEsperada: "SELECT nombre_completo FROM pasajeros WHERE nacionalidad = 'Británica'"
      }
    ]
  },
  {
    id: 3,
    titulo: 'AND, OR, IN',
    concepto: 'Combinación de múltiples condiciones lógicas de filtrado.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Títulos de libros publicados desde el año 1900 que tengan más de 1 copia disponible.',
        teoria: 'Podemos combinar filtros. `AND` exige que se cumplan ambas condiciones. `OR` exige que se cumpla al menos una. `IN` busca dentro de una lista de valores.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: 'SELECT titulo FROM libros WHERE anio_publicacion >= 1900 AND copias_disponibles > 1',
        codigoInicial: 'SELECT titulo\nFROM libros\nWHERE anio_publicacion >= 1900 AND copias_disponibles > 1',
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Nombre de las clases que tengan capacidad de exactamente 20 personas o que sean impartidas por el entrenador con ID 1.',
        pista: 'Utiliza el operador lógico OR entre las dos condiciones.',
        solucionEsperada: 'SELECT nombre_clase FROM clases WHERE capacidad_max = 20 OR id_entrenador = 1'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'Número de los vuelos que salen desde los aeropuertos con ID 1 o 3.',
        pista: 'Utiliza el operador IN para buscar dentro de la lista de aeropuertos origen.',
        solucionEsperada: 'SELECT numero_vuelo FROM vuelos WHERE id_aeropuerto_origen IN (1, 3)'
      }
    ]
  },
  {
    id: 4,
    titulo: 'ORDER BY y LIMIT',
    concepto: 'Ordenación del conjunto de resultados y restricción de salida.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Muestra el nombre del autor más antiguo.',
        teoria: '`ORDER BY` ordena los resultados (ASC por defecto). `LIMIT` restringe el número de filas que se muestran al final.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: 'SELECT nombre FROM autores ORDER BY fecha_nacimiento ASC LIMIT 1',
        codigoInicial: 'SELECT nombre\nFROM autores\nORDER BY fecha_nacimiento ASC\nLIMIT 1',
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Nombre y fecha de inscripción de los 3 clientes que se han apuntado más recientemente.',
        pista: 'Ordena por fecha_inscripcion de forma descendente (DESC) para ver los últimos primero.',
        solucionEsperada: 'SELECT nombre_completo, fecha_inscripcion FROM clientes ORDER BY fecha_inscripcion DESC LIMIT 3'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'ID de reserva y precio de las 2 reservas más caras.',
        pista: 'Usa DESC en el precio_billete para poner los más caros arriba.',
        solucionEsperada: 'SELECT id_reserva, precio_billete FROM reservas ORDER BY precio_billete DESC LIMIT 2'
      }
    ]
  },
  {
    id: 5,
    titulo: 'LIKE',
    concepto: 'Filtrado de cadenas de texto mediante patrones de búsqueda.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: "Títulos de los libros que empiecen por la palabra 'Harry'.",
        teoria: '`LIKE` busca patrones. El símbolo `%` representa cualquier cantidad de caracteres. Por ejemplo, `A%` busca palabras que empiezan por A.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: "SELECT titulo FROM libros WHERE titulo LIKE 'Harry%'",
        codigoInicial: "SELECT titulo\nFROM libros\nWHERE titulo LIKE 'Harry%'"
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: "Busca el nombre y el email de los clientes cuyo email termine exactamente en '@gmail.com'.",
        pista: "Usa el porcentaje al principio del patrón: '%@gmail.com'.",
        solucionEsperada: "SELECT nombre_completo, email FROM clientes WHERE email LIKE '%@gmail.com'"
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: "Fabricante y nombre del modelo de los modelos de aviones cuyo fabricante contenga el texto 'Boeing' en cualquier parte del nombre.",
        pista: "Rodea la palabra con porcentajes: '%Boeing%'.",
        solucionEsperada: "SELECT fabricante, nombre_modelo FROM modelos_avion WHERE fabricante LIKE '%Boeing%'"
      }
    ]
  },
  {
    id: 6,
    titulo: 'Agregaciones (SUM, COUNT, AVG)',
    concepto: 'Uso de funciones de agregación para cálculos métricos globales.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Cuenta cuántos libros hay registrados en total en la biblioteca.',
        teoria: 'Las funciones de agregación resumen datos. `COUNT` cuenta filas, `SUM` suma valores numéricos y `AVG` calcula la media.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: 'SELECT COUNT(*) FROM libros',
        codigoInicial: 'SELECT COUNT(*)\nFROM libros'
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Calcula la suma total de dinero recaudado a través de todos los pagos realizados.',
        pista: 'Usa la función SUM sobre la columna "monto".',
        solucionEsperada: 'SELECT SUM(monto) FROM pagos'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'Encuentra cuál es la capacidad media de pasajeros de los aviones del fabricante Airbus.',
        pista: 'Usa la función AVG sobre la columna "capacidad_pasajeros".',
        solucionEsperada: 'SELECT AVG(capacidad_pasajeros) FROM modelos_avion WHERE fabricante = \'Airbus\''
      }
    ]
  },
  {
    id: 7,
    titulo: 'GROUP BY',
    concepto: 'División de registros en subgrupos lógicos.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Muestra el ID de categoría y cuántos libros hay asociados a cada una.',
        teoria: '`GROUP BY` agrupa filas que tienen los mismos valores. Se suele usar junto a funciones como `COUNT` o `SUM` para obtener totales por grupo.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: 'SELECT id_categoria, COUNT(*) FROM libros GROUP BY id_categoria'
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Obtén el ID de cada cliente y el dinero total que ha gastado cada uno de ellos.',
        pista: 'Suma el monto y agrupa los resultados por el id_cliente.',
        solucionEsperada: 'SELECT id_cliente, SUM(monto) FROM pagos GROUP BY id_cliente'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'ID del aeropuerto de origen y cantidad de vuelos que salen de cada uno de ellos.',
        pista: 'Agrupa por la columna "id_aeropuerto_origen".',
        solucionEsperada: 'SELECT id_aeropuerto_origen, COUNT(*) FROM vuelos GROUP BY id_aeropuerto_origen'
      }
    ]
  },
  {
    id: 8,
    titulo: 'INNER JOIN',
    concepto: 'Composición interna de tablas mediante claves foráneas.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Muestra el título de cada libro junto al nombre real de su autor.',
        teoria: '`JOIN` une dos tablas. El `INNER JOIN` solo muestra los registros que tienen una coincidencia en ambas tablas mediante una clave común.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: 'SELECT libros.titulo, autores.nombre FROM libros INNER JOIN autores ON libros.id_autor = autores.id_autor'
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Lista el nombre de cada clase junto con el nombre del entrenador que la imparte.',
        pista: 'Cruza la tabla "clases" con "entrenadores" usando la columna id_entrenador.',
        solucionEsperada: 'SELECT clases.nombre_clase, entrenadores.nombre FROM clases INNER JOIN entrenadores ON clases.id_entrenador = entrenadores.id_entrenador'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'Identificador de la reserva y nombre completo de los pasajeros que tienen dicha reserva.',
        pista: 'Une las tablas "reservas" y "pasajeros" por el id_pasajero.',
        solucionEsperada: 'SELECT reservas.id_reserva, pasajeros.nombre_completo FROM reservas INNER JOIN pasajeros ON reservas.id_pasajero = pasajeros.id_pasajero'
      }
    ]
  },
  {
    id: 9,
    titulo: 'HAVING',
    concepto: 'Filtrado de conjuntos de resultados posteriores a una agrupación.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Muestra el ID de categoría y cantidad de libros, pero solo para aquellas que tengan más de 1 libro.',
        teoria: '`HAVING` es el "WHERE" de los grupos. Se usa después de un `GROUP BY` para filtrar grupos que cumplen una condición estadística.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: 'SELECT id_categoria, COUNT(*) FROM libros GROUP BY id_categoria HAVING COUNT(*) > 1'
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'ID del cliente y suma de sus pagos, solo para aquellos clientes que hayan gastado más de 100 euros en total.',
        pista: 'Filtra el grupo con "HAVING SUM(monto) > 100".',
        solucionEsperada: 'SELECT id_cliente, SUM(monto) FROM pagos GROUP BY id_cliente HAVING SUM(monto) > 100'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'ID del aeropuerto y cantidad de vuelos, solo si operan más de 2 vuelos de salida desde allí.',
        pista: 'Usa HAVING sobre el COUNT(*) del grupo.',
        solucionEsperada: 'SELECT id_aeropuerto_origen, COUNT(*) FROM vuelos GROUP BY id_aeropuerto_origen HAVING COUNT(*) > 2'
      }
    ]
  },
  {
    id: 10,
    titulo: 'LEFT JOIN',
    concepto: 'Composición externa conservando los registros de la relación principal.',
    ejercicios: [
      {
        nivel: 1,
        dificultad: 'Fácil',
        esquema: 'facil_biblioteca',
        enunciado: 'Nombre de todos los usuarios y el ID de sus préstamos (deben aparecer incluso si nunca han pedido un libro).',
        teoria: 'El `LEFT JOIN` devuelve todas las filas de la tabla de la izquierda, y las filas coincidentes de la derecha. Si no hay coincidencia, devuelve NULL.',
        pista: '¡Simplemente ejecuta, ya está resuelto!',
        solucionEsperada: 'SELECT usuarios.nombre_completo, prestamos.id_prestamo FROM usuarios LEFT JOIN prestamos ON usuarios.id_usuario = prestamos.id_usuario'
      },
      {
        nivel: 2,
        dificultad: 'Medio',
        esquema: 'medio_gym',
        enunciado: 'Lista todas las clases y el nombre de su entrenador (incluye las clases que no tienen ningún entrenador asignado).',
        pista: 'La tabla principal (izquierda) debe ser "clases".',
        solucionEsperada: 'SELECT clases.nombre_clase, entrenadores.nombre FROM clases LEFT JOIN entrenadores ON clases.id_entrenador = entrenadores.id_entrenador'
      },
      {
        nivel: 3,
        dificultad: 'Difícil',
        esquema: 'dificil_aeropuerto',
        enunciado: 'Nombre del modelo de avión y número de vuelo (incluye los modelos que no tienen ningún vuelo programado actualmente).',
        pista: 'Une "modelos_avion" con "vuelos" usando LEFT JOIN.',
        solucionEsperada: 'SELECT modelos_avion.nombre_modelo, vuelos.numero_vuelo FROM modelos_avion LEFT JOIN vuelos ON modelos_avion.id_modelo = vuelos.id_modelo_avion'
      }
    ]
  }
];
