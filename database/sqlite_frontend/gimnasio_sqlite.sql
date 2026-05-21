CREATE TABLE entrenadores (
  id_entrenador INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR NOT NULL,
  especialidad VARCHAR,
  email VARCHAR UNIQUE
);

CREATE TABLE clases (
  id_clase INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_clase VARCHAR NOT NULL,
  id_entrenador INTEGER REFERENCES entrenadores(id_entrenador),
  horario_inicio TIME,
  capacidad_max INTEGER DEFAULT 20
);

CREATE TABLE clientes (
  id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  fecha_inscripcion DATE DEFAULT (DATE('now'))
);

CREATE TABLE pagos (
  id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER REFERENCES clientes(id_cliente),
  monto NUMERIC NOT NULL,
  metodo_pago VARCHAR,
  fecha_pago DATE DEFAULT (DATE('now'))
);

CREATE TABLE reservas (
  id_reserva INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER REFERENCES clientes(id_cliente),
  id_clase INTEGER REFERENCES clases(id_clase),
  dia_reserva DATE
);

INSERT INTO entrenadores (id_entrenador, nombre, especialidad, email) VALUES
(1, 'Alex Fit', 'Crossfit', 'alex@gym.com'),
(2, 'Sara Yoga', 'Pilates', 'sara@gym.com'),
(3, 'Dani Box', 'Boxeo', 'dani@gym.com'),
(4, 'Rodrigo', 'Kárate', 'rodrigo@gym.com');

INSERT INTO clientes (id_cliente, nombre_completo, email, fecha_inscripcion) VALUES
(1, 'Marc Torres', 'mtorres@gmail.com', '2026-02-02'),
(2, 'Paula Ruiz', 'pruiz@yahoo.es', '2026-03-05'),
(3, 'Jordi Valls', 'jvalls@gmail.com', '2026-03-20'),
(4, 'Carla Sanz', 'csanz@outlook.com', '2026-02-25');

INSERT INTO clases (id_clase, nombre_clase, id_entrenador, horario_inicio, capacidad_max) VALUES
(1, 'Crossfit Mañana', 1, '08:00:00', 20),
(2, 'Yoga Flow', 2, '19:00:00', 25),
(3, 'Boxeo Intenso', 3, '20:30:00', 10),
(4, 'Estiramientos en grupo', NULL, '10:00:00', 20);

INSERT INTO pagos (id_pago, id_cliente, monto, metodo_pago, fecha_pago) VALUES
(1, 1, 50, 'Tarjeta', '2026-03-10'),
(2, 1, 51, 'Efectivo', '2026-03-15'),
(3, 2, 50, 'PayPal', '2026-03-12'),
(4, 2, 50, 'Tarjeta', '2026-03-20'),
(5, 3, 49, 'Efectivo', '2026-03-22'),
(6, 3, 45, 'Tarjeta', '2026-03-25'),
(7, 3, 5, 'Efectivo', '2026-03-25'),
(8, 4, 55, 'Tarjeta', '2026-02-28'),
(9, 4, 45, 'Tarjeta', '2026-03-05'),
(10, 4, 20, 'PayPal', '2026-03-05');

INSERT INTO reservas (id_reserva, id_cliente, id_clase, dia_reserva) VALUES
(1, 1, 1, '2026-03-10'),
(2, 1, 2, '2026-03-15'),
(3, 2, 1, '2026-03-12'),
(4, 2, 3, '2026-03-20'),
(5, 3, 2, '2026-03-22'),
(6, 3, 3, '2026-03-25'),
(7, 4, 1, '2026-02-28'),
(8, 4, 2, '2026-03-05');
