import initSqlJs, { Database } from 'sql.js';
import { supabase } from '../lib/supabase';

export class DbManager {
  private static instance: DbManager;
  private sqlPromise: Promise<any>;

  private constructor() {
    this.sqlPromise = initSqlJs({
      locateFile: (file: string) => `/${file}`
    });
  }

  public static getInstance(): DbManager {
    if (!DbManager.instance) {
      DbManager.instance = new DbManager();
    }
    return DbManager.instance;
  }

  public async createLocalDbFromSupabase(schemaName: string): Promise<Database> {
    try {
      const SQL = await this.sqlPromise;
      const db = new SQL.Database();

      const { data: estructura, error: configError } = await supabase
        .rpc('obtener_estructura_esquema', { esquema_nombre: schemaName });

      if (configError || !estructura) {
        throw new Error(`No se encontró la configuración para el esquema: ${schemaName}`);
      }

      const tablas = Object.keys(estructura);

      for (const nombreTabla of tablas) {
        const { data: filas, error: dataError } = await supabase
          .schema(schemaName)
          .from(nombreTabla)
          .select('*');

        if (dataError) throw dataError;

        if (filas && filas.length > 0) {
          const columnas = Object.keys(filas[0]);

          const createQuery = `CREATE TABLE ${nombreTabla} (${columnas.map(c => `${c} TEXT`).join(', ')});`;
          db.run(createQuery);

          const insertQuery = `INSERT INTO ${nombreTabla} (${columnas.join(', ')}) VALUES (${columnas.map(() => '?').join(', ')});`;

          filas.forEach(fila => {
            db.run(insertQuery, Object.values(fila));
          });
        } else {
          const columnasDef = estructura[nombreTabla];
          if (columnasDef && columnasDef.length > 0) {
            const createQuery = `CREATE TABLE ${nombreTabla} (${columnasDef.map((c: any) => `${c.name} TEXT`).join(', ')});`;
            db.run(createQuery);
          }
        }
      }

      return db;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const dbManager = DbManager.getInstance();
