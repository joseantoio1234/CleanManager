import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export const Navbar = () => {
  return (
    /* py-3 para una altura más compacta y shadow-sm para un toque de profundidad */
    <nav className="flex items-center justify-between px-10 py-3 bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-blue-50 shadow-sm">

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
            <Button variant="outline" className="border-none text-blue-600 hover:bg-blue-50 font-semibold h-9 px-4">
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