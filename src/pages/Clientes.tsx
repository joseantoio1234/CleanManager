import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiShoppingBag, FiEye } from 'react-icons/fi';

interface Cliente {
    id_referencia: number;
    cliente: string;
    totalPedidos: number;
    totalGastado: number;
}

const Clientes = () => {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    const ID_EMPRESA = 1;

    const cargarClientes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/clientes/${ID_EMPRESA}`);
            if (!response.ok) throw new Error("Error leyendo el servidor local");
            
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            {/* Botón Volver al Dashboard */}
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                Volver al Panel
            </button>

            {/* Tarjeta Contenedora Principal */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white overflow-hidden">
                <div className="bg-blue-600 p-8 text-white">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiUser /> Base de Datos de Clientes
                    </h1>
                    <p className="text-blue-100 text-sm">Consulta el historial acumulado de encargos y facturación por cliente.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Ref ID</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Nombre Completo</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Pedidos Totales</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Inversión Acumulada</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-10 text-center text-sm font-medium text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            Cargando lista de clientes...
                                        </div>
                                    </td>
                                </tr>
                            ) : clientes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-10 text-center text-sm font-medium text-slate-400">
                                        No hay clientes registrados en el sistema todavía.
                                    </td>
                                </tr>
                            ) : (
                                clientes.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400">#C-{item.id_referencia}</td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                                {item.cliente.charAt(0)}
                                            </div>
                                            {item.cliente}
                                        </td>
                                        <td className="px-8 py-5 text-sm text-center font-semibold text-slate-600">
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                                                <FiShoppingBag className="text-slate-400" /> {item.totalPedidos}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">
                                            <span className="text-emerald-600 font-bold">{Number(item.totalGastado).toFixed(2)}€</span>
                                        </td>
                                        {/* NUEVO: Botón para ir al detalle codificando el nombre en la URL */}
                                        <td className="px-8 py-3 text-center">
                                            <button 
                                                onClick={() => navigate(`/clientes/detalle/${encodeURIComponent(item.cliente)}`)}
                                                className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-xl border border-blue-200/40 transition-all active:scale-95"
                                            >
                                                <FiEye /> Detalles
                                            </button>
                                        </td>
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

export default Clientes;