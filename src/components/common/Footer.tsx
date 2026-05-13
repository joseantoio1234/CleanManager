import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-blue-100 pt-16 pb-8 px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Columna 1: Logo y Eslogan */}
        <div className="col-span-1 md:col-span-1">
          <div className="text-xl font-bold text-blue-600 mb-4">
            CleanManager
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Optimización inteligente para negocios textiles. La solución definitiva para el control de procesos de limpieza.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Producto</h4>
          <ul className="space-y-4 text-sm text-slate-600">
            <li><a href="#features" className="hover:text-blue-600 transition-colors">Características</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Precios</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Guía de uso</a></li>
          </ul>
        </div>

        {/* Columna 3: Proyecto TFG */}
        <div>
          <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Sobre el TFG</h4>
          <ul className="space-y-4 text-sm text-slate-600">
            <li><span className="block italic text-slate-400">Desarrollado por:</span></li>
            <li className="font-medium text-slate-800">Jose Antonio</li>
            <li><span className="block italic text-slate-400">Tutoría:</span></li>
            <li className="text-slate-800">I.E.S. Albarregas</li>
          </ul>
        </div>

        {/* Columna 4: Legal / Acceso */}
        <div>
          <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="space-y-4 text-sm text-slate-600">
            <li><Link to="/login" className="hover:text-blue-600 transition-colors">Acceso de Empleados</Link></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Política de Privacidad</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Términos de Servicio</a></li>
          </ul>
        </div>
      </div>

      {/* Barra Inferior de Copyright */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <p>© {currentYear} CleanManager. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <span>React + Tailwind + Supabase</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;