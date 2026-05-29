import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiGrid, FiActivity, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';

interface ServicioCatalogo {
    id_servicio: number;
    nombre_servicio: string;
    descripcion: string;
}

const Servicios = () => {
    const navigate = useNavigate();
    const [listaServicios, setListaServicios] = useState<ServicioCatalogo[]>([]);
    const [nombreServicio, setNombreServicio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(true);

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

    const cargarServicios = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/servicios/${idEmpresa}`);
            if (!response.ok) throw new Error('Error al solicitar el catálogo');
            const data = await response.json();
            setListaServicios(data);
        } catch (error) {
            console.error("❌ No se pudo cargar el desplegable de servicios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarServicios();
    }, [idEmpresa]);

    const handleAddServicio = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombreServicio.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/servicios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empresa: parseInt(idEmpresa),
                    nombre_servicio: nombreServicio.trim(),
                    descripcion: descripcion.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Error al guardar');

            Swal.fire({
                title: '¡Servicio Creado!',
                text: `Tratamiento "${nombreServicio}" añadido con éxito.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'rounded-[2rem]' }
            });

            setNombreServicio('');
            setDescripcion('');
            cargarServicios();
        } catch (error: any) {
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo añadir el servicio.',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
            });
        }
    };

    const handleEliminarServicio = async (id_servicio: number, nombre: string) => {
        Swal.fire({
          title: '¿Eliminar Tratamiento?',
          text: `¿Estás seguro de que quieres quitar "${nombre}"? Esta acción no se puede deshacer.`,
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
              const response = await fetch(`http://localhost:5000/api/servicios/${id_servicio}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_empresa: parseInt(idEmpresa) })
              });
    
              const data = await response.json();
              if (!response.ok) throw new Error(data.message || 'Error al eliminar');
    
              Swal.fire({
                title: '¡Eliminado!',
                text: 'El servicio ha sido removido del mostrador.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-[2rem]' }
              });
    
              cargarServicios(); 
            } catch (error: any) {
              Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo eliminar el servicio.',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
              });
            }
          }
        });
    };

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col items-center animate-in fade-in duration-300">
            
            {/*  Cabecera de Módulo */}
            <div className="w-full max-w-6xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Configuración de Servicios</h1>
                    <p className="text-xs text-slate-400 font-medium">Gestiona los tratamientos de lavado y plancha disponibles para el mostrador.</p>
                </div>
                
                <button 
                    onClick={() => navigate('/inicio-admin')}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs h-10 px-4 rounded-xl border border-slate-200/80 shadow-sm transition-all active:scale-95 shrink-0"
                >
                    <FiArrowLeft size={16} className="text-slate-400" />
                    Volver al menú
                </button>
            </div>

            {/* Grid de Contenido */}
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                <form onSubmit={handleAddServicio} className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-white h-fit space-y-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FiPlus size={14}/></span>
                        Nuevo Servicio
                    </h3>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre del Servicio *</label>
                        <input 
                            type="text" 
                            required
                            placeholder="ej: Limpieza de Cortinas" 
                            value={nombreServicio}
                            onChange={(e) => setNombreServicio(e.target.value)}
                            className="w-full px-4 h-11 bg-slate-50 border-none text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Descripción / Notas</label>
                        <textarea 
                            placeholder="Opcional: detalles del tratamiento..." 
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2">
                        Añadir al Catálogo
                    </button>
                </form>

                {/* Tabla de Catálogo Activo  */}
                <div className="lg:col-span-3 bg-white p-6 rounded-4xl shadow-xl shadow-blue-100/40 border border-white flex flex-col h-[520px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FiGrid size={14}/></span>
                            Catálogo Activo
                            <span className="text-xs bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-md">{listaServicios.length}</span>
                        </h3>
                    </div>

                    <div className="w-full flex-1 overflow-y-auto pr-1 border border-slate-50 rounded-xl-----------">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase">Tratamiento / Operación</th>
                                    <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase">Descripción</th>
                                    <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase text-center w-20">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-12 text-xs text-slate-400 font-medium">Sincronizando operaciones...</td>
                                    </tr>
                                ) : listaServicios.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-12 text-xs text-slate-400 font-medium">No se han registrado servicios en esta sucursal.</td>
                                    </tr>
                                ) : (
                                    listaServicios.map((serv) => (
                                        <tr key={serv.id_servicio} className="hover:bg-slate-50/40 transition-colors group">
                                            <td className="py-3 px-4 text-sm font-semibold text-slate-700 text-left flex items-center gap-2">
                                                <FiActivity className="text-blue-500" size={14} /> {serv.nombre_servicio}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-slate-500 font-medium text-left">{serv.descripcion || '—'}</td>
                                            <td className="py-2 px-4 text-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleEliminarServicio(serv.id_servicio, serv.nombre_servicio)}
                                                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl bg-slate-50 hover:bg-red-50 transition-colors"
                                                    title="Eliminar servicio"
                                                >
                                                    <FiTrash2 size={14} />
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
        </div>
    );
};

export default Servicios;