import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center text-center bg-linear-to-b from-blue-50 to-white px-4">
        <div className="max-w-4xl">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Gestión de Tintorerías
          </span>
          <h1 className="mt-8 text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            La gestión de tu negocio, <br /> 
            <span className="text-blue-600">ahora más impecable que nunca.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            CleanManager es la solución integral diseñada para optimizar el flujo de trabajo en tintorerías y lavanderías. Control de pedidos, clientes y estados en una sola plataforma.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-10">
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl mb-6 flex items-center justify-center text-white font-bold text-xl">1</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Control Total</h3>
            <p className="text-slate-600 leading-relaxed">Gestión de entrada y salida de prendas con estados en tiempo real (Pendiente, Lavado, Listo).</p>
          </div>
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-400 rounded-2xl mb-6 flex items-center justify-center text-white font-bold text-xl">2</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">CRM Integrado</h3>
            <p className="text-slate-600 leading-relaxed">Base de datos de clientes optimizada para un contacto rápido y seguimiento de sus preferencias.</p>
          </div>
          <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100">
            <div className="w-12 h-12 bg-blue-200 rounded-2xl mb-6 flex items-center justify-center text-blue-700 font-bold text-xl">3</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Análisis y Datos</h3>
            <p className="text-slate-600 leading-relaxed">Visualiza el rendimiento de tu negocio mediante un panel intuitivo y moderno.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-blue-300 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para digitalizar tu tintorería?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Únete a la nueva era de la gestión textil con CleanManager.</p>
            <Link to="/login">
              <Button className="bg-blue text-blue-600 shadow-blue-300 px-10 py-7 text-lg font-bold rounded-2xl">
                Acceder al Panel
              </Button>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-20 -mt-20 opacity-50"></div>
        </div>
      </section>

    
    </div>
  );
};

export default Landing;