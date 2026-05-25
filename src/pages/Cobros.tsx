import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiSearch, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

// Importaciones necesarias de Chart.js y el componente adaptador de React
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Registramos los elementos esenciales en el núcleo de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface PedidoListo {
    id_pedido: number;
    cliente: string;
    prenda: string;
    servicio: string;
    total: number;
}

const Cobros = () => {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [listaPendientes, setListaPendientes] = useState<PedidoListo[]>([]);
    const [statsCaja, setStatsCaja] = useState({ EFECTIVO: 0, TARJETA: 0, BIZUM: 0 });
    const [loading, setLoading] = useState(true);

    // 🚀 CORREGIDO: Extraemos el id_empresa real del inicio de sesión activo
    const idEmpresaActive = localStorage.getItem('id_empresa') || '1';

    const cargarCaja = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/caja/operaciones/${idEmpresaActive}`);
            if (!response.ok) throw new Error("Error en servidor");
            const data = await response.json();
            setListaPendientes(data.pendientes || []);
            setStatsCaja(data.graficoCaja || { EFECTIVO: 0, TARJETA: 0, BIZUM: 0 });
        } catch (error) {
            console.error("Error cargando la caja de operaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCaja();
    }, [idEmpresaActive]);

    // Filtrado dinámico por buscador
    const pedidosFiltrados = listaPendientes.filter(p => 
        p.cliente.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.id_pedido.toString() === busqueda
    );

    const totalRecaudadoHoy = (statsCaja.EFECTIVO || 0) + (statsCaja.TARJETA || 0) + (statsCaja.BIZUM || 0);

    // ==========================================
    // CONFIGURACIÓN ESTRUCTURAL DEL GRÁFICO (DÓNUT)
    // ==========================================
    const dataGrafico = {
        labels: ['Efectivo', 'Tarjeta', 'Bizum'],
        datasets: [
            {
                data: [statsCaja.EFECTIVO || 0, statsCaja.TARJETA || 0, statsCaja.BIZUM || 0],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.85)', // Esmeralda para Efectivo
                    'rgba(59, 130, 246, 0.85)', // Azul para Tarjeta
                    'rgba(99, 102, 241, 0.85)'  // Índigo para Bizum
                ],
                borderColor: [
                    '#10b981', 
                    '#3b82f6', 
                    '#6366f1'
                ],
                borderWidth: 2,
                hoverOffset: 6,
            },
        ],
    };

    const opcionesGrafico = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    font: {
                        family: 'ui-sans-serif, system-ui, sans-serif',
                        weight: 'bold' as const,
                        size: 12
                    },
                    boxWidth: 12,
                    padding: 15,
                    color: '#475569' 
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return ` ${label}: ${value.toFixed(2)}€`;
                    }
                }
            }
        },
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-200">
            {/* Cabecera de control */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={() => navigate('/inicio')}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                    Volver al Menú
                </button>
            </div>

            {/* SECCIÓN SUPERIOR: Resumen de Caja y Gráfico Circular de Distribución */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Métricas rápidas */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3.5 bg-indigo-500 text-white rounded-2xl text-xl shadow-lg shadow-indigo-100">
                            <FiTrendingUp />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caja Total de Hoy</p>
                            <h2 className="text-3xl font-black text-slate-900">{totalRecaudadoHoy.toFixed(2)}€</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50 text-xs font-bold text-slate-600 pt-2">
                        <div className="flex justify-between py-2 items-center">
                            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> Efectivo:</span>
                            <span className="text-slate-900">{(statsCaja.EFECTIVO || 0).toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between py-2 items-center">
                            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"/> Tarjeta:</span>
                            <span className="text-slate-900">{(statsCaja.TARJETA || 0).toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between py-2 items-center">
                            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"/> Bizum:</span>
                            <span className="text-slate-900">{(statsCaja.BIZUM || 0).toFixed(2)}€</span>
                        </div>
                    </div>
                </div>

                {/* GRÁFICO CIRCULAR INTERACTIVO (DÓNUT) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[220px]">
                    <div className="mb-2">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Distribución de Ingresos</h3>
                        <p className="text-xs text-slate-400">Proporción visual de la recaudación según el medio de pago del mostrador.</p>
                    </div>

                    {/* Contenedor del Canvas de Chart.js */}
                    <div className="relative flex-1 h-36 max-h-[150px] w-full flex justify-center lg:justify-start items-center">
                        {totalRecaudadoHoy === 0 ? (
                            <div className="text-center w-full text-xs text-slate-400 font-medium py-8">
                                No se registran transacciones cobradas hoy para estructurar el gráfico.
                            </div>
                        ) : (
                            <div className="w-full h-full max-w-[280px]">
                                <Doughnut data={dataGrafico} options={opcionesGrafico} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SECCIÓN INFERIOR: Buscador y Listado de entregas */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FiDollarSign className="text-indigo-500" /> Listas para Entrega
                    </h2>
                    <div className="w-full sm:w-80 relative">
                        <FiSearch className="absolute left-4 top-3.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar por cliente o nº ticket..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12 text-sm text-slate-400 font-medium">Cargando caja...</div>
                    ) : pedidosFiltrados.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 font-medium text-sm">
                            No hay encargos pendientes de entrega que coincidan con la búsqueda.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Nº Ticket</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Cliente</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Prenda / Ropa</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Servicio</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Importe</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pedidosFiltrados.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-indigo-600">#{order.id_pedido}</td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-700">{order.cliente}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-600">{order.prenda}</td>
                                        <td className="px-8 py-5 text-sm text-slate-400">{order.servicio}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900">{Number(order.total || 0).toFixed(2)}€</td>
                                        <td className="px-8 py-3 text-center">
                                            <button
                                                onClick={() => navigate(`/factura/${order.id_pedido}`)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 mx-auto"
                                            >
                                                <FiCheckCircle /> Cobrar y Entregar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cobros;