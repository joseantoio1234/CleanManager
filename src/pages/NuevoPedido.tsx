import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiInfo, FiTag } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authRepository } from '../database/repositories/auth.repository';

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado unificado para controlar los datos del formulario
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    prenda: '',
    servicio: '',
    total: '',
    observaciones: ''
  });

  // Manejador genérico para actualizar los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Reemplazamos la coma por un punto por si el usuario escribe "22,99"
      const totalFormateado = formData.total.replace(',', '.');

      // Enviamos el pedido real a MySQL mapeando cada campo a su respectiva columna
      await authRepository.createOrder({
        id_empresa: 1, // Hardcodeado de forma temporal hasta asociar la sesión real
        prenda: formData.prenda, // Va directo a la nueva columna 'prenda'
        cliente: formData.cliente,
        servicio: formData.servicio, // Va directo a la columna 'servicio' (sin mezclar textos)
        estado: 'EN_LAVADO', // Todo pedido empieza por defecto en lavado
        total: parseFloat(totalFormateado) || 0 // Convierte el string a número sin fallos por comas
      });

      alert("¡Pedido registrado con éxito en tu MySQL Workbench!");
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || "Hubo un problema al guardar el pedido localmente.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-blue-100 text-sm">Rellena los datos para generar un nuevo de ticket de servicio.</p>
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
                <Input 
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  placeholder="Ej: Maria García" 
                  required 
                  className="rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Teléfono de contacto</label>
                <Input 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="600 000 000" 
                  required 
                  className="rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Prenda y Servicio */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
              <FiTag className="text-blue-500" /> Detalles de la Prenda
            </h2>
            <div className="space-y-4">
              {/* Desplegable de Tipo de Ropa/Prenda */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo de Prenda</label>
                <select 
                  name="prenda"
                  value={formData.prenda}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 rounded-xl bg-slate-50/50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="">Selecciona la prenda...</option>
                  <option value="Traje (2/3 piezas)">Traje (2/3 piezas)</option>
                  <option value="Camisa / Blusa">Camisa / Blusa</option>
                  <option value="Pantalón / Vaquero">Pantalón / Vaquero</option>
                  <option value="Edredón / Manta / Nórdico">Edredón / Manta / Nórdico</option>
                  <option value="Abrigo / Gabardina / Chaqueta">Abrigo / Gabardina / Chaqueta</option>
                  <option value="Vestido (Corto / Fiesta)">Vestido (Corto / Fiesta)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo de Servicio</label>
                <select 
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 rounded-xl bg-slate-50/50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="">Selecciona el tratamiento...</option>
                  <option value="Limpieza en seco">Limpieza en seco</option>
                  <option value="Lavado y Planchado">Lavado y Planchado</option>
                  <option value="Solo Planchado">Solo Planchado</option>
                  <option value="Tratamiento Quitamanchas Especial">Tratamiento Quitamanchas Especial</option>
                  <option value="Arreglo / Costura">Arreglo / Costura</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Importe Total (€)</label>
                <Input 
                  name="total"
                  value={formData.total}
                  onChange={handleChange}
                  type="text" // Cambiado a text para permitir que el usuario escriba la coma sin bloqueos del navegador
                  placeholder="0.00" 
                  required 
                  className="rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>
            </div>
          </div>

          {/* Observaciones a ancho completo */}
          <div className="md:col-span-2 space-y-2">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
              <FiInfo className="text-blue-500" /> Observaciones y Manchas
            </h2>
            <textarea 
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
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