import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiCheckCircle, FiSave } from 'react-icons/fi';

interface DetalleFactura {
    id_pedido: number;
    prenda: string;
    cliente: string;
    servicio: string;
    estado: string;
    total: number;
    fecha_pedido: string;
    nombre_tintoreria: string;
    cif: string;
    direccion: string;
    municipio: string;
    provincia: string;
    codigo_postal: string;
    num_factura: string | null;
    fecha_factura: string | null;
    base_imponible: number | null;
    importe_iva: number | null;
}

const Factura = () => {
    const { id_pedido } = useParams<{ id_pedido: string }>();
    const navigate = useNavigate();
    const [factura, setFactura] = useState<DetalleFactura | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchFactura = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/orders/${id_pedido}`);
            if (!response.ok) throw new Error("Error obteniendo el ticket de caja");
            const data = await response.json();
            setFactura(data);
        } catch (error) {
            console.error(error);
            alert("No se pudo cargar el desglose de facturación.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFactura();
    }, [id_pedido]);

    const handleGuardarFactura = async () => {
        try {
            setSaving(true);
            const response = await fetch(`http://localhost:5000/api/orders/${id_pedido}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'ENTREGADO' }), 
            });

            if (!response.ok) throw new Error("Error al procesar el cierre fiscal.");
            
            alert("¡Factura generada y guardada con éxito en la base de datos!");
            await fetchFactura();
        } catch (error) {
            console.error(error);
            alert("Hubo un problema al guardar la factura de forma definitiva.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-slate-400 font-medium">
                Calculando bases imponibles y desgloses de IVA...
            </div>
        );
    }

    if (!factura) return <div className="p-6 text-center text-red-500 font-bold">Ticket no encontrado.</div>;

    const totalFactura = Number(factura.total);
    const baseImponible = factura.base_imponible !== null ? Number(factura.base_imponible) : (totalFactura / 1.21);
    const importeIva = factura.importe_iva !== null ? Number(factura.importe_iva) : (totalFactura - baseImponible);
    const fechaDocumento = factura.fecha_factura ? factura.fecha_factura : factura.fecha_pedido;

    const esBorrador = factura.estado !== 'ENTREGADO';

    return (
        <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
            {/* Cabecera de control  */}
            <div className="flex items-center justify-between print:hidden">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                    Volver al Panel
                </button>
                
                <div className="flex items-center gap-3">
                    {esBorrador && (
                        <button
                            onClick={handleGuardarFactura}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold shadow-md flex items-center gap-2 text-sm transition-all active:scale-95 disabled:bg-slate-300"
                        >
                            <FiSave /> {saving ? "Guardando..." : "Confirmar Pago y Guardar"}
                        </button>
                    )}
                    
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold shadow-md flex items-center gap-2 text-sm transition-all active:scale-95"
                    >
                        <FiPrinter /> Imprimir Factura / Ticket
                    </button>
                </div>
            </div>

            {/* CUERPO DEL TICKET / FACTURA */}
            <div className="bg-white rounded-4xl shadow-xl shadow-slate-100 p-8 border border-slate-100 font-mono text-slate-800 relative overflow-hidden print:shadow-none print:border-none print:p-0">
                
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border print:hidden ${
                    esBorrador 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                    <FiCheckCircle /> {esBorrador ? 'Borrador / Pendiente' : 'Pagado / Caja Cerrada'}
                </div>

                {/* Datos de la Tintorería (Emisor) */}
                <div className="text-center space-y-1 border-b border-dashed pb-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">{factura.nombre_tintoreria}</h2>
                    <p className="text-xs font-bold text-slate-500">NIF / CIF: {factura.cif}</p>
                    <p className="text-xs text-slate-500">{factura.direccion}</p>
                    <p className="text-xs text-slate-500">{factura.codigo_postal}, {factura.municipio} ({factura.provincia})</p>
                </div>

                {/* Metadatos del Documento Comercial */}
                <div className="grid grid-cols-2 gap-4 py-6 text-xs border-b border-dashed">
                    <div className="space-y-1">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Nº Factura Simplificada</p>
                        <p className="font-bold text-slate-800">
                            {factura.num_factura || `FS-${new Date().getFullYear()}-${factura.id_pedido.toString().padStart(6, '0')} (Borrador)`}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Fecha de Emisión</p>
                        <p className="font-bold text-slate-800">
                            {new Date(fechaDocumento).toLocaleDateString('es-ES')} {new Date(fechaDocumento).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <div className="space-y-1 col-span-2 pt-2">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Cliente Receptor</p>
                        <p className="font-bold text-slate-800">{factura.cliente}</p>
                    </div>
                </div>

                <div className="py-6 border-b border-dashed space-y-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Descripción Servicio</span>
                        <span>Total</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                        <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{factura.prenda}</p>
                            <p className="text-xs text-slate-500">{factura.servicio}</p>
                        </div>
                        <span className="font-bold text-slate-900">{totalFactura.toFixed(2)}€</span>
                    </div>
                </div>

                {/* Desglose Fiscal Obligatorio de España */}
                <div className="py-6 space-y-2 border-b border-dashed text-xs">
                    <div className="flex justify-between text-slate-500">
                        <span>Base Imponible (Excl. IVA):</span>
                        <span>{baseImponible.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>I.V.A. Soportado (21%):</span>
                        <span>{importeIva.toFixed(2)}€</span>
                    </div>
                </div>

                {/* Importe Bruto Total */}
                <div className="pt-6 flex justify-between items-center font-sans">
                    <span className="text-base font-black text-slate-900 uppercase tracking-wide">Total Recaudado</span>
                    <span className="text-2xl font-black text-blue-600">{totalFactura.toFixed(2)}€</span>
                </div>

                <div className="text-center pt-8 text-[10px] text-slate-400 space-y-1">
                    <p className="font-bold">¡Gracias por su confianza!</p>
                    <p>Factura simplificada emitida según el RD 1619/2012.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    nav, footer, .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Factura;