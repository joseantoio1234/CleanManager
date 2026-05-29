import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiInfo, FiTag } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authRepository } from '../database/repositories/auth.repository';
import Swal from 'sweetalert2'; 

interface PrendaCatalogo {
  id_prenda: number;
  nombre_prenda: string;
  precio_base: any;
}

interface ClienteRegistrado {
  id_cliente?: number;
  nombre_completo: string;
  telefono?: string;
  email?: string;
}

interface ServicioCatalogo {
  id_servicio: number;
  nombre_servicio: string;
  descripcion?: string;
}

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [listaPrendas, setListaPrendas] = useState<PrendaCatalogo[]>([]);
  const [listaClientes, setListaClientes] = useState<ClienteRegistrado[]>([]); 
  const [listaServicios, setListaServicios] = useState<ServicioCatalogo[]>([]); 

  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    email: '', 
    prenda: '',
    servicio: '',
    total: '',
    observaciones: ''
  });

  useEffect(() => {
    const cargarDatosMostrador = async () => {
      try {
        const idEmpresa = localStorage.getItem('id_empresa') || '1';
        
        const resPrendas = await fetch(`http://localhost:5000/api/prendas/${idEmpresa}`);
        if (!resPrendas.ok) throw new Error('Error al solicitar el catálogo de prendas');
        const dataPrendas = await resPrendas.json();
        setListaPrendas(dataPrendas);

        const resClientes = await fetch(`http://localhost:5000/api/clientes/${idEmpresa}`);
        if (resClientes.ok) {
          const dataClientes = await resClientes.json();
          setListaClientes(dataClientes);
        }

        const resServicios = await fetch(`http://localhost:5000/api/servicios/${idEmpresa}`);
        if (resServicios.ok) {
          const dataServicios = await resServicios.json();
          setListaServicios(dataServicios);
        }

      } catch (error) {
        console.error("❌ Error al inicializar datos del mostrador:", error);
      }
    };

    cargarDatosMostrador();
  }, []);

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombreSeleccionado = e.target.value;
    const clienteEncontrado = listaClientes.find(c => c.nombre_completo === nombreSeleccionado);

    if (clienteEncontrado) {
      setFormData(prev => ({
        ...prev,
        cliente: nombreSeleccionado,
        telefono: clienteEncontrado.telefono || '',
        email: clienteEncontrado.email || '' 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        cliente: nombreSeleccionado,
        telefono: '',
        email: ''
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const nuevoEstado = { ...prev, [name]: value };

      if (name === 'prenda') {
        if (value === 'Varios') {
          nuevoEstado.total = ''; 
        } else {
          const prendaSeleccionada = listaPrendas.find(p => p.nombre_prenda === value);
          if (prendaSeleccionada) {
            const precioNumerico = Number(prendaSeleccionada.precio_base) || 0;
            nuevoEstado.total = precioNumerico.toFixed(2);
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
      const totalFormateado = formData.total.replace(',', '.');

      await authRepository.createOrder({
        id_empresa: idEmpresaLogueada,
        prenda: formData.prenda,
        cliente: formData.cliente,
        servicio: formData.servicio,
        telefono: formData.telefono || null,
        email: formData.email || null,
        estado: 'EN_LAVADO',
        total: parseFloat(totalFormateado) || 0
      });

      Swal.fire({
        title: '¡Pedido Registrado!',
        text: 'La orden ha sido guardada y enviada a la sección de lavado.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[2rem] shadow-xl border border-slate-50' }
      });

      navigate('/dashboard');
    } catch (error: any) {
      Swal.fire({
        title: 'Error al registrar',
        text: error.message || 'Hubo un problema al guardar el pedido de forma local.',
        icon: 'error',
        customClass: { popup: 'rounded-[2rem] shadow-xl' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-in fade-in duration-200">
      <button 
        type="button"
        onClick={() => navigate('/inicio')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al Inicio
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white overflow-hidden">
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
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Seleccionar Cliente</label>
                <select 
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleClienteChange}
                  required
                  className="w-full h-10 px-4 rounded-xl bg-slate-50/50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="">-- Elige un cliente registrado --</option>
                  {listaClientes.map((c, index) => (
                    <option key={c.id_cliente || index} value={c.nombre_completo}>
                      {c.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Teléfono de contacto</label>
                <Input 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Se autocompletará solo..." 
                  required 
                  className="rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Correo Electrónico</label>
                <div className="relative flex items-center">
                  <Input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com" 
                    className="rounded-xl border-slate-100 bg-slate-50/50 w-full" 
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Columna Derecha: Prenda y Servicio */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
              <FiTag className="text-blue-500" /> Detalles de la Prenda
            </h2>
            <div className="space-y-4">
              
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
                  {listaPrendas.map((item) => {
                    const precioNumerico = Number(item.precio_base) || 0;
                    return (
                      <option key={item.id_prenda} value={item.nombre_prenda}>
                        {item.nombre_prenda} ({precioNumerico.toFixed(2)}€)
                      </option>
                    );
                  })}
                  <option value="Varios">-- [Prenda Comodín / Especial Varios] --</option>
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
                  {listaServicios.map((s, index) => (
                    <option key={s.id_servicio || index} value={s.nombre_servicio}>
                      {s.nombre_servicio}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Importe Total (€)</label>
                <Input 
                  name="total"
                  value={formData.total}
                  onChange={handleChange}
                  type="text" 
                  placeholder="0.00" 
                  required 
                  disabled={formData.prenda !== 'Varios' && formData.prenda !== ''} 
                  className={`rounded-xl border-slate-100 ${formData.prenda !== 'Varios' && formData.prenda !== '' ? 'bg-slate-100 cursor-not-allowed font-semibold text-slate-700' : 'bg-slate-50/50'}`} 
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
              <FiInfo className="text-blue-500" /> Observaciones y Manchas
            </h2>
            <textarea 
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-25 transition-all"
              placeholder="Indica aquí si la prenda tiene manchas específicas, descosidos o si es una entrega urgente..."
            ></textarea>
          </div>

          {/* Botones Finales */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="grow bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
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