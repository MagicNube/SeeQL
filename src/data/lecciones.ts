// src/data/lecciones.ts

export type Dificultad = 'Fácil' | 'Medio' | 'Difícil';
export type Esquema = 'Biblioteca' | 'Gimnasio' | 'Aeropuerto';

export interface FaseLeccion {
  nivel: number; // 1, 2 o 3
  dificultad: Dificultad;
  esquema: Esquema;
  enunciado: string;
  codigoInicial?: string;
  solucionEsperada: string;
}

export interface Leccion {
  id: number;
  titulo: string;
  concepto: string;
  fases: FaseLeccion[];
}

export const LECCIONES: Leccion[] = [
  {
    id: 1,
    titulo: 'SELECT y FROM',
    concepto: 'Proyección de atributos y selección de relaciones.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'Muestra todos los autores.', codigoInicial: 'SELECT * FROM autores;', solucionEsperada: 'SELECT * FROM autores;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'Muestra nombre y email de clientes.', solucionEsperada: 'SELECT nombre, email FROM clientes;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'Lista modelos, fabricantes y capacidad de aviones.', solucionEsperada: 'SELECT fabricante, nombre_modelo, capacidad_pasajeros FROM modelos_avion;' }
    ]
  },
  {
    id: 2,
    titulo: 'WHERE',
    concepto: 'Restricción de tuplas mediante operadores de comparación.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'Título de los libros que pertenezcan a la categoría 3.', codigoInicial: 'SELECT titulo\nFROM libros\nWHERE id_categoria = 3;', solucionEsperada: 'SELECT titulo FROM libros WHERE id_categoria = 3;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'Todos los datos de los pagos que superen los 50 euros.', solucionEsperada: 'SELECT * FROM pagos WHERE monto > 50.00;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'Nombre completo de pasajeros con nacionalidad Británica.', solucionEsperada: "SELECT nombre_completo FROM pasajeros WHERE nacionalidad = 'Británica';" }
    ]
  },
  {
    id: 3,
    titulo: 'AND, OR, IN',
    concepto: 'Combinación de múltiples condiciones lógicas de filtrado.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'Títulos de libros publicados desde 1900 con más de 1 copia.', solucionEsperada: 'SELECT titulo FROM libros WHERE anio_publicacion >= 1900 AND copias_disponibles > 1;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'Nombre de clases con capacidad de 20 o impartidas por el entrenador 1.', solucionEsperada: 'SELECT nombre_clase FROM clases WHERE capacidad_max = 20 OR id_entrenador = 1;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'Número de vuelos que salen desde los aeropuertos 1 o 3.', solucionEsperada: 'SELECT numero_vuelo FROM vuelos WHERE id_aeropuerto_origen IN (1, 3);' }
    ]
  },
  {
    id: 4,
    titulo: 'ORDER BY y LIMIT',
    concepto: 'Ordenación del conjunto de resultados y restricción de salida.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'Nombre del autor más antiguo de la base de datos.', solucionEsperada: 'SELECT nombre FROM autores ORDER BY fecha_nacimiento ASC LIMIT 1;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'Nombre y fecha de inscripción de los 3 clientes más recientes.', solucionEsperada: 'SELECT nombre_completo, fecha_inscripcion FROM clientes ORDER BY fecha_inscripcion DESC LIMIT 3;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'ID de reserva y precio de las 2 reservas más caras.', solucionEsperada: 'SELECT id_reserva, precio_billete FROM reservas ORDER BY precio_billete DESC LIMIT 2;' }
    ]
  },
  {
    id: 5,
    titulo: 'LIKE',
    concepto: 'Filtrado de cadenas de texto mediante patrones de búsqueda.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: "Títulos de libros que empiecen por la palabra 'Harry'.", solucionEsperada: "SELECT titulo FROM libros WHERE titulo LIKE 'Harry%';" },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: "Nombre y email de clientes cuyo correo termine en '@gmail.com'.", solucionEsperada: "SELECT nombre_completo, email FROM clientes WHERE email LIKE '%@gmail.com';" },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: "Fabricante y modelo de aviones cuyo fabricante contenga 'Boeing'.", solucionEsperada: "SELECT fabricante, nombre_modelo FROM modelos_avion WHERE fabricante LIKE '%Boeing%';" }
    ]
  },
  {
    id: 6,
    titulo: 'SUM, COUNT, AVG',
    concepto: 'Uso de funciones de agregación para cálculos métricos globales.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'Cuenta cuántos libros en total hay registrados.', solucionEsperada: 'SELECT COUNT(*) FROM libros;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'Suma total de dinero recaudado en pagos.', solucionEsperada: 'SELECT SUM(monto) FROM pagos;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'Capacidad máxima del avión más grande.', solucionEsperada: 'SELECT MAX(capacidad_pasajeros) FROM modelos_avion;' }
    ]
  },
  {
    id: 7,
    titulo: 'GROUP BY',
    concepto: 'División de registros en subgrupos lógicos.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'ID de categoría y cantidad de libros por categoría.', solucionEsperada: 'SELECT id_categoria, COUNT(*) FROM libros GROUP BY id_categoria;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'ID de cada cliente y dinero total que ha gastado.', solucionEsperada: 'SELECT id_cliente, SUM(monto) FROM pagos GROUP BY id_cliente;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'ID del aeropuerto de origen y cantidad de vuelos que salen de cada uno.', solucionEsperada: 'SELECT id_aeropuerto_origen, COUNT(*) FROM vuelos GROUP BY id_aeropuerto_origen;' }
    ]
  },
  {
    id: 8,
    titulo: 'INNER JOIN',
    concepto: 'Composición interna de tablas mediante claves foráneas.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'Título del libro y nombre real de su autor.', solucionEsperada: 'SELECT libros.titulo, autores.nombre FROM libros INNER JOIN autores ON libros.id_autor = autores.id_autor;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'Nombre de cada clase y el nombre del entrenador asignado.', solucionEsperada: 'SELECT clases.nombre_clase, entrenadores.nombre FROM clases INNER JOIN entrenadores ON clases.id_entrenador = entrenadores.id_entrenador;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'Identificador de la reserva y nombre de los pasajeros con reserva confirmada.', solucionEsperada: 'SELECT reservas.id_reserva, pasajeros.nombre_completo FROM reservas INNER JOIN pasajeros ON reservas.id_pasajero = pasajeros.id_pasajero;' }
    ]
  },
  {
    id: 9,
    titulo: 'HAVING',
    concepto: 'Filtrado de conjuntos de resultados posteriores a una agrupación.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'ID de la categoría y cantidad de libros, solo para secciones con más de 1 libro.', solucionEsperada: 'SELECT id_categoria, COUNT(*) FROM libros GROUP BY id_categoria HAVING COUNT(*) > 1;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'ID del cliente y suma de sus pagos, solo si han gastado más de 100 euros.', solucionEsperada: 'SELECT id_cliente, SUM(monto) FROM pagos GROUP BY id_cliente HAVING SUM(monto) > 100;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'ID del aeropuerto y cantidad de vuelos, solo si operan más de 2 vuelos de salida.', solucionEsperada: 'SELECT id_aeropuerto_origen, COUNT(*) FROM vuelos GROUP BY id_aeropuerto_origen HAVING COUNT(*) > 2;' }
    ]
  },
  {
    id: 10,
    titulo: 'LEFT JOIN',
    concepto: 'Composición externa conservando los registros de la relación principal.',
    fases: [
      { nivel: 1, dificultad: 'Fácil', esquema: 'Biblioteca', enunciado: 'Nombre de todos los usuarios y el ID de sus préstamos (incluso sin préstamos).', solucionEsperada: 'SELECT usuarios.nombre_completo, prestamos.id_prestamo FROM usuarios LEFT JOIN prestamos ON usuarios.id_usuario = prestamos.id_usuario;' },
      { nivel: 2, dificultad: 'Medio', esquema: 'Gimnasio', enunciado: 'Nombre de todas las clases y su entrenador (incluyendo clases sin entrenador).', solucionEsperada: 'SELECT clases.nombre_clase, entrenadores.nombre FROM clases LEFT JOIN entrenadores ON clases.id_entrenador = entrenadores.id_entrenador;' },
      { nivel: 3, dificultad: 'Difícil', esquema: 'Aeropuerto', enunciado: 'Nombre del modelo de avión y número de vuelo (incluso sin vuelos programados).', solucionEsperada: 'SELECT modelos_avion.nombre_modelo, vuelos.numero_vuelo FROM modelos_avion LEFT JOIN vuelos ON modelos_avion.id_modelo = vuelos.id_modelo_avion;' }
    ]
  }
];
