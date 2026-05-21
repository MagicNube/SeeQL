CREATE TABLE autores (
  id_autor INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR NOT NULL,
  nacionalidad VARCHAR,
  fecha_nacimiento DATE
);

CREATE TABLE categorias (
  id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_cat VARCHAR NOT NULL UNIQUE
);

CREATE TABLE libros (
  id_libro INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo VARCHAR NOT NULL,
  id_autor INTEGER REFERENCES autores(id_autor),
  id_categoria INTEGER REFERENCES categorias(id_categoria),
  isbn VARCHAR UNIQUE,
  anio_publicacion INTEGER,
  copias_disponibles INTEGER DEFAULT 0
);

CREATE TABLE usuarios (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  fecha_registro DATE DEFAULT (DATE('now'))
);

CREATE TABLE prestamos (
  id_prestamo INTEGER PRIMARY KEY AUTOINCREMENT,
  id_libro INTEGER REFERENCES libros(id_libro),
  id_usuario INTEGER REFERENCES usuarios(id_usuario),
  fecha_salida DATE NOT NULL DEFAULT (DATE('now')),
  fecha_devolucion_prevista DATE NOT NULL,
  devuelto BOOLEAN DEFAULT false
);

INSERT INTO autores (id_autor, nombre, nacionalidad, fecha_nacimiento) VALUES
(1, 'Robert C. Martin', 'USA', '1952-12-05'),
(2, 'J.K. Rowling', 'UK', '1965-07-31'),
(3, 'Miguel de Cervantes', 'España', '1547-09-29'),
(4, 'George R.R. Martin', 'USA', '1948-09-20'),
(5, 'Mary Shelley', 'UK', '1797-08-30');

INSERT INTO categorias (id_categoria, nombre_cat) VALUES
(1, 'Tecnología'), (2, 'Fantasía'), (3, 'Clásicos'), (4, 'Terror');

INSERT INTO libros (id_libro, titulo, id_autor, id_categoria, isbn, anio_publicacion, copias_disponibles) VALUES
(1, 'Clean Code', 1, 1, '978-0132350884', 2008, 5),
(2, 'Harry Potter', 2, 2, '978-8478884451', 1997, 3),
(3, 'Don Quijote', 3, 3, '978-8424116347', 1605, 1),
(4, 'Harry Potter y el Cáliz', 2, 2, '978-8478886456', 2000, 2),
(5, 'Juego de Tronos', 4, 2, '978-8496208377', 1996, 0),
(6, 'Frankenstein', 5, 4, '978-8420676063', 1818, 5),
(7, 'Danza de Dragones', 4, 2, '978-8496208919', 2011, 2),
(8, 'Cantar de mio Cid', NULL, 3, '978-8420676000', 1200, 2);

INSERT INTO usuarios (id_usuario, nombre_completo, email, fecha_registro) VALUES
(1, 'Laura Mota', 'laura.mota@upv.es', '2026-01-07'),
(2, 'Pablo García', 'pgarcia@gmail.com', '2026-02-14'),
(3, 'Sergio Blanco', 'sergio740@gmail.com', '2026-03-03'),
(4, 'Marta González', 'margon@yahoo.com', '2026-04-10');

INSERT INTO prestamos (id_prestamo, id_libro, id_usuario, fecha_salida, fecha_devolucion_prevista, devuelto) VALUES
(1, 1, 1, '2026-03-04', '2026-04-01', false),
(2, 2, 2, '2026-03-04', '2026-04-10', false),
(3, 4, 1, '2026-03-15', '2026-04-15', false),
(4, 6, 3, '2026-02-01', '2026-03-01', true);
