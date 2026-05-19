import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiTrendingUp, 
    FiTag, 
    FiSliders, 
    FiClipboard,
    FiSettings 
} from 'react-icons/fi';

const InicioAdmin = () => {
    const navigate = useNavigate();

    // Recuperamos el nombre real de la empresa guardado en el login
    const nombreTintoreria = localStorage.getItem('nombre_tintoreria') || "Tintorería Jerez"; 

    // Configuración modular de las tarjetas exclusivas del Administrador
    const modulos = [
        {
            title: "Informes y Analíticas",
            description: "Evolución de ingresos mensuales, balance de facturación de IVA y estadísticas de prendas top.",
            icon: <FiTrendingUp />,
            path: "/admin-analiticas", // Pantalla que crearemos a continuación
            color: "bg-indigo-600 shadow-indigo-100",
            badge: "Estrategia"
        },
        {
            title: "Catálogo de Tarifas",
            description: "Administrar el maestro oficial de prendas, actualizar precios base y configurar tratamientos.",
            icon: <FiTag />,
            path: "/prendas", // Reutilizamos tu tabla de prendas, pero con permisos de edición
            color: "bg-amber-500 shadow-amber-100",
            badge: "Precios"
        },
        {
            title: "Auditoría de Pedidos",
            description: "Supervisar el histórico total de encargos, controlar incidencias y estados del taller.",
            icon: <FiClipboard />,
            path: "/dashboard", // El administrador puede ver el taller desde arriba
            color: "bg-blue-600 shadow-blue-100",
            badge: "Auditoría"
        },
        {
            title: "Datos Fiscales y Local",
            description: "Configurar el CIF de la empresa, dirección del local, teléfono y términos legales del ticket.",
            icon: <FiSliders />,
            path: "/perfil",
            color: "bg-emerald-600 shadow-emerald-100",
            badge: "Configuración"
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-10 animate-in fade-in duration-300">
            
            {/* Cabecera de Bienvenida del Administrador */}
            <div className="flex flex-col justify-start bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-full">
                <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Panel del Administrador
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight pt-1">
                        Control Maestro: {nombreTintoreria}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Revisa el rendimiento comercial, audita las operaciones del taller o ajusta las tarifas del catálogo.
                    </p>
                </div>
            </div>

            {/* Cuadrícula (Grid) de Módulos de Gestión */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modulos.map((modulo, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(modulo.path)}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between gap-6 cursor-pointer hover:shadow-xl hover:shadow-indigo-900/5 hover:border-indigo-200/50 transition-all duration-300 active:scale-[0.99] group select-none relative overflow-hidden"
                    >
                        {/* Contenido Superior de la Card */}
                        <div className="flex gap-5 items-start">
                            <div className={`${modulo.color} p-5 rounded-2xl text-white text-3xl shadow-lg transition-transform group-hover:scale-105 duration-300 shrink-0`}>
                                {modulo.icon}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
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
                            <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                Gestionar →
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Banner inferior informativo */}
            <div className="bg-slate-900/5 border border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3">
                    <div className="text-slate-400 text-xl"><FiSettings /></div>
                    <p className="text-xs text-slate-500 font-medium">
                        Estás operando con **rango total de gerencia**. Cualquier cambio en el catálogo de tarifas afectará instantáneamente a los precios que ven los empleados en el mostrador.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default InicioAdmin;