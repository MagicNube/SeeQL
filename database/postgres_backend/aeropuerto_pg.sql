CREATE SCHEMA IF NOT EXISTS dificil_aeropuerto;

CREATE TABLE dificil_aeropuerto.aeropuertos (
  id_aeropuerto SERIAL PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  ciudad VARCHAR,
  codigo_iata VARCHAR NOT NULL UNIQUE
);

CREATE TABLE dificil_aeropuerto.modelos_avion (
  id_modelo SERIAL PRIMARY KEY,
  fabricante VARCHAR,
  nombre_modelo VARCHAR,
  capacidad_pasajeros INTEGER
);

CREATE TABLE dificil_aeropuerto.aviones (
  id_avion SERIAL PRIMARY KEY,
  matricula VARCHAR NOT NULL UNIQUE,
  id_modelo INTEGER REFERENCES dificil_aeropuerto.modelos_avion(id_modelo),
  estado VARCHAR DEFAULT 'activo'
);

CREATE TABLE dificil_aeropuerto.pasajeros (
  id_pasajero SERIAL PRIMARY KEY,
  nombre_completo VARCHAR NOT NULL,
  pasaporte VARCHAR NOT NULL UNIQUE,
  nacionalidad VARCHAR
);

CREATE TABLE dificil_aeropuerto.pilotos (
  id_piloto SERIAL PRIMARY KEY,
  nombre_completo VARCHAR NOT NULL,
  licencia VARCHAR UNIQUE,
  horas_vuelo INTEGER DEFAULT 0
);

CREATE TABLE dificil_aeropuerto.vuelos (
  id_vuelo SERIAL PRIMARY KEY,
  numero_vuelo VARCHAR NOT NULL UNIQUE,
  id_avion INTEGER REFERENCES dificil_aeropuerto.aviones(id_avion),
  id_aeropuerto_origen INTEGER REFERENCES dificil_aeropuerto.aeropuertos(id_aeropuerto),
  id_aeropuerto_destino INTEGER REFERENCES dificil_aeropuerto.aeropuertos(id_aeropuerto),
  id_piloto INTEGER REFERENCES dificil_aeropuerto.pilotos(id_piloto)
);

CREATE TABLE dificil_aeropuerto.reservas (
  id_reserva SERIAL PRIMARY KEY,
  id_vuelo INTEGER REFERENCES dificil_aeropuerto.vuelos(id_vuelo),
  id_pasajero INTEGER REFERENCES dificil_aeropuerto.pasajeros(id_pasajero),
  asiento VARCHAR,
  clase VARCHAR DEFAULT 'turista',
  precio_billete NUMERIC
);

INSERT INTO dificil_aeropuerto.aeropuertos (id_aeropuerto, nombre, ciudad, codigo_iata) VALUES
(1, 'Adolfo Suárez Madrid-Barajas', 'Madrid', 'MAD'),
(2, 'Josep Tarradellas Barcelona-El Prat', 'Barcelona', 'BCN'),
(3, 'John F. Kennedy International', 'New York', 'JFK'),
(4, 'London Heathrow', 'London', 'LHR');

INSERT INTO dificil_aeropuerto.modelos_avion (id_modelo, fabricante, nombre_modelo, capacidad_pasajeros) VALUES
(1, 'Airbus', 'A320neo', 186),
(2, 'Boeing', '787-9 Dreamliner', 290),
(3, 'Boeing', '787 Dreamliner', 250),
(4, 'Boeing', '737 MAX', 170),
(5, 'Airbus', 'A380', 505);

INSERT INTO dificil_aeropuerto.pasajeros (id_pasajero, nombre_completo, pasaporte, nacionalidad) VALUES
(1, 'Marta Vidal', 'PA9876543', 'Española'),
(2, 'James Wilson', 'US1234567', 'Estadounidense'),
(3, 'Laura Miller', 'UK7654321', 'Británica'),
(4, 'John Smith', 'US9988776', 'Estadounidense'),
(5, 'Emma Watson', 'UK1122334', 'Británica');

INSERT INTO dificil_aeropuerto.pilotos (id_piloto, nombre_completo, licencia, horas_vuelo) VALUES
(1, 'Javier Mendoza', 'EASA-102938', 4500),
(2, 'Robert Harrison', 'FAA-992011', 8200),
(3, 'Luisa Fernández', 'EASA-33', 5200);

INSERT INTO dificil_aeropuerto.aviones (id_avion, matricula, id_modelo, estado) VALUES
(1, 'EC-NPR', 1, 'activo'),
(2, 'N834AA', 2, 'activo'),
(3, 'N888XX', 3, 'activo'),
(4, 'EC-LXY', 1, 'activo'),
(5, 'EC-MZS', 1, 'mantenimiento'),
(6, 'N900AA', 2, 'activo'),
(7, 'N899XX', 3, 'inactivo'),
(8, 'N737ZZ', 4, 'activo');

INSERT INTO dificil_aeropuerto.vuelos (id_vuelo, numero_vuelo, id_avion, id_aeropuerto_origen, id_aeropuerto_destino, id_piloto) VALUES
(1, 'IB0123', 1, 1, 2, 1),
(2, 'BA0116', 2, 3, 4, 2),
(3, 'IB0124', 1, 1, 3, 1),
(4, 'BA0117', 3, 3, 1, 3),
(5, 'BA0118', 3, 3, 2, 3);

INSERT INTO dificil_aeropuerto.reservas (id_reserva, id_vuelo, id_pasajero, asiento, clase, precio_billete) VALUES
(1, 1, 1, '14F', 'turista', 75.5),
(2, 2, 2, '02A', 'business', 1450),
(3, 2, 3, '22C', 'turista', 420),
(4, 3, 4, '12A', 'business', 1450),
(5, 4, 5, '30C', 'turista', 85.5);

SELECT setval('dificil_aeropuerto.aeropuertos_id_aeropuerto_seq', (SELECT MAX(id_aeropuerto) FROM dificil_aeropuerto.aeropuertos));
SELECT setval('dificil_aeropuerto.modelos_avion_id_modelo_seq', (SELECT MAX(id_modelo) FROM dificil_aeropuerto.modelos_avion));
SELECT setval('dificil_aeropuerto.pasajeros_id_pasajero_seq', (SELECT MAX(id_pasajero) FROM dificil_aeropuerto.pasajeros));
SELECT setval('dificil_aeropuerto.pilotos_id_piloto_seq', (SELECT MAX(id_piloto) FROM dificil_aeropuerto.pilotos));
SELECT setval('dificil_aeropuerto.aviones_id_avion_seq', (SELECT MAX(id_avion) FROM dificil_aeropuerto.aviones));
SELECT setval('dificil_aeropuerto.vuelos_id_vuelo_seq', (SELECT MAX(id_vuelo) FROM dificil_aeropuerto.vuelos));
SELECT setval('dificil_aeropuerto.reservas_id_reserva_seq', (SELECT MAX(id_reserva) FROM dificil_aeropuerto.reservas));
