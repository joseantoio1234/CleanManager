// src/database/auth.repository.ts

// Esta es la URL de tu servidor Node.js local con MySQL
const API_URL = 'http://localhost:5000/api';

// 🚀 INTERFAZ ACTUALIZADA: Añadidos teléfono y email con tipado flexible
interface OrderData {
  id_empresa: number;
  prenda: string;
  cliente: string;
  servicio: string;
  estado: string; 
  total: number;
  telefono?: string | null; // 🌟 Reconocido de forma oficial
  email?: string | null;    // 🌟 Reconocido de forma oficial
}

export const authRepository = {
  // Registro de nueva empresa + primer usuario administrador en la base de datos relacional
  signUp: async (username: string, password: string, companyData: any) => {
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
          email: companyData.email, // El correo de contacto corporativo de la empresa
          username: username,       // El alias corto para el login del dueño
          password: password        // Se enviará seguro para encriptarse con bcrypt en el servidor
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (error: any) {
      console.error("Error en authRepository (signUp):", error);
      throw error;
    }
  },

  // Inicio de sesión cruzado e inteligente (Mapeado para la tabla 'usuario')
  signIn: async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Usuario o contraseña incorrectos.');
      }

      // Devuelve los datos de sesión: id_usuario, id_empresa, username, rol, nombre_tintoreria
      return data; 
    } catch (error: any) {
      console.error("Error en authRepository (signIn):", error);
      throw error;
    }
  },

  // Cierre de sesión de la aplicación
  signOut: async () => {
    try {
      // Al trabajar con sesiones locales de momento, limpiamos el entorno
      console.log("Sesión cerrada localmente en MySQL");
      return { success: true };
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  },

  // ==========================================
  // CREAR PEDIDO EN LA BASE DE DATOS
  // ==========================================
  createOrder: async (orderData: OrderData) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el nuevo pedido');
      }

      return data;
    } catch (error: any) {
      console.error("Error en authRepository (createOrder):", error);
      throw error;
    }
  }
};