import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiGrid, FiActivity, FiTrash2 } from 'react-icons/fi'; // 🚀 Importamos FiTrash2
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

    const idEmpresa = localStorage.getItem('id_empresa') || '1';

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
                    id_empresa: idEmpresa,
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

    // 🚀 NUEVA FUNCIÓN: Eliminar servicio con doble confirmación nativa SaaS
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
                body: JSON.stringify({ id_empresa: idEmpresa }) // Validación extra por aislamiento SaaS
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
    
              cargarServicios(); // Refrescamos la tabla instantáneamente
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
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-200">
            {/* Cabecera superior */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={() => navigate('/inicio-admin')}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                    Volver al Menú
                </button>
            </div>

            <div className="text-left">
                <h1 className="text-3xl font-black text-slate-900">Configuración de Servicios</h1>
                <p className="text-slate-400 text-sm">Gestiona los tratamientos de lavado y plancha disponibles para el mostrador.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Formulario de Alta */}
                <form onSubmit={handleAddServicio} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FiPlus className="text-blue-500" /> Nuevo Servicio
                    </h3>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre del Servicio *</label>
                        <input 
                            type="text" 
                            required
                            placeholder="ej: Limpieza de Cortinas" 
                            value={nombreServicio}
                            onChange={(e) => setNombreServicio(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Descripción / Notas</label>
                        <textarea 
                            placeholder="Opcional: detalles del tratamiento..." 
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all min-h-20"
                        />
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95">
                        Añadir al Catálogo
                    </button>
                </form>

                {/* Tabla de Catálogo Activo */}
                <div className="lg:col-span-2 bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <FiGrid className="text-blue-500" /> Catálogo Activo
                        </h3>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs font-bold border border-blue-100/50">
                            {listaServicios.length} Servicios
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Tratamiento / Operación</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Descripción</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-center w-24">Acciones</th> {/* 🚀 Columna de Acciones */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-xs text-slate-400 font-medium">Sincronizando operaciones...</td>
                                    </tr>
                                ) : listaServicios.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-xs text-slate-400 font-medium">No se han registrado servicios en esta sucursal.</td>
                                    </tr>
                                ) : (
                                    listaServicios.map((serv) => (
                                        <tr key={serv.id_servicio} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-800 flex items-center gap-2">
                                                <FiActivity className="text-blue-400" /> {serv.nombre_servicio}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">{serv.descripcion || '—'}</td>
                                            {/* 🚀 Botón de eliminar con papelera */}
                                            <td className="px-6 py-3 text-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleEliminarServicio(serv.id_servicio, serv.nombre_servicio)}
                                                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl bg-slate-50 hover:bg-red-50 transition-colors group"
                                                    title="Eliminar servicio"
                                                >
                                                    <FiTrash2 className="text-sm" />
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