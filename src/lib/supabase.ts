import { createClient } from '@supabase/supabase-js';

// Usamos import.meta.env que es el estándar de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;



// Un pequeño truco para debuggear en la consola si algo falla:
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Error: No se han encontrado las variables de Supabase en el .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("URL de Supabase:", import.meta.env.VITE_SUPABASE_URL);
console.log("¿Hay Key?:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
