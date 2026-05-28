import { useState, useEffect } from 'react';
import {
    FiBox,
    FiClock,
    FiCheckCircle,
    FiTrendingUp,
    FiX,
    FiFileText,
    FiPrinter,
    FiArrowLeft
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

interface Pedido {
    id_pedido: number;
    prenda: string;
    cliente: string;
    servicio: string;
    estado: 'SIN_EMPEZAR' | 'EN_LAVADO' | 'EN_SECADO' | 'ACABADO' | 'ENTREGADO';
    total: number;
    fecha_pedido?: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({
        pedidosHoy: 0,
        enProceso: 0,
        listosEntrega: 0,
        ingresosMes: 0
    });
    const [recentOrders, setRecentOrders] = useState<Pedido[]>([]);
    const [allOrders, setAllOrders] = useState<Pedido[]>([]); 
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<'HOY' | 'PROCESO' | 'LISTOS' | 'INGRESOS' | null>(null);

    const idEmpresa = localStorage.getItem('id_empresa') || '1';

    const cargarDatosDashboard = async () => {
        try {
            setLoading(true);
            const [resStats, resRecent, resAll] = await Promise.all([
                fetch(`http://localhost:5000/api/dashboard/stats/${idEmpresa}`),
                fetch(`http://localhost:5000/api/dashboard/recent/${idEmpresa}`),
                fetch(`http://localhost:5000/api/dashboard/all-orders/${idEmpresa}`)
            ]);

            if (!resStats.ok || !resRecent.ok || !resAll.ok) {
                throw new Error("Error en la respuesta del servidor local");
            }

            setStatsData(await resStats.json());
            setRecentOrders(await resRecent.json());
            setAllOrders(await resAll.json());
        } catch (error) {
            console.error("Error cargando flujos de datos en el dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    // Modificamos para enviar opcionalmente el estado y el método de pago
    const handleStatusChange = async (id_pedido: number, nuevoEstado: string, metodoPago?: string) => {
        try {
            const bodyPayload: any = { estado: nuevoEstado };
            if (metodoPago) {
                bodyPayload.metodo_pago = metodoPago;
            }

            const response = await fetch(`http://localhost:5000/api/orders/${id_pedido}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            });

            if (!response.ok) throw new Error("No se pudo actualizar el estado en el servidor");
            await cargarDatosDashboard();
        } catch (error) {
            alert("Error al actualizar el estado del pedido.");
            console.error(error);
        }
    };

    useEffect(() => {
        cargarDatosDashboard();
    }, [idEmpresa]);

    const getStatusStyles = (estado: string) => {
        switch (estado) {
            case 'SIN_EMPEZAR': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'EN_LAVADO': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'EN_SECADO': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ACABADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'ENTREGADO': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getModalFilteredOrders = () => {
        const hoyStr = new Date().toLocaleDateString('en-CA'); 
        switch (activeModal) {
            case 'HOY':
                return allOrders.filter(o => o.fecha_pedido && o.fecha_pedido.startsWith(hoyStr));
            case 'PROCESO':
                return allOrders.filter(o => o.estado === 'EN_LAVADO' || o.estado === 'EN_SECADO');
            case 'LISTOS':
                return allOrders.filter(o => o.estado === 'ACABADO');
            case 'INGRESOS':
                return allOrders.filter(o => o.estado === 'ENTREGADO');
            default:
                return [];
        }
    };

    const modalTitle = {
        HOY: 'Pedidos Registrados Hoy',
        PROCESO: 'Prendas En Proceso',
        LISTOS: 'Pedidos Listos para Recogida',
        INGRESOS: 'Desglose de Caja / Ingresos'
    }[activeModal || 'HOY'];

    const statsConfig = [
        { id: 'HOY' as const, label: 'Pedidos Hoy', value: `${statsData.pedidosHoy}`, icon: <FiBox />, color: 'bg-blue-500' },
        { id: 'PROCESO' as const, label: 'En Proceso', value: `${statsData.enProceso}`, icon: <FiClock />, color: 'bg-amber-500' },
        { id: 'LISTOS' as const, label: 'Listos para Entrega', value: `${statsData.listosEntrega}`, icon: <FiCheckCircle />, color: 'bg-emerald-500' },
        { id: 'INGRESOS' as const, label: 'Ingresos Mes', value: `${Number(statsData.ingresosMes || 0).toFixed(2)}€`, icon: <FiTrendingUp />, color: 'bg-indigo-500' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-6 relative">
            
            {/* Cabecera de Bienvenida */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
                    <p className="text-slate-500 text-sm">Bienvenido de nuevo a la gestión de tu tintorería.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/inicio')}
                        className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold border border-slate-200 transition-all active:scale-95 text-sm shadow-sm"
                    >
                        <FiArrowLeft /> Menú Principal
                    </button>
                    <Link to="/clientes">
                        <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold border border-slate-200 transition-all active:scale-95 text-sm shadow-sm">
                            Ver Clientes
                        </button>
                    </Link>
                </div>
            </div>

            {/* Grid de Estadísticas Dinámicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, index) => (
                    <div 
                        key={index} 
                        onClick={() => !loading && setActiveModal(stat.id)}
                        className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-100 transition-all active:scale-98 group select-none"
                    >
                        <div className={`${stat.color} p-4 rounded-2xl text-white text-2xl transition-transform group-hover:scale-105`}>
                            {stat.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            {loading ? (
                                <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-1" />
                            ) : (
                                <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{stat.value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabla Inferior: Historial Reciente de Pedidos */}
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
                                {/* 🚀 ID ELIMINADO SEGÚN DISEÑO */}
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Cliente</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Prenda</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Servicio</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Estado de Prenda</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Total</th>
                                {/* 🚀 NUEVA COLUMNA INYECTADA DE FORMA ELEGANTE */}
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Método de Pago</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-10 text-center text-sm font-medium text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            Sincronizando caja diaria...
                                        </div>
                                    </td>
                                </tr>
                            ) : recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center text-sm font-medium text-slate-400">
                                        No hay pedidos registrados en este momento.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order, idx) => {
                                    const estaEntregado = order.estado === 'ENTREGADO';
                                    const puedeFacturar = order.estado === 'ACABADO' || order.estado === 'ENTREGADO';

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 text-sm font-bold text-slate-800">{order.cliente}</td>
                                            <td className="px-8 py-5 text-sm font-medium text-slate-600">{order.prenda}</td>
                                            <td className="px-8 py-5 text-sm text-slate-500">{order.servicio}</td>
                                            
                                            {/* Selector del Taller */}
                                            <td className="px-8 py-3">
                                                <select
                                                    value={order.estado}
                                                    disabled={estaEntregado} // Bloqueado si ya se cobró y entregó
                                                    onChange={(e) => handleStatusChange(order.id_pedido, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border outline-none cursor-pointer transition-all ${getStatusStyles(order.estado)} ${estaEntregado ? 'cursor-not-allowed opacity-90' : ''}`}
                                                >
                                                    <option value="SIN_EMPEZAR">Sin Empezar</option>
                                                    <option value="EN_LAVADO">En Lavado</option>
                                                    <option value="EN_SECADO">En Secado</option>
                                                    <option value="ACABADO">Listo para entregar</option>
                                                    <option value="ENTREGADO">Entregado</option>
                                                </select>
                                            </td>

                                            <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">
                                                {Number(order.total || 0).toFixed(2)}€
                                            </td>

                                            {/* 🚀 NUEVO SELECTOR MULTI-MÉTODO DE PAGO */}
                                            <td className="px-8 py-3 text-center">
                                                {estaEntregado ? (
                                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase border border-slate-200/50">
                                                        Cobrado ✓
                                                    </span>
                                                ) : (
                                                    <select
                                                        defaultValue=""
                                                        onChange={(e) => {
                                                            if (!e.target.value) return;
                                                            // Al seleccionar un método, pasamos el pedido a ENTREGADO con el método elegido
                                                            handleStatusChange(order.id_pedido, 'ENTREGADO', e.target.value);
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-white border border-slate-200 text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-all text-center"
                                                    >
                                                        <option value="">Seleccionar Pago...</option>
                                                        <option value="EFECTIVO">💵 Efectivo</option>
                                                        <option value="TARJETA">💳 Tarjeta</option>
                                                        <option value="BIZUM">📱 Bizum</option>
                                                    </select>
                                                )}
                                            </td>
                                            
                                            {/* Columna Acciones / Ticket */}
                                            <td className="px-8 py-3 text-center">
                                                <button
                                                    disabled={!puedeFacturar}
                                                    onClick={() => navigate(`/factura/${order.id_pedido}`)}
                                                    title={puedeFacturar ? "Imprimir Ticket" : "Disponible al terminar o entregar la prenda"}
                                                    className={`p-2 rounded-xl border transition-all inline-flex items-center gap-1 font-bold text-xs ${
                                                        puedeFacturar 
                                                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 active:scale-95' 
                                                        : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <FiPrinter /> Ticket
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Emergente */}
            {activeModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <FiFileText className="text-xl text-blue-400" />
                                <h3 className="text-lg font-bold">{modalTitle}</h3>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white">
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {getModalFilteredOrders().length === 0 ? (
                                <div className="text-center py-12 text-slate-400 font-medium text-sm">
                                    No se encontraron registros activos en este apartado del taller.
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">ID</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Cliente</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Prenda</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Tratamiento</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Estado Interno</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Importe</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {getModalFilteredOrders().map((order, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-blue-600">#{order.id_pedido}</td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{order.cliente}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-600">{order.prenda}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-500">{order.servicio}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${getStatusStyles(order.estado)}`}>
                                                            {order.estado === 'ACABADO' ? 'Listo para entregar' : order.estado.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-black text-slate-900 text-right">
                                                        {Number(order.total || 0).toFixed(2)}€
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                            <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors">
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;