import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiUser,
  FiTag, 
  FiFileText, 
  FiArrowRight,
  FiLayers // 🚀 Icono limpio para la gestión de servicios
} from 'react-icons/fi';

const InicioAdmin = () => {
  const navigate = useNavigate();
  const nombreTintoreria = localStorage.getItem('nombre_tintoreria') || 'Tintorería';

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col items-center animate-in fade-in duration-300">
      
      {/* CABECERA DE BIENVENIDA */}
      <div className="w-full max-w-7xl mb-8 text-left">
        <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
          Panel de Gerencia
        </span>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-2">
          ¡Hola, Administrador!
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Gestionando los recursos, tarifas y cuentas fiscales de <span className="font-bold text-slate-500">{nombreTintoreria}</span>.
        </p>
      </div>

      {/* SECCIÓN DE NAVEGACIÓN MÓDULOS DE ADMINISTRADOR */}
      <div className="w-full max-w-7xl text-left mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Módulos de Control</h2>
      </div>

      {/* REJILLA TOTALMENTE SIMÉTRICA DE 5 COLUMNAS ✨ */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Enlace: Catálogo de Tarifas */}
        <div 
          onClick={() => navigate('/prendas')}
          className="bg-white p-5 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-60 text-left group"
        >
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-fit">
            <FiTag size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Precios y Tarifas</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Modifica los precios base, añade nuevas prendas y mantén al día el catálogo comercial del negocio.
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Gestionar catálogo <FiArrowRight size={14}/>
          </div>
        </div>

        {/* 🚀 CORREGIDO: Enlace Servicios de Limpieza (Card Unificada sin línea azul lateral) */}
        <div 
          onClick={() => navigate('/servicios')}
          className="bg-white p-5 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-60 text-left group"
        >
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl w-fit">
            <FiLayers size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
              Servicios de Limpieza
            </h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Configura los flujos operativos del taller: añade lavados, planchados o limpiezas en seco personalizadas.
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Configurar servicios <FiArrowRight size={14}/>
          </div>
        </div>

        {/* Enlace: Gestión de Plantilla (Operarios) */}
        <div 
          onClick={() => navigate('/admin-empleados')}
          className="bg-white p-5 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-60 text-left group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
            <FiUsers size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Control de Plantilla</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Genera las credenciales de acceso para nuevos empleados en mostrador y audita tu personal.
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Gestionar operarios <FiArrowRight size={14}/>
          </div>
        </div>

        {/* Enlace: Control y Censo de Clientes */}
        <div 
          onClick={() => navigate('/admin-clientes')}
          className="bg-white p-5 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-60 text-left group"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
            <FiUser size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Control de Clientes</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Supervisa el censo de clientes del local, modifica sus datos de contacto o elimina registros obsoletos.
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Gestionar clientes <FiArrowRight size={14}/>
          </div>
        </div>

        {/* Enlace: Auditoría Fiscal (Historial de Facturas) */}
        <div 
          onClick={() => navigate('/admin-facturas')}
          className="bg-white p-5 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-60 text-left group"
        >
          <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl w-fit">
            <FiFileText size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Historial Fiscal e IVA</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Inspecciona las facturas legales emitidas automáticamente desde caja con desglose de impuestos.
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Auditar facturas <FiArrowRight size={14}/>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InicioAdmin;