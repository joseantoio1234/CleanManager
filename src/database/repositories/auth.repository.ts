// src/database/repositories/auth.repository.ts
import { supabase } from '../supabase/client';

export const authRepository = {
  // Iniciar sesión con email y contraseña
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Registro de nueva empresa
  signUp: async (email: string, password: string, companyData: any) => {
    // 1. Registramos al usuario en la capa de autenticación de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Si el usuario se creó correctamente, insertamos sus detalles en la tabla 'empresa'
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('empresa')
        .insert([
          { 
            // Usamos los nombres de columnas exactos de tu SQL
            id_empresa: authData.user.id, 
            nombre_tintoreria: companyData.nombre_tintoreria,
            cif: companyData.cif,
            direccion: companyData.direccion,
            codigo_postal: companyData.codigo_postal, 
            municipio: companyData.municipio, 
            provincia: companyData.provincia,
            telefono_fijo: companyData.telefono_fijo,
            email_acceso: companyData.email_acceso
          }
        ]);

      if (dbError) {
        console.error("Error al insertar en tabla empresa:", dbError.message);
        throw dbError;
      }
    }

    return authData;
  },

  // Obtener los datos de la empresa logueada actualmente
  // Útil para mostrar el nombre en el Navbar o Dashboard
  getCurrentEmpresa: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('empresa')
      .select('*')
      .eq('id_empresa', user.id)
      .single();

    if (error) {
      console.error("Error al obtener datos de la empresa:", error.message);
      return null;
    }
    
    return data;
  },

  // Cerrar sesión
  signOut: () => supabase.auth.signOut(),
};