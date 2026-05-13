export interface IEmpresa {
  id: string; // ID único vinculado a la autenticación
  nombreTintoreria: string;
  nombreAdministrador: string;
  dni: string;
  direccion: string;
  codigoPostal: string;
  municipio: string;
  provincia: string;
  telefonoFijo?: string; // El signo '?' indica que es opcional
  telefonoMovil: string;
  email: string;
  // La contraseña no se guarda en la interfaz por seguridad, 
  // solo se usa en el momento del registro.
}