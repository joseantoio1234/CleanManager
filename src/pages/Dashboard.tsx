import React, { useState, useEffect } from 'react';
import {
    FiBox,
    FiClock,
    FiCheckCircle,
    FiTrendingUp
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Interfaz actualizada para reflejar la columna 'prenda' añadida en MySQL
interface Pedido {
    id_pedido: number;
    prenda: string;
    cliente: string;
    servicio: string;
    estado: 'EN_LAVADO' | 'LISTO' | 'ENTREGADO';
    total: number;
}

const Dashboard = () => {
    // Estados dinámicos para las estadísticas y los pedidos de la DB
    const [statsData, setStatsData] = useState({
        pedidosHoy: 0,
        enProceso: 0,
        listosEntrega: 0,
        ingresosMes: 0
    });
    const [recentOrders, setRecentOrders] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    // ID de la empresa temporal (el mismo que usamos en el formulario de Nuevo Pedido)
    const ID_EMPRESA = 1;

    // Función para consultar de forma asíncrona tu Backend local
    const cargarDatosDashboard = async () => {
        try {
            setLoading(true);
            
            // Petición paralela a ambos endpoints locales usando el ID de empresa activo
            const [resStats, resRecent] = await Promise.all([
                fetch(`http://localhost:5000/api/dashboard/stats/${ID_EMPRESA}`),
                fetch(`http://localhost:5000/api/dashboard/recent/${ID_EMPRESA}`)
            ]);

            if (!resStats.ok || !resRecent.ok) {
                throw new Error("Error en la respuesta del servidor local");
            }

            const dataStats = await resStats.json();
            const dataRecent = await resRecent.json();

            // Seteamos las variables de estado con información de MySQL
            setStatsData(dataStats);
            setRecentOrders(dataRecent);
        } catch (error) {
            console.error("Error cargando flujos de datos en el dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    // Al montar el componente, disparamos la lectura a MySQL Workbench
    useEffect(() => {
        cargarDatosDashboard();
    }, []);

    // Estructura adaptativa de las tarjetas
    const statsConfig = [
        { label: 'Pedidos Hoy', value: `${statsData.pedidosHoy}`, icon: <FiBox />, color: 'bg-blue-500' },
        { label: 'En Proceso', value: `${statsData.enProceso}`, icon: <FiClock />, color: 'bg-amber-500' },
        { label: 'Listos para Entrega', value: `${statsData.listosEntrega}`, icon: <FiCheckCircle />, color: 'bg-emerald-500' },
        { label: 'Ingresos Mes', value: `${statsData.ingresosMes.toFixed(2)}€`, icon: <FiTrendingUp />, color: 'bg-indigo-500' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-6">
            {/* Cabecera de Bienvenida */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
                    <p className="text-slate-500">Bienvenido de nuevo a la gestión de tu tintorería.</p>
                </div>
                <Link to="/nuevo-pedido">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                        + Nuevo Pedido
                    </button>
                </Link>
            </div>

            {/* Grid de Estadísticas Dinámicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`${stat.color} p-4 rounded-2xl text-white text-2xl`}>
                            {stat.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            {loading ? (
                                <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-1" />
                            ) : (
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sección Inferior: Pedidos Recientes */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FiBox className="text-blue-500" /> Últimos Pedidos
                    </h2>
                    <button onClick={cargarDatosDashboard} className="text-blue-600 font-bold text-sm hover:underline">
                        Refrescar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">ID</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Cliente</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Prenda</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Servicio</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Estado</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm font-medium text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            Cargando flujos de datos locales...
                                        </div>
                                    </td>
                                </tr>
                            ) : recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm font-medium text-slate-400">
                                        No hay pedidos registrados en este momento. Haz clic en "+ Nuevo Pedido".
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-blue-600">#{order.id_pedido}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-700">{order.cliente}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-600">{order.prenda}</td>
                                        <td className="px-8 py-5 text-sm text-slate-500">{order.servicio}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                order.estado === 'LISTO' ? 'bg-emerald-100 text-emerald-700' :
                                                order.estado === 'EN_LAVADO' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {order.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-900">{order.total.toFixed(2)}€</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;