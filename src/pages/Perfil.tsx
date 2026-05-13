import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiMapPin, FiPhone, FiCreditCard, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { authRepository } from '../database/repositories/auth.repository';

const Perfil = () => {
  const navigate = useNavigate();
  
  // Datos temporales (luego vendrán de la base de datos)
  const empresa = {
    nombre: "Tintorería Jerez",
    cif: "B12345678",
    email: "tintoreriajerez@gmail.com",
    telefono: "956 123 456",
    direccion: "Calle Aguasantas, 12",
    localidad: "Jerez de la Frontera, Cádiz",
    cp: "11400"
  };

  const handleLogout = async () => {
    try {
      await authRepository.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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
            <p className="text-blue-100 opacity-90">Configuración de cuenta y empresa</p>
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
                  <p className="text-slate-500 text-sm">{empresa.cp}, {empresa.localidad}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Cerrar Sesión */}
          <div className="md:col-span-2 pt-6 border-t border-slate-50">
            <Button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-8 py-6 rounded-2xl font-bold flex items-center gap-2 transition-all w-full md:w-auto"
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