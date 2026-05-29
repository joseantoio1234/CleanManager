import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingBag, FiDollarSign, FiActivity } from 'react-icons/fi';

interface HistorialPedido {
    id_pedido: number;
    prenda: string;
    servicio: string;
    estado: string;
    total: number;
    fecha_pedido: string;
}

const DetalleCliente = () => {
    const { nombre } = useParams<{ nombre: string }>();
    const navigate = useNavigate();
    const [historial, setHistorial] = useState<HistorialPedido[]>([]);
    const [loading, setLoading] = useState(true);

    const nombreCliente = decodeURIComponent(nombre || '');

    const cargarHistorial = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/clientes/detalle/${encodeURIComponent(nombreCliente)}`);
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            const data = await response.json();
            setHistorial(data);
        } catch (error) {
            console.error("Error al obtener detalles del cliente:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (nombreCliente) cargarHistorial();
    }, [nombre]);

    const totalPedidos = historial.length;
    const totalInvertido = historial.reduce((sum, item) => sum + Number(item.total), 0);
    const pendientesEntrega = historial.filter(item => item.estado !== 'ENTREGADO').length;

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            {/* Botón Volver */}
            <button 
                onClick={() => navigate('/clientes')}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                Volver a Clientes
            </button>

            {/* Cabecera del Cliente */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 p-8 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-black uppercase shadow-lg shadow-blue-200">
                        {nombreCliente.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">{nombreCliente}</h1>
                        <p className="text-slate-500 text-sm">Ficha de cliente y registro histórico</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-blue-500 p-4 rounded-2xl text-white text-2xl"><FiShoppingBag /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Encargos Totales</p>
                        <p className="text-xl font-black text-slate-900">{loading ? '...' : totalPedidos}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-emerald-500 p-4 rounded-2xl text-white text-2xl"><FiDollarSign /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Gastado</p>
                        <p className="text-xl font-black text-slate-900">{loading ? '...' : `${totalInvertido.toFixed(2)}€`}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-amber-500 p-4 rounded-2xl text-white text-2xl"><FiActivity /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Prendas en Taller</p>
                        <p className="text-xl font-black text-slate-900">{loading ? '...' : pendientesEntrega}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h2 className="text-lg font-bold text-slate-900">Historial de Pedidos</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Ticket ID</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Fecha</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Prenda</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Servicio</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Estado</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm font-medium text-slate-400">Cargando historial...</td>
                                </tr>
                            ) : historial.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm font-medium text-slate-400">Este cliente no registra pedidos.</td>
                                </tr>
                            ) : (
                                historial.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-blue-600">#{order.id_pedido}</td>
                                        <td className="px-8 py-5 text-sm text-slate-500">
                                            {new Date(order.fecha_pedido).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-800">{order.prenda}</td>
                                        <td className="px-8 py-5 text-sm text-slate-600">{order.servicio}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                order.estado === 'ENTREGADO' ? 'bg-indigo-100 text-indigo-700' :
                                                order.estado === 'ACABADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-900 text-right">{Number(order.total).toFixed(2)}€</td>
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

export default DetalleCliente;