import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiInfo, FiTag } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authRepository } from '../database/repositories/auth.repository';

// Definimos la estructura de la prenda que viene de MySQL
interface PrendaCatalogo {
  id_prenda: number;
  nombre_prenda: string;
  precio_base: number;
}

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [listaPrendas, setListaPrendas] = useState<PrendaCatalogo[]>([]);

  // Estado unificado para controlar los datos del formulario
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    prenda: '',
    servicio: '',
    total: '',
    observaciones: ''
  });

  // 1. Cargar las prendas dinámicamente desde MySQL al montar la vista
  useEffect(() => {
    const cargarPrendasMostrador = async () => {
      try {
        // Recuperamos el id_empresa de la sesión activa
        const idEmpresa = localStorage.getItem('id_empresa') || '1';
        
        const response = await fetch(`http://localhost:3000/api/prendas-mostrador/${idEmpresa}`);
        if (!response.ok) throw new Error('Error al solicitar el catálogo');
        
        const data = await response.json();
        setListaPrendas(data);
      } catch (error) {
        console.error("❌ No se pudo cargar el desplegable de prendas:", error);
      }
    };

    cargarPrendasMostrador();
  }, []);

  // 2. Manejador para actualizar los campos y aplicar el auto-relleno del precio
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const nuevoEstado = { ...prev, [name]: value };

      // Si cambia la prenda, buscamos su precio base de forma automática
      if (name === 'prenda') {
        if (value === 'Varios') {
          nuevoEstado.total = ''; // Dejamos vacío para que el empleado escriba a mano
        } else {
          const prendaSeleccionada = listaPrendas.find(p => p.nombre_prenda === value);
          if (prendaSeleccionada) {
            // Rellenamos el precio base formateado a dos decimales
            nuevoEstado.total = prendaSeleccionada.precio_base.toFixed(2);
          } else {
            nuevoEstado.total = '';
          }
        }
      }

      return nuevoEstado;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const idEmpresaLogueada = parseInt(localStorage.getItem('id_empresa') || '1');
      
      // Reemplazamos la coma por un punto por si el usuario edita o escribe manual "22,99"
      const totalFormateado = formData.total.replace(',', '.');

      // Enviamos el pedido real a MySQL mapeando cada campo a su respectiva columna
      await authRepository.createOrder({
        id_empresa: idEmpresaLogueada, 
        prenda: formData.prenda, 
        cliente: formData.cliente,
        servicio: formData.servicio, 
        estado: 'EN_LAVADO', // Todo pedido empieza por defecto en el taller
        total: parseFloat(totalFormateado) || 0 
      });

      alert("¡Pedido registrado con éxito en el sistema!");
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || "Hubo un problema al guardar el pedido localmente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-in fade-in duration-200">
      {/* Botón Volver al Menú Principal */}
      <button 
        onClick={() => navigate('/inicio')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al Inicio
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white overflow-hidden">
        {/* Encabezado del Formulario */}
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold">Registro de Pedido (Mostrador)</h1>
          <p className="text-blue-100 text-sm">Registra la entrada de ropa y genera el ticket de servicio para el taller.</p>
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
              
              {/* Desplegable de Tipo de Ropa/Prenda DINÁMICO */}
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
                  
                  {/* Renderizamos dinámicamente las prendas cargadas de MySQL */}
                  {listaPrendas.map((item) => (
                    <option key={item.id_prenda} value={item.nombre_prenda}>
                      {item.nombre_prenda} ({item.precio_base.toFixed(2)}€)
                    </option>
                  ))}
                  
                  {/* Comodín de Emergencia para artículos raros */}
                  <option value="Varios">-- [Prenda Comodín / Especial Varios] --</option>
                </select>
              </div>

              {/* Desplegable de Tipo de Servicio */}
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
                  <option value="Limpieza">Limpieza Completa</option>
                  <option value="Limpieza alfombras">Limpieza alfombras</option>
                  <option value="Limpieza cortinas">Limpieza cortinas</option>
                  <option value="Limpieza en seco">Limpieza en seco</option>
                  <option value="Plancha">Solo Plancha</option>
                  <option value="Secado">Solo Secado</option>
                </select>
              </div>

              {/* Importe Total (Auto-rellenado o Manual si es 'Varios') */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Importe Total (€)</label>
                <Input 
                  name="total"
                  value={formData.total}
                  onChange={handleChange}
                  type="text" 
                  placeholder="0.00" 
                  required 
                  // Si seleccionó una prenda estándar, deshabilitamos para evitar que alteren la tarifa fija
                  disabled={formData.prenda !== 'Varios' && formData.prenda !== ''} 
                  className={`rounded-xl border-slate-100 ${formData.prenda !== 'Varios' && formData.prenda !== '' ? 'bg-slate-100 cursor-not-allowed font-semibold text-slate-700' : 'bg-slate-50/50'}`} 
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
              className="w-full p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px] transition-all"
              placeholder="Indica aquí si la prenda tiene manchas específicas, descosidos o si es una entrega urgente..."
            ></textarea>
          </div>

          {/* Botones Finales */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
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
              onClick={() => navigate('/inicio')}
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