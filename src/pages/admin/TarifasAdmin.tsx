import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FiPlus, FiSearch, FiDollarSign, FiTag } from 'react-icons/fi';

interface Prenda {
  id_prenda: number;
  nombre_prenda: string;
  precio_base: number;
}

const TarifasAdmin = () => {
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [nombrePrenda, setNombrePrenda] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const idEmpresa = localStorage.getItem('id_empresa') || '1';

  // 1. Cargar el catálogo de prendas actual desde tu base de datos MySQL
  const cargarPrendas = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/prendas/${idEmpresa}`);
      if (response.ok) {
        const data = await response.json();
        setPrendas(data);
      }
    } catch (error) {
      console.error("Error al cargar el catálogo desde MySQL:", error);
    }
  };

  useEffect(() => {
    cargarPrendas();
  }, []);

  // 2. Manejar el alta de una nueva prenda (Envío POST al backend)
  const handleGuardarPrenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nombrePrenda.trim() || !precioBase) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    const precioNum = parseFloat(precioBase);
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorMsg('Introduce un precio válido mayor que 0.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/prendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_empresa: parseInt(idEmpresa),
          nombre_prenda: nombrePrenda.trim(),
          precio_base: precioNum
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`¡Prenda "${nombrePrenda}" añadida con éxito!`);
        setNombrePrenda('');
        setPrecioBase('');
        cargarPrendas(); // Recargamos la tabla automáticamente llamando a MySQL de nuevo
      } else {
        setErrorMsg(data.message || 'No se pudo guardar la prenda.');
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor local.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado reactivo en tiempo real para el buscador superior
  const prendasFiltradas = prendas.filter(prenda =>
    prenda.nombre_prenda.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col items-center animate-in fade-in duration-300">
      
      {/* Encabezado del Módulo */}
      <div className="w-full max-w-6xl mb-6 text-left">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Configuración de Tarifas</h1>
        <p className="text-xs text-slate-400 font-medium">Gestiona los precios base de los servicios y ropa para el mostrador TPV.</p>
      </div>

      {/* Grid Panorámico de dos columnas (Formulario + Tabla) */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* COLUMNA IZQUIERDA: Formulario de Alta (2/5 del ancho total) */}
        <div className="md:col-span-2 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-white h-fit">
          <h2 className="text-md font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FiTag size={14}/></span>
            Nueva Prenda
          </h2>

          {errorMsg && <div className="p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-xl mb-3 text-center">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-xl mb-3 text-center animate-bounce">{successMsg}</div>}

          <form onSubmit={handleGuardarPrenda} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre del Servicio / Prenda *</label>
              <Input 
                type="text" 
                placeholder="ej: Edredón Plumas Cama 150"
                className="rounded-xl bg-slate-50 border-none h-11 px-4 text-sm"
                value={nombrePrenda}
                onChange={(e) => setNombrePrenda(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Precio Base (€) *</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400"><FiDollarSign size={16}/></span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl bg-slate-50 border-none h-11 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2">
              <FiPlus size={16}/>
              {loading ? "Guardando..." : "Añadir al catálogo"}
            </Button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Tabla con la Rejilla de MySQL (3/5 del ancho total) */}
        <div className="md:col-span-3 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-white flex flex-col h-[520px]">
          
          {/* Cabecera interna con Buscador */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-md font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              Catálogo Activo
              <span className="text-xs bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-md">{prendas.length}</span>
            </h2>
            
            <div className="relative flex items-center max-w-[240px] w-full">
              <span className="absolute left-3 text-slate-400"><FiSearch size={14}/></span>
              <Input 
                type="text"
                placeholder="Buscar prenda..."
                className="rounded-xl bg-slate-50 border-none h-9 pl-9 pr-4 text-xs"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Contenedor scrolleable */}
          <div className="w-full flex-1 overflow-y-auto pr-1 border border-slate-50 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase">Prenda / Servicio</th>
                  <th className="py-2 px-4 text-[10px] font-bold text-slate-400 uppercase text-right">Precio Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {prendasFiltradas.length > 0 ? (
                  prendasFiltradas.map((prenda) => (
                    <tr key={prenda.id_prenda} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="py-3 px-4 text-sm font-semibold text-slate-700 text-left">{prenda.nombre_prenda}</td>
                      <td className="py-3 px-4 text-sm font-black text-blue-600 text-right">
                        {Number(prenda.precio_base).toFixed(2)}€
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center py-12 text-xs text-slate-400 font-medium">
                      No se han encontrado prendas en el catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TarifasAdmin;