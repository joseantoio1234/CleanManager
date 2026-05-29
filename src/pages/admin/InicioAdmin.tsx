import { useNavigate } from 'react-router-dom';
import { 
  FiUser,
  FiTag, 
  FiFileText, 
  FiArrowRight,
  FiLayers 
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

      <div className="w-full max-w-7xl text-left mb-5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Módulos de Control</h2>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Enlace: Catálogo de Tarifas */}
        <div 
          onClick={() => navigate('/prendas')}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-80 text-left group"
        >
          <div className="space-y-5">
            <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <FiTag size={26} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">
                Precios y Tarifas
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Modifica los precios base, añade nuevas prendas y mantén al día el catálogo comercial del negocio.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            <span>Gestionar catálogo</span> <FiArrowRight size={14}/>
          </div>
        </div>

        {/* 2. Enlace: Servicios de Limpieza */}
        <div 
          onClick={() => navigate('/servicios')}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-80 text-left group"
        >
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <FiLayers size={26} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">
                Servicios de Limpieza
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Configura los flujos operativos del taller: añade lavados, planchados o limpiezas en seco personalizadas.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            <span>Configurar servicios</span> <FiArrowRight size={14}/>
          </div>
        </div>

        {/* 3. Enlace: Control y Censo de Clientes */}
        <div 
          onClick={() => navigate('/admin-clientes')}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-80 text-left group"
        >
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <FiUser size={26} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">
                Control de Clientes
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Supervisa el censo de clientes del local, modifica sus datos de contacto o elimina registros obsoletos.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            <span>Gestionar clientes</span> <FiArrowRight size={14}/>
          </div>
        </div>

        {/* 4. Enlace: Auditoría Fiscal (Historial de Facturas) */}
        <div 
          onClick={() => navigate('/admin-facturas')}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/20 border border-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-80 text-left group"
        >
          <div className="space-y-5">
            <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <FiFileText size={26} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">
                Historial Fiscal e IVA
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Inspecciona las facturas legales emitidas automáticamente desde caja con desglose de impuestos.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1 pt-2 group-hover:gap-2 transition-all">
            <span>Auditar facturas</span> <FiArrowRight size={14}/>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InicioAdmin;