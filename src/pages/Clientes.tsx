import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiUserPlus, FiX, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2'; 

interface Cliente {
    id_cliente: number;
    nombre_completo: string;
    telefono: string;
    email: string;
    totalPedidos?: number;
    totalGastado?: number;
}

const Clientes = () => {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para el Formulario Emergente (Modal)
    const [modalAbierto, setModalAbierto] = useState(false);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [errorForm, setErrorForm] = useState('');

    const idEmpresaActive = localStorage.getItem('id_empresa') || '1';

    const cargarClientes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/clientes/${idEmpresaActive}`);
            if (!response.ok) throw new Error("Error cargando clientes");
            const data = await response.json();
            setListaClientes(data);
        } catch (error) {
            console.error("Error al refrescar la tabla:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, [idEmpresaActive]);

    const guardarCliente = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorForm('');

        if (!nombre.trim()) {
            setErrorForm('El nombre completo es requerido.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/clientes/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empresa: idEmpresaActive,
                    nombre_completo: nombre.trim(),
                    telefono: telefono.trim(),
                    email: email.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al registrar cliente");
            }

            Swal.fire({
                title: '¡Cliente Añadido!',
                text: `Ficha de ${nombre.trim()} registrada correctamente.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#ffffff',
                customClass: {
                    title: 'font-black text-slate-800 text-lg',
                    popup: 'rounded-[2rem] shadow-xl border border-slate-50'
                }
            });

            await cargarClientes();

            setNombre('');
            setTelefono('');
            setEmail('');
            setModalAbierto(false);

        } catch (err: any) {
            setErrorForm(err.message || "Error al registrar el cliente.");
        }
    };

    const clientesFiltrados = listaClientes.filter(c => {
        const nombreValido = c.nombre_completo || '';
        const telefonoValido = c.telefono || '';
        return nombreValido.toLowerCase().includes(busqueda.toLowerCase()) || telefonoValido.includes(busqueda);
    });

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8 relative">
            
            {/* Cabecera superior de Control */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={() => navigate('/inicio')}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                    Volver al Menú
                </button>

                <button
                    onClick={() => setModalAbierto(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
                >
                    <FiUserPlus className="text-sm" /> Nuevo Cliente
                </button>
            </div>

            {/* Buscador de Fichas */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Ficha de Clientes Registrados
                    </h2>
                    <div className="w-full sm:w-80 relative">
                        <FiSearch className="absolute left-4 top-3.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente por nombre o tlf..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Tabla de Clientes */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12 text-sm text-slate-400 font-medium">Cargando fichas de clientes...</div>
                    ) : clientesFiltrados.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 font-medium text-sm">
                            No se encontraron clientes registrados en esta sucursal.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Nombre Completo</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Pedidos Totales</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Inversión Acumulada</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {clientesFiltrados.map((cliente, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-800">
                                            <div className="flex flex-col">
                                                <span>{cliente.nombre_completo}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">
                                                    {cliente.telefono || 'Sin teléfono'} {cliente.email ? `| ${cliente.email}` : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-center text-slate-600">
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200/40">
                                                💼 {cliente.totalPedidos || 0}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-emerald-600 text-right">
                                            {Number(cliente.totalGastado || 0).toFixed(2)}€
                                        </td>
                                        <td className="px-8 py-3 text-center">
                                            <button 
                                                onClick={() => navigate(`/nuevo-pedido?cliente=${encodeURIComponent(cliente.nombre_completo)}`)}
                                                className="border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95"
                                            >
                                                Asignar Pedido
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL FLOTANTE INTERACTIVO: FORMULARIO DE REGISTRO */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 relative space-y-6 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Registrar Cliente</h3>
                                <p className="text-xs text-slate-400">Introduce los datos para el envío de avisos.</p>
                            </div>
                            <button onClick={() => setModalAbierto(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 transition-colors">
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        {errorForm && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{errorForm}</div>}

                        <form onSubmit={guardarCliente} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500">Nombre Completo *</label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-3 text-slate-400" />
                                    <input type="text" required placeholder="Ej. Juan Pérez Gómez" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500">Teléfono (WhatsApp)</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-3 text-slate-400" />
                                    <input type="tel" placeholder="Ej. +34600123456" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500">Correo Electrónico</label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-3 text-slate-400" />
                                    <input type="email" placeholder="Ej. juan@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalAbierto(false)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors">Cancelar</button>
                                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 transition-colors">Guardar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clientes;