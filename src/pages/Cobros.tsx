import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiSearch, FiCheckCircle, FiTrendingUp, FiCreditCard, FiSmartphone } from 'react-icons/fi';

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

    const ID_EMPRESA = 1;

    const cargarCaja = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/caja/operaciones/${ID_EMPRESA}`);
            if (!response.ok) throw new Error("Error en servidor");
            const data = await response.json();
            setListaPendientes(data.pendientes);
            setStatsCaja(data.graficoCaja);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCaja();
    }, []);

    // Filtrado dinámico por buscador
    const pedidosFiltrados = listaPendientes.filter(p => 
        p.cliente.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.id_pedido.toString() === busqueda
    );

    // Cálculos para las proporciones del gráfico visual de barras
    const totalRecaudadoHoy = statsCaja.EFECTIVO + statsCaja.TARJETA + statsCaja.BIZUM;
    const porcentajeEfectivo = totalRecaudadoHoy > 0 ? (statsCaja.EFECTIVO / totalRecaudadoHoy) * 100 : 0;
    const porcentajeTarjeta = totalRecaudadoHoy > 0 ? (statsCaja.TARJETA / totalRecaudadoHoy) * 100 : 0;
    const porcentajeBizum = totalRecaudadoHoy > 0 ? (statsCaja.BIZUM / totalRecaudadoHoy) * 100 : 0;

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

            {/* SECCIÓN SUPERIOR: Resumen de Caja y Gráfico de Distribución */}
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
                            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Efectivo:</span>
                            <span className="text-slate-900">{statsCaja.EFECTIVO.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between py-2 items-center">
                            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-500"/> Tarjeta:</span>
                            <span className="text-slate-900">{statsCaja.TARJETA.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between py-2 items-center">
                            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-purple-500"/> Bizum:</span>
                            <span className="text-slate-900">{statsCaja.BIZUM.toFixed(2)}€</span>
                        </div>
                    </div>
                </div>

                {/* GRÁFICO TACTIL DE RENDIMIENTO DE CAJA */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Distribución de Ingresos</h3>
                        <p className="text-xs text-slate-400">Porcentaje de recaudación según el medio de cobro seleccionado.</p>
                    </div>

                    {/* Barras dinámicas del Gráfico */}
                    <div className="space-y-3 py-2">
                        {/* Barra Efectivo */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>Efectivo ({porcentajeEfectivo.toFixed(0)}%)</span>
                                <span>{statsCaja.EFECTIVO.toFixed(2)}€</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${porcentajeEfectivo}%` }} />
                            </div>
                        </div>
                        {/* Barra Tarjeta */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>Tarjeta ({porcentajeTarjeta.toFixed(0)}%)</span>
                                <span>{statsCaja.TARJETA.toFixed(2)}€</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${porcentajeTarjeta}%` }} />
                            </div>
                        </div>
                        {/* Barra Bizum */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>Bizum ({porcentajeBizum.toFixed(0)}%)</span>
                                <span>{statsCaja.BIZUM.toFixed(2)}€</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${porcentajeBizum}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN INFERIOR: Buscador y Listado de entregas */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FiDollarSign className="text-indigo-500" /> Listas para Entrega
                    </h2>
                    {/* Barra de Búsqueda Integrada */}
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
                                        <td className="px-8 py-5 text-sm font-black text-slate-900">{Number(order.total).toFixed(2)}€</td>
                                        <td className="px-8 py-3 text-center">
                                            {/* Redirige directo a la factura para seleccionar el método de pago oficial y guardar */}
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