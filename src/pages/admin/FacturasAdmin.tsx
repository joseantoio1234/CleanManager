import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrendingUp, FiPieChart, FiDollarSign } from 'react-icons/fi';

interface FacturaFiscal {
  id_factura: number;
  num_factura: string;
  fecha_factura: string;
  base_imponible: number;
  importe_iva: number;
  total_facturado: number;
  metodo_pago: string;
  cliente: string;
  prenda: string;
}

const FacturasAdmin = () => {
  const navigate = useNavigate();
  const idEmpresa = localStorage.getItem('id_empresa') || '1';

  const [facturas, setFacturas] = useState<FacturaFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  const [totales, setTotales] = useState({ base: 0, iva: 0, total: 0 });

  const cargarHistorialFiscal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/facturas/${idEmpresa}`);
      if (response.ok) {
        const data = await response.json();
        setFacturas(data);

        const acumulado = data.reduce(
          (acc: any, curr: FacturaFiscal) => {
            acc.base += Number(curr.base_imponible);
            acc.iva += Number(curr.importe_iva);
            acc.total += Number(curr.total_facturado);
            return acc;
          },
          { base: 0, iva: 0, total: 0 }
        );
        setTotales(acumulado);
      }
    } catch (error) {
      console.error("Error cargando el historial fiscal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorialFiscal();
  }, [idEmpresa]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Botón superior Volver al menú */}
      <div className="w-full max-w-6xl flex justify-end mb-2">
        <button 
          onClick={() => navigate('/inicio-admin')} 
          className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-2xl font-bold text-sm border border-slate-100 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
        >
          <FiArrowLeft className="text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" size={16} /> 
          <span>Volver al menú</span>
        </button>
      </div>

      <div className="w-full text-left">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Historial Fiscal e IVA</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Consulta la relación de facturas legales simplificadas y el desglose impositivo de la sucursal.</p>
      </div>

      {/* TARJETAS DE CONTABILIDAD RÁPIDA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-4xl shadow-xl shadow-blue-100/30 border border-white flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Imponible Total</p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{totales.base.toFixed(2)}€</h3>
            <p className="text-[9px] text-slate-400 font-medium">Ingreso neto libre de impuestos</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl"><FiPieChart size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-4xl shadow-xl shadow-blue-100/30 border border-white flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IVA Soportado (21%)</p>
            <h3 className="text-xl font-black text-blue-600 tracking-tight">{totales.iva.toFixed(2)}€</h3>
            <p className="text-[9px] text-slate-400 font-medium">Cuota acumulada devengada</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FiTrendingUp size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-4xl shadow-xl shadow-blue-100/30 border border-white flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Facturado bruto</p>
            <h3 className="text-xl font-black text-emerald-600 tracking-tight">{totales.total.toFixed(2)}€</h3>
            <p className="text-[9px] text-slate-400 font-medium">Suma total de caja con IVA</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><FiDollarSign size={20} /></div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE AUDITORÍA */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/30 border border-white overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 text-left">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            Libro de Facturas Registradas <span className="bg-slate-700 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{facturas.length}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Nº Factura</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Fecha Emisión</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Detalle / Cliente</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Pago</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Base Imp.</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">IVA (21%)</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Total Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-xs text-slate-400 font-bold">Cargando contabilidad fiscal...</td>
                </tr>
              ) : facturas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-xs text-slate-400 font-bold">No se han emitido facturas de entrega en esta sucursal todavía.</td>
                </tr>
              ) : (
                facturas.map((fac) => (
                  <tr key={fac.id_factura} className="hover:bg-slate-50/30 transition-colors text-xs">
                    <td className="px-6 py-4 font-black text-blue-600 font-mono">{fac.num_factura}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(fac.fecha_factura).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <div className="font-bold text-slate-800">{fac.cliente}</div>
                      <div className="text-[10px] text-slate-400">{fac.prenda}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[9px] font-black uppercase">
                        {fac.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-bold text-right">{Number(fac.base_imponible).toFixed(2)}€</td>
                    <td className="px-6 py-4 text-blue-500 font-bold text-right">{Number(fac.importe_iva).toFixed(2)}€</td>
                    <td className="px-6 py-4 text-slate-900 font-black text-right">{Number(fac.total_facturado).toFixed(2)}€</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default FacturasAdmin;