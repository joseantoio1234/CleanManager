export interface IEmpresa {
  id: string; 
  nombreTintoreria: string;
  nombreAdministrador: string;
  dni: string;
  direccion: string;
  codigoPostal: string;
  municipio: string;
  provincia: string;
  telefonoFijo?: string; 
  telefonoMovil: string;
  email: string;
}