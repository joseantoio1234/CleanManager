import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { authRepository } from '../../database/repositories/auth.repository';

export const NavbarPrivate = () => {
  const navigate = useNavigate();
  
  // Extraemos dinámicamente el nombre real de la empresa guardado al registrarse o hacer login
  const userName = localStorage.getItem('nombre_tintoreria') || "Mi Tintorería";

  const handleLogout = async () => {
    try {
      await authRepository.signOut();
      localStorage.clear(); 
      navigate('/login');   
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <nav className="w-full bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 print:hidden">
      {/* Logo Izquierda */}
      <Link to="/inicio" className="text-2xl font-bold text-blue-600 tracking-tight select-none">
        CleanManager
      </Link>

      {/* Perfil Usuario y Acciones Derecha */}
      <div className="flex items-center gap-4">
        
        {/* 1. Nombre dinámico de la empresa registrada */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-bold text-slate-700">{userName}</span>
        </div>
        
        {/* 2. Contenedor del Avatar y Menú Desplegable */}
        <div className="relative group">
          {/* Cuadrado con Avatar */}
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <FiUser size={18} />
          </div>

          {/* Menú desplegable complementario al hacer Hover */}
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover:block transition-all animate-in fade-in slide-in-from-top-1 z-50">
            <Link 
              to="/perfil" 
              className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <FiSettings size={14} /> Ajustes de Perfil
            </Link>
          </div>
        </div>

        {/* 3. BOTÓN CERRAR SESIÓN: Colocado al final a la derecha del todo */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3.5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 border border-rose-200/20 shadow-sm shadow-rose-100/30"
        >
          <FiLogOut size={13} /> Cerrar Sesión
        </button>

      </div>
    </nav>
  );
};