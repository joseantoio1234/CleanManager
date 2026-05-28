import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export const Navbar = () => {
  return (
    /* 🚀 NAVBAR ACTUALIZADA: Cambiado bg-white/90 por bg-slate-100 y ajustado el borde para resaltar más */
    <nav className="flex items-center justify-between px-10 py-3 bg-slate-100 sticky top-0 z-50 border-b border-slate-200 shadow-sm transition-colors">

      {/* Logo: text-xl para ajustarse a la barra más pequeña */}
      <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
        CleanManager
      </Link>

      <div className="flex items-center space-x-8">
        {/* Enlaces de navegación: texto un poco más pequeño para elegancia */}
        <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-500">
          <a href="#features" className="hover:text-blue-600 transition-colors">Características</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">Sobre el proyecto</a>
        </div>

        {/* Grupo de botones */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" className="border-none text-blue-600 hover:bg-blue-200/50 font-semibold h-9 px-4 transition-colors">
              Iniciar Sesión
            </Button>
          </Link>

          <Link to="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-5 rounded-full shadow-md shadow-blue-100 transition-all active:scale-95">
              Registrarse
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};