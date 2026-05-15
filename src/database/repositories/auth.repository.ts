// src/database/auth.repository.ts

// Esta es la URL de tu servidor Node.js local con MySQL
const API_URL = 'http://localhost:5000/api';

export const authRepository = {
  // Registro de nueva empresa enviando los datos a nuestro Backend local
  signUp: async (email: string, password: string, companyData: any) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_tintoreria: companyData.nombre_tintoreria,
          cif: companyData.cif,
          direccion: companyData.direccion,
          telefono_fijo: companyData.telefono_fijo,
          codigo_postal: companyData.codigo_postal,
          municipio: companyData.municipio,
          provincia: companyData.provincia,
          email_acceso: email,
          password: password // El servidor se encargará de encriptarla
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (error: any) {
      console.error("Error en authRepository:", error);
      throw error;
    }
  },

  // Preparado para el futuro Login
  signIn: async (email: string, password: string) => {
    // Aquí haremos el fetch a /api/login más adelante
    console.log("Login con MySQL pendiente de implementar");
  },

  // Añadido para que NavbarPrivate funcione correctamente sin errores de compilación
  signOut: async () => {
    try {
      // Como estamos trabajando de forma local y temporal, de momento
      // solo simulamos el cierre de sesión limpiando consola o estados futuros
      console.log("Sesión cerrada localmente en MySQL");
      return { success: true };
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  }
};