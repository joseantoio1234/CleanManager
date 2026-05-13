import { createClient } from '@supabase/supabase-js';

// Forzamos la lectura de las variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para que verifiques en la consola del navegador (F12)
console.log("Configuración detectada:", { 
  url: supabaseUrl ? "OK" : "VACÍO", 
  key: supabaseAnonKey ? "OK" : "VACÍO" 
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Las credenciales de Supabase no están configuradas correctamente en el archivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);