import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiTag } from 'react-icons/fi';

const NuevaPrenda = () => {
    const navigate = useNavigate();
    const [nombrePrenda, setNombrePrenda] = useState('');
    const [precioBase, setPrecioBase] = useState('');
    const [loading, setLoading] = useState(false);

    const ID_EMPRESA = 1;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombrePrenda || !precioBase) return;

        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/prendas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empresa: ID_EMPRESA,
                    nombre_prenda: nombrePrenda,
                    precio_base: parseFloat(precioBase)
                })
            });

            if (!response.ok) throw new Error("Error guardando la prenda");

            alert("¡Prenda añadida al catálogo correctamente!");
            navigate('/prendas');
        } catch (error) {
            console.error(error);
            alert("No se pudo añadir la prenda al catálogo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6 space-y-6">
            <button 
                onClick={() => navigate('/prendas')}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                Volver al Catálogo
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white overflow-hidden p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-3 bg-amber-500 rounded-2xl text-white text-xl">
                        <FiTag />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Añadir Nueva Prenda</h2>
                        <p className="text-xs text-slate-400">Registra un nuevo artículo en tu maestro de tarifas.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Nombre de la Prenda
                        </label>
                        <input 
                            type="text"
                            required
                            placeholder="Ej: Manta Americana, Vestido de Novia, Americana..."
                            value={nombrePrenda}
                            onChange={(e) => setNombrePrenda(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/80 h-12 px-5 text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Tarifa Base (€ - IVA Incluido)
                        </label>
                        <input 
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={precioBase}
                            onChange={(e) => setPrecioBase(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/80 h-12 px-5 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-amber-100 transition-all active:scale-98 flex items-center justify-center gap-2 mt-4"
                    >
                        <FiSave /> {loading ? "Guardando..." : "Guardar en el Catálogo"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NuevaPrenda;