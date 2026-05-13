import React from 'react';
import {
    FiBox,
    FiUsers,
    FiClock,
    FiCheckCircle,
    FiTrendingUp
} from 'react-icons/fi'; // Necesitarás instalar react-icons
import { Link } from 'react-router-dom';

const Dashboard = () => {
    // Datos de ejemplo para la interfaz
    const stats = [
        { label: 'Pedidos Hoy', value: '12', icon: <FiBox />, color: 'bg-blue-500' },
        { label: 'En Proceso', value: '8', icon: <FiClock />, color: 'bg-amber-500' },
        { label: 'Listos para Entrega', value: '5', icon: <FiCheckCircle />, color: 'bg-emerald-500' },
        { label: 'Ingresos Mes', value: '1.240€', icon: <FiTrendingUp />, color: 'bg-indigo-500' },
    ];

    const recentOrders = [
        { id: '#1024', cliente: 'Juan Pérez', servicio: 'Edredón nórdico', estado: 'En Lavado', total: '15.50€' },
        { id: '#1023', cliente: 'María López', servicio: 'Traje 2 piezas', estado: 'Listo', total: '12.00€' },
        { id: '#1022', cliente: 'Carlos Ruiz', servicio: 'Camisas (x5)', estado: 'Pendiente', total: '10.00€' },
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

            {/* Grid de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`${stat.color} p-4 rounded-2xl text-white text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
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
                    <button className="text-blue-600 font-bold text-sm hover:underline">Ver todos</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">ID</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Cliente</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Servicio</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Estado</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentOrders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-blue-600">{order.id}</td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-700">{order.cliente}</td>
                                    <td className="px-8 py-5 text-sm text-slate-500">{order.servicio}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.estado === 'Listo' ? 'bg-emerald-100 text-emerald-700' :
                                                order.estado === 'En Lavado' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {order.estado}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{order.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;