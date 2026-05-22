import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

interface Cliente {
    id_referencia: number;
    cliente: string;
    totalPedidos: number;
    totalGastado: number;
}

const ClientesAdmin = () => {
    const navigate = useNavigate();
    const idEmpresa = localStorage.getItem('id_empresa') || '1';
    
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el modo edición
    const [editandoCliente, setEditandoCliente] = useState<string | null>(null);
    const [nuevoNombre, setNuevoNombre] = useState('');

    const cargarClientes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/clientes/${idEmpresa}`);
            if (response.ok) {
                const data = await response.json();
                setClientes(data);
            }
        } catch (error) {
            console.error("Error cargando clientes en zona admin:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, [idEmpresa]);

    const iniciarEdicion = (nombreActual: string) => {
        setEditandoCliente(nombreActual);
        setNuevoNombre(nombreActual);
    };

    const guardarCambiosCliente = async (nombreOriginal: string) => {
        if (!nuevoNombre.trim()) return;
        try {
            const response = await fetch('http://localhost:5000/api/admin/clientes/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empresa: idEmpresa,
                    clienteViejo: nombreOriginal,
                    clienteNuevo: nuevoNombre.trim()
                })
            });
            if (response.ok) {
                setEditandoCliente(null);
                await cargarClientes();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const eliminarClienteCompleto = async (nombreCliente: string) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar a "${nombreCliente}" y todo su historial de pedidos de este local? Esta acción no se puede deshacer.`)) return;
        try {
            const response = await fetch('http://localhost:5000/api/admin/clientes/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empresa: idEmpresa,
                    nombre_cliente: nombreCliente
                })
            });
            if (response.ok) {
                await cargarClientes();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            
            {/* Botón Volver al menú de cápsula blanca estilizado */}
            <div className="w-full max-w-6xl flex justify-end mb-2">
                <button 
                    onClick={() => navigate('/inicio-admin')} 
                    className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-2xl font-bold text-sm border border-slate-100 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
                >
                    <FiArrowLeft className="text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" size={16} /> 
                    <span>Volver al menú</span>
                </button>
            </div>

            <div className="w-full text-left">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Control de Clientes</h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Supervisa el censo de clientes de la sucursal, modifica datos erróneos o da de baja cuentas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* COLUMNA IZQUIERDA: Formulario informativo / Informativo */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-100/30 border border-white space-y-4 text-left">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                        <FiUser size={24} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Auditoría de Censo</h2>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Desde este panel, como Administrador tienes plenos poderes para unificar nombres de clientes mal escritos desde el mostrador o depurar la base de datos eliminando registros duplicados.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                        <strong>Nota fiscal:</strong> Al modificar el nombre de un cliente, este se actualizará automáticamente en todas las facturas y tickets pendientes de su historial.
                    </div>
                </div>

                {/* COLUMNA DERECHA: Listado de Clientes con Edición en línea */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/30 border border-white overflow-hidden">
                    <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            Clientes Activos de la Sucursal <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{clientes.length}</span>
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Nombre del Cliente</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Encargos</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Inversión</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-xs text-slate-400 font-bold">Cargando censo...</td>
                                    </tr>
                                ) : clientes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-xs text-slate-400 font-bold">No hay clientes registrados en esta sucursal.</td>
                                    </tr>
                                ) : (
                                    clientes.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                                {editandoCliente === item.cliente ? (
                                                    <input 
                                                        type="text"
                                                        value={nuevoNombre}
                                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-blue-400 rounded-xl outline-none text-slate-800 font-bold text-xs shadow-inner shadow-blue-50"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black uppercase text-[10px] shrink-0">
                                                            {item.cliente ? item.cliente.charAt(0) : '?'}
                                                        </div>
                                                        <span className="truncate max-w-[180px]">{item.cliente}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 text-center">{item.totalPedidos}</td>
                                            <td className="px-6 py-4 text-xs font-black text-slate-900 text-right">{Number(item.totalGastado).toFixed(2)}€</td>
                                            <td className="px-6 py-3 text-center">
                                                {editandoCliente === item.cliente ? (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => guardarCambiosCliente(item.cliente)}
                                                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200"
                                                            title="Guardar cambios"
                                                        >
                                                            <FiSave size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditandoCliente(null)}
                                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg border border-slate-300"
                                                            title="Cancelar"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => iniciarEdicion(item.cliente)}
                                                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-100"
                                                            title="Editar nombre"
                                                        >
                                                            <FiEdit2 size={13} />
                                                        </button>
                                                        <button 
                                                            onClick={() => eliminarClienteCompleto(item.cliente)}
                                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100"
                                                            title="Eliminar cliente"
                                                        >
                                                            <FiTrash2 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClientesAdmin;