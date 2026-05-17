import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiBox, 
    FiPlusCircle, 
    FiDollarSign, 
    FiUsers, 
    FiSettings, 
    FiLogOut 
} from 'react-icons/fi';

const Inicio = () => {
    const navigate = useNavigate();

    // Recuperamos dinámicamente el nombre guardado durante el Login (fallback por si acaso)
    const nombreTintoreria = localStorage.getItem('nombre_tintoreria') || "Tintorería Jerez"; 

    // Función limpia para cerrar la sesión activa del usuario
    const handleCerrarSesion = () => {
        localStorage.clear(); // Limpiamos los tokens, id_empresa y nombres cargados
        navigate('/login');   // Redirigimos al formulario de entrada
    };

    // Configuración modular de las tarjetas del menú principal adaptadas al empleado
    const modulos = [
        {
            title: "Panel de Control",
            description: "Gestión del taller, estados de lavado de prendas y avisos en tiempo real.",
            icon: <FiBox />,
            path: "/dashboard",
            color: "bg-blue-600 shadow-blue-100",
            badge: "Taller"
        },
        {
            title: "Nueva Recepción",
            description: "Registrar la entrada de ropa, asociar cliente, seleccionar servicio e imprimir ticket.",
            icon: <FiPlusCircle />,
            path: "/nuevo-pedido", 
            color: "bg-amber-500 shadow-amber-100",
            badge: "Mostrador"
        },
        {
            title: "Entregas y Cobros",
            description: "Buscar pedidos listos, gestionar el cobro en caja y emitir el ticket fiscal.",
            icon: <FiDollarSign />,
            path: "/cobros", // CORREGIDO: Ahora te redirige directamente al panel TPV de caja
            color: "bg-indigo-600 shadow-indigo-100",
            badge: "Caja"
        },
        {
            title: "Fichas de Clientes",
            description: "Listado de clientes, consulta de historiales de pedidos, saldos y datos de contacto.",
            icon: <FiUsers />,
            path: "/clientes",
            color: "bg-emerald-600 shadow-emerald-100",
            badge: "Consultas"
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-10 animate-in fade-in duration-300">
            
            {/* Cabecera de Bienvenida del HUB */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Operador de Mostrador
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight pt-1">
                        ¡Hola de nuevo, {nombreTintoreria}!
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Selecciona la acción u operación que vas a realizar en este momento.
                    </p>
                </div>
                
                {/* Botón rápido de cerrar sesión */}
                <button 
                    onClick={handleCerrarSesion}
                    className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 border border-rose-200/30"
                >
                    <FiLogOut /> Cerrar Sesión
                </button>
            </div>

            {/* Cuadrícula (Grid) de Módulos Operativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modulos.map((modulo, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(modulo.path)}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between gap-6 cursor-pointer hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200/50 transition-all duration-300 active:scale-[0.99] group select-none relative overflow-hidden"
                    >
                        {/* Contenido Superior de la Card */}
                        <div className="flex gap-5 items-start">
                            <div className={`${modulo.color} p-5 rounded-2xl text-white text-3xl shadow-lg transition-transform group-hover:scale-105 duration-300 shrink-0`}>
                                {modulo.icon}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {modulo.title}
                                    </h3>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    {modulo.description}
                                </p>
                            </div>
                        </div>

                        {/* Detalle Inferior / Badge */}
                        <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {modulo.badge}
                            </span>
                            <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                Abrir Módulo →
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Módulo de soporte / aviso rápido */}
            <div className="bg-slate-900/5 border border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3">
                    <div className="text-slate-400 text-xl"><FiSettings /></div>
                    <p className="text-xs text-slate-500 font-medium">
                        ¿Una prenda no aparece en la lista o necesitas reportar una incidence con un precio? Contacta con el <span className="font-bold text-slate-700">Administrador del Sistema</span>.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Inicio;