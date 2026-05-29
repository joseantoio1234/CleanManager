import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiEdit2, FiTrash2, FiX, FiCheck, FiMail, FiPhone } from 'react-icons/fi';
import Swal from 'sweetalert2'; 

interface Cliente {
    id_cliente: number;
    nombre_completo: string; 
    totalPedidos: number;
    totalGastado: number;
    telefono?: string;
    email?: string;
}

const ClientesAdmin = () => {
    const navigate = useNavigate();
    
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    
    //  ESTADOS PARA EL MODAL DE EDICIÓN
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoTelefono, setNuevoTelefono] = useState('');
    const [nuevoEmail, setNuevoEmail] = useState('');

    const obtenerIdEmpresa = (): string => {
        const sessionStr = localStorage.getItem('usuario_sesion');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                if (session && session.id_empresa) {
                    return String(session.id_empresa);
                }
            } catch (e) {
                console.error("Error al leer la sesión activa:", e);
            }
        }
        return localStorage.getItem('id_empresa') || '10'; 
    };

    const idEmpresa = obtenerIdEmpresa();

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

    //  Abre el modal y precarga el estado del cliente
    const abrirModalEdicion = (cliente: Cliente) => {
        setClienteSeleccionado(cliente);
        setNuevoNombre(cliente.nombre_completo);
        setNuevoTelefono(cliente.telefono || '');
        setNuevoEmail(cliente.email || '');
        setIsModalOpen(true);
    };

    const guardarCambiosCliente = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clienteSeleccionado || !nuevoNombre.trim()) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/admin/clientes/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empresa: parseInt(idEmpresa),
                    clienteViejo: clienteSeleccionado.nombre_completo, 
                    clienteNuevo: nuevoNombre.trim(),
                    telefono: nuevoTelefono.trim() || null,
                    email: nuevoEmail.trim() || null
                })
            });

            if (response.ok) {
                Swal.fire({
                    title: '¡Cambios Guardados!',
                    text: 'La ficha del cliente se ha actualizado correctamente en MySQL.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-[2rem]' }
                });

                setIsModalOpen(false);
                setClienteSeleccionado(null);
                await cargarClientes();
            } else {
                const data = await response.json();
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'No se pudieron salvar los cambios.',
                    icon: 'error',
                    customClass: { popup: 'rounded-[2rem]' }
                });
            }
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            Swal.fire({
                title: 'Error de Red',
                text: 'No se pudo conectar con el servidor local.',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
            });
        }
    };

    const eliminarClienteCompleto = async (nombreCliente: string) => {
        Swal.fire({
            title: '¿Eliminar Cliente?',
            text: `¿Estás seguro de que deseas eliminar a "${nombreCliente}" y todo su historial de pedidos? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: { popup: 'rounded-[2rem]' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('http://localhost:5000/api/admin/clientes/delete', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empresa: parseInt(idEmpresa),
                            nombre_cliente: nombreCliente 
                        })
                    });
                    if (response.ok) {
                        Swal.fire({
                            title: '¡Purgado!',
                            text: 'El historial del cliente ha sido eliminado.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            customClass: { popup: 'rounded-[2rem]' }
                        });
                        await cargarClientes();
                    }
                } catch (error) {
                    console.error("Error al eliminar cliente:", error);
                }
            }
        });
    };

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col items-center animate-in fade-in duration-300">
            
            {/* Encabezado del Módulo */}
            <div className="w-full max-w-6xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Control de Clientes</h1>
                    <p className="text-xs text-slate-400 font-medium">Supervisa el censo de clientes de la sucursal, modifica datos erróneos o da de baja cuentas.</p>
                </div>
                
                <button 
                    onClick={() => navigate('/inicio-admin')}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs h-10 px-4 rounded-xl border border-slate-200/80 shadow-sm transition-all active:scale-95 shrink-0"
                >
                    <FiArrowLeft size={16} className="text-slate-400" />
                    Volver al menú
                </button>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Panel de Auditoría Informativo */}
                <div className="lg:col-span-2 bg-white p-6 rounded-4xl shadow-xl shadow-blue-100/40 border border-white h-fit text-left space-y-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                        <FiUser size={24} />
                    </div>
                    <h2 className="text-md font-bold text-slate-800 tracking-tight">Auditoría de Censo</h2>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Desde este panel, como Administrador tienes plenos poderes para unificar nombres de clientes mal escritos desde el mostrador o depurar la base de datos eliminando registros duplicados.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                        <strong>Nota fiscal:</strong> Al modificar el nombre de un cliente, este se actualizará automáticamente en todas las facturas y tickets pendientes de su historial.
                    </div>
                </div>

                {/* Listado de Clientes */}
                <div className="lg:col-span-3 bg-white p-6 rounded-4xl shadow-xl shadow-blue-100/40 border border-white flex flex-col h-130">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 text-left">
                            Clientes Activos de la Sucursal 
                            <span className="text-xs bg-blue-100 text-blue-600 font-black px-2 py-0.5 rounded-md">{clientes.length}</span>
                        </h3>
                    </div>

                    <div className="w-full flex-1 overflow-y-auto pr-1 border border-slate-50 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase">Nombre del Cliente</th>
                                    <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase text-center">Encargos</th>
                                    <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase text-right">Inversión</th>
                                    <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase text-center w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-xs text-slate-400 font-bold">Cargando censo...</td>
                                    </tr>
                                ) : clientes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-xs text-slate-400 font-bold">No hay clientes registrados en esta sucursal.</td>
                                    </tr>
                                ) : (
                                    clientes.map((item) => (
                                        <tr key={item.id_cliente} className="hover:bg-slate-50/40 transition-colors group">
                                            <td className="py-3 px-4 text-sm font-semibold text-slate-700 text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black uppercase text-[10px] shrink-0">
                                                        {item.nombre_completo ? item.nombre_completo.charAt(0) : '?'}
                                                    </div>
                                                    <span className="truncate max-w-40 sm:max-w-xs" title={item.nombre_completo}>{item.nombre_completo}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-slate-600 text-center">{item.totalPedidos}</td>
                                            <td className="py-3 px-4 text-sm font-black text-slate-800 text-right">{Number(item.totalGastado).toFixed(2)}€</td>
                                            
                                            <td className="py-2 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        onClick={() => abrirModalEdicion(item)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="Editar datos del cliente"
                                                    >
                                                        <FiEdit2 size={13} />
                                                    </button>
                                                    <button 
                                                        onClick={() => eliminarClienteCompleto(item.nombre_completo)}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Eliminar cliente"
                                                    >
                                                        <FiTrash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/*  COMPONENTE MODAL INTERACTIVO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-4xl shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Cabecera del Modal */}
                        <div className="bg-linear-to-r from-blue-600 to-blue-500 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-lg border border-white/20">
                                    <FiUser />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm tracking-tight">Modificar Ficha</h3>
                                    <p className="text-[11px] text-blue-100 opacity-85">Ajuste de credenciales del cliente</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                            >
                                <FiX size={14} />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={guardarCambiosCliente} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre Completo *</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><FiUser size={14}/></span>
                                    <input 
                                        type="text"
                                        required
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        className="w-full h-11 bg-slate-50 border-none text-xs font-bold rounded-xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Teléfono de Contacto</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><FiPhone size={14}/></span>
                                    <input 
                                        type="text"
                                        placeholder="Ej: 600 123 456"
                                        value={nuevoTelefono}
                                        onChange={(e) => setNuevoTelefono(e.target.value)}
                                        className="w-full h-11 bg-slate-50 border-none text-xs font-bold rounded-xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Principal</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400"><FiMail size={14}/></span>
                                    <input 
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        value={nuevoEmail}
                                        onChange={(e) => setNuevoEmail(e.target.value)}
                                        className="w-full h-11 bg-slate-50 border-none text-xs font-bold rounded-xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Controles Inferiores */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={14} />
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientesAdmin;