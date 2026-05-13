import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiInfo, FiTag } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de guardado
    setTimeout(() => {
      alert("¡Pedido registrado con éxito!");
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Botón Volver al Dashboard */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al Panel
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white overflow-hidden">
        {/* Encabezado del Formulario */}
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold">Registro de Pedido</h1>
          <p className="text-blue-100 text-sm">Rellena los datos para generar un nuevo ticket de servicio.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Columna Izquierda: Cliente */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
              <FiUser className="text-blue-500" /> Datos del Cliente
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
                <Input placeholder="Ej: Maria García" required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Teléfono de contacto</label>
                <Input placeholder="600 000 000" required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Servicio */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
              <FiTag className="text-blue-500" /> Detalles de la Prenda
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo de Servicio</label>
                <select className="w-full h-10 px-4 rounded-xl bg-slate-50/50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                  <option>Selecciona una opción...</option>
                  <option>Limpieza en seco (Traje)</option>
                  <option>Lavado y Planchado (Camisa)</option>
                  <option>Limpieza de Edredón</option>
                  <option>Prenda de Piel / Ante</option>
                  <option>Arreglo de costura</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Importe Total (€)</label>
                <Input type="number" step="0.01" placeholder="0.00" required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
            </div>
          </div>

          {/* Observaciones a ancho completo */}
          <div className="md:col-span-2 space-y-2">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
              <FiInfo className="text-blue-500" /> Observaciones y Manchas
            </h2>
            <textarea 
              className="w-full p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-[120px] transition-all"
              placeholder="Indica aquí si la prenda tiene manchas específicas, descosidos o si es una entrega urgente..."
            ></textarea>
          </div>

          {/* Botones Finales */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <FiSave className="mr-2" /> {loading ? "Registrando..." : "Confirmar y Guardar Pedido"}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="px-10 h-12 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoPedido;