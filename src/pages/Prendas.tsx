import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTag, FiPlus, FiShoppingBag } from 'react-icons/fi';

interface Prenda {
    id_prenda: number;
    nombre_prenda: string;
    precio_base: number;
}

const Pretendas = () => {
    const navigate = useNavigate();
    const [prendas, setPrendas] = useState<Prenda[]>([]);
    const [loading, setLoading] = useState(true);

    const ID_EMPRESA = 1; 

    const cargarPrendas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/prendas/${ID_EMPRESA}`);
            if (!response.ok) throw new Error("Error conectando al servidor");
            const data = await response.json();
            setPrendas(data);
        } catch (error) {
            console.error("Error cargando catálogo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPrendas();
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
            {/* Botón de regreso al menú modular */}
            <button 
                onClick={() => navigate('/inicio')}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group print:hidden"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                Volver al Menú
            </button>

            {/* Tarjeta de Cabecera y Contenedor */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white overflow-hidden">
                <div className="bg-amber-500 p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FiTag /> Catálogo de Prendas y Tarifas
                        </h1>
                        <p className="text-amber-50 text-sm">Configura los tipos de prendas por defecto y sus precios base de lavado y planchado.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/prendas/nueva')}
                        className="bg-white text-amber-600 hover:bg-amber-50 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
                    >
                        <FiPlus /> Añadir Prenda
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">
                            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Sincronizando catálogo...
                        </div>
                    ) : prendas.length === 0 ? (
                        <div className="text-center py-20 px-6 max-w-md mx-auto space-y-4">
                            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
                                <FiTag />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-900">Catálogo vacío</h3>
                                <p className="text-slate-400 text-sm">Aún no has registrado ninguna prenda base en tu sistema. Añade tu primera tarifa para automatizar tus tickets.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/prendas/nueva')}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-amber-200 transition-all active:scale-95"
                            >
                                + Registrar primera prenda
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Prenda ID</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Nombre de la Prenda</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Tarifa Base (IVA Incl.)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {prendas.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400">#P-{item.id_prenda}</td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                                                <FiShoppingBag />
                                            </div>
                                            {item.nombre_prenda}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">
                                            <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-800 border border-slate-200/40">
                                                {Number(item.precio_base).toFixed(2)}€
                                            </span>
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

export default Pretendas;