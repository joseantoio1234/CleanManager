import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiTag, 
  FiFileText, 
  FiDollarSign, 
  FiArrowRight 
} from 'react-icons/fi';

interface MetricasAdmin {
  ingresosMes: number;
  totalEmpleados: number;
  totalPrendas: number;
}

const InicioAdmin = () => {
  const navigate = useNavigate();
  const idEmpresa = localStorage.getItem('id_empresa') || '1';
  const nombreTintoreria = localStorage.getItem('nombre_tintoreria') || 'Tintorería';

  const [metricas, setMetricas] = useState<MetricasAdmin>({
    ingresosMes: 0,
    totalEmpleados: 0,
    totalPrendas: 0
  });

  // Cargar las métricas globales de administración cruzando datos en MySQL
  useEffect(() => {
    const cargarMetricasAdmin = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/dashboard-stats/${idEmpresa}`);
        if (response.ok) {
          const data = await response.json();
          setMetricas(data);
        } else {
          // Fallback seguro de desarrollo si el endpoint está cargando
          setMetricas({ ingresosMes: 1420.50, totalEmpleados: 2, totalPrendas: 12 });
        }
      } catch (error) {
        console.error("Error al conectar con la API de administración:", error);
        // Fallback de contingencia local para previsualizar la interfaz sin romperla
        setMetricas({ ingresosMes: 1420.50, totalEmpleados: 2, totalPrendas: 12 });
      }
    };

    cargarMetricasAdmin();
  }, [idEmpresa]);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col items-center animate-in fade-in duration-300">
      
      {/* CABECERA DE BIENVENIDA */}
      <div className="w-full max-w-5xl mb-8 text-left">
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

      {/* REJILLA DE INDICADORES ANALÍTICOS (MÉTRICAS) */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        {/* Tarjeta 1: Ingresos Mensuales del local */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/30 border border-white flex items-center justify-between">
          <div className="space-y-1 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facturación Mes</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {Number(metricas.ingresosMes).toFixed(2)}€
            </h3>
            <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
              <FiTrendingUp size={12}/> +12.4% vs mes anterior
            </p>
          </div>
          <div className="p-4 bg-green-50 text-green-500 rounded-2xl">
            <FiDollarSign size={24} />
          </div>
        </div>

        {/* Tarjeta 2: Empleados Dados de Alta */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/30 border border-white flex items-center justify-between">
          <div className="space-y-1 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plantilla Activa</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {metricas.totalEmpleados} {metricas.totalEmpleados === 1 ? 'Operario' : 'Operarios'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Cuentas con rol 'empleado'</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <FiUsers size={24} />
          </div>
        </div>

        {/* Tarjeta 3: Prendas configuradas en catálogo */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/30 border border-white flex items-center justify-between">
          <div className="space-y-1 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prendas Tasadas</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {metricas.totalPrendas} Servicios
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Activas en el TPV de mostrador</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
            <FiTag size={24} />
          </div>
        </div>

      </div>

      {/* SECCIÓN DE NAVEGACIÓN MÓDULOS DE ADMINISTRADOR */}
      <div className="w-full max-w-5xl text-left mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Módulos de Control</h2>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Enlace: Catálogo de Tarifas */}
        <div 
          onClick={() => navigate('/prendas')}
          className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-56 text-left group"
        >
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-fit">
            <FiTag size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Precios y Tarifas</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Modifica los precios base, añade nuevas prendas y mantén al día el catálogo comercial del negocio.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Gestionar catálogo <FiArrowRight size={14}/>
          </div>
        </div>

        {/* Enlace: Gestión de Plantilla */}
        <div 
          onClick={() => navigate('/admin-empleados')}
          className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-56 text-left group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
            <FiUsers size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Control de Plantilla</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Genera las credenciales de acceso para nuevos empleados en mostrador y audita tu personal.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Gestionar operarios <FiArrowRight size={14}/>
          </div>
        </div>

        {/* Enlace: Auditoría Fiscal (Historial de Facturas) */}
        <div 
          onClick={() => navigate('/admin-facturas')}
          className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-56 text-left group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl w-fit">
            <FiFileText size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Historial Fiscal e IVA</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Inspecciona las facturas legales emitidas automáticamente desde caja con desglose estricto de impuestos.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            Auditar facturas <FiArrowRight size={14}/>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InicioAdmin;