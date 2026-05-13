import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { authRepository } from '../../database/repositories/auth.repository';

export const NavbarPrivate = () => {
  const navigate = useNavigate();
  // Por ahora hardcodeamos el nombre, luego vendrá de Supabase
  const userName = "Tintorería Jerez";

  const handleLogout = async () => {
    try {
      await authRepository.signOut();
      navigate('/'); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo Izquierda */}
      <Link to="/dashboard" className="text-2xl font-bold text-blue-600 tracking-tight">
        CleanManager
      </Link>

      {/* Perfil Usuario Derecha */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-sm font-bold text-slate-700">{userName}</span>
        </div>
        
        {/* Contenedor del Avatar y Menú Desplegable */}
        <div className="relative group">
          {/* Cuadrado con Avatar */}
          <div className="w-10 h-10 bg-blue-100 border-2 border-blue-200 rounded-xl flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <FiUser size={20} />
          </div>

          {/* Menú desplegable al hacer Hover */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-50 py-2 hidden group-hover:block transition-all animate-in fade-in slide-in-from-top-1">
            <Link 
              to="/perfil" 
              className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <FiSettings size={14} /> Mi Perfil
            </Link>
            
            <hr className="my-1 border-slate-50" />
            
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
            >
              <FiLogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};