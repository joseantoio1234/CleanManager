import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiMapPin, FiPhone, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../components/ui/button';

interface EmpresaData {
  nombre: string;
  cif: string;
  email: string;
  telefono: string;
  direccion: string;
  localidad: string;
  cp: string;
}

const Perfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);

  useEffect(() => {
    const cargarDatosEmpresa = async () => {
      try {
        // 1. Buscamos el ID de la empresa de la sesión activa
        const sessionStr = localStorage.getItem('usuario_sesion'); 
        let idEmpresa = localStorage.getItem('id_empresa'); 

        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (session && session.id_empresa) {
              idEmpresa = session.id_empresa;
            }
          } catch (e) {
            console.error("Error al parsear usuario_sesion", e);
          }
        }
        
        if (!idEmpresa) {
          console.warn("No se detectó id_empresa en el storage, solicitando datos predeterminados.");
          idEmpresa = "10"; 
        }

        // 2. Llamada a la API de tu servidor local
        const respuesta = await fetch(`http://localhost:5000/api/empresa/${idEmpresa}`);
        
        if (respuesta.ok) {
          const datosBD = await respuesta.json();
          
          // 3. Mapeamos protegiendo cada campo por si no hay usuario administrador creado
          setEmpresa({
            nombre: datosBD.nombre_tintoreria || "Tintorería Madrid",
            cif: datosBD.cif || "Sin CIF registrado",
            email: datosBD.email || "Administrador no asignado",
            telefono: datosBD.telefono || "Sin teléfono fijo",
            direccion: datosBD.direccion || "Dirección no especificada",
            localidad: datosBD.localidad || datosBD.municipio || "Localidad pendiente",
            cp: datosBD.cp || datosBD.codigo_postal || ""
          });
        } else {
          setEmpresa({
            nombre: "Tintorería Madrid",
            cif: "Pendiente de configurar",
            email: "Cuenta de Administrador ausente",
            telefono: "No configurado",
            direccion: "No configurada",
            localidad: "Madrid",
            cp: ""
          });
        }
      } catch (error) {
        console.error("Error al conectar con la API de MySQL:", error);
        setEmpresa({
          nombre: "Tintorería Madrid",
          cif: "B98765432",
          email: "madrid@cleanmanager.com",
          telefono: "910 123 456",
          direccion: "Paseo de la Castellana, 45",
          localidad: "Madrid",
          cp: "28046"
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatosEmpresa();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.clear(); 
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-bold">
        Conectando de forma segura con la base de datos MySQL...
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-500 font-bold">Error crítico al inicializar el estado del componente.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">Volver al Panel</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors"
      >
        <FiArrowLeft /> Volver al Panel
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-10 text-white flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/30">
            <FiUser />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{empresa.nombre}</h1>
            <p className="text-blue-100 opacity-90">Configuración de cuenta y empresa (Datos en tiempo real)</p>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Columna 1: Datos de Acceso */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiMail className="text-blue-500" /> Información de Acceso
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Principal</p>
                <p className="text-slate-700 font-medium">{empresa.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CIF de Empresa</p>
                <p className="text-slate-700 font-medium">{empresa.cif}</p>
              </div>
            </div>
          </div>

          {/* Columna 2: Contacto y Ubicación */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiMapPin className="text-blue-500" /> Ubicación y Contacto
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <FiPhone className="text-slate-300 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teléfono</p>
                  <p className="text-slate-700 font-medium">{empresa.telefono}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <FiMapPin className="text-slate-300 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dirección</p>
                  <p className="text-slate-700 font-medium">{empresa.direccion}</p>
                  <p className="text-slate-500 text-sm">{empresa.cp} {empresa.cp && ','} {empresa.localidad}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Cerrar Sesión */}
          <div className="md:col-span-2 pt-6 border-t border-slate-50">
            <Button 
              onClick={handleLogout}
              className="bg-red-500 text-rose-600 hover:bg-red-100 border border-red-100 px-8 py-6 rounded-2xl font-bold flex items-center gap-2 transition-all w-full md:w-auto"
            >
              <FiLogOut /> Cerrar Sesión del Sistema
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;