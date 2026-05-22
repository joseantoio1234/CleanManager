import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FiUsers, FiUserPlus, FiEdit2, FiArrowLeft, FiMail, FiLock, FiUser } from 'react-icons/fi';

interface Empleado {
  id_usuario: number;
  username: string;
  email: string;
  fecha_alta: string;
}

const EmpleadosAdmin = () => {
  const navigate = useNavigate();
  const idEmpresa = localStorage.getItem('id_empresa') || '1';

  // Estados del listado
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados del formulario (Alta / Edición)
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Solo requerida en altas

  // 1. Cargar la plantilla de empleados desde MySQL
  const cargarEmpleados = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/empleados/${idEmpresa}`);
      if (response.ok) {
        const data = await response.json();
        setEmpleados(data);
      }
    } catch (error) {
      console.error("Error al cargar la plantilla de personal:", error);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // 2. Manejar el envío del formulario (Alta o Modificación)
  const handleGuardarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('El nombre de usuario es obligatorio.');
      return;
    }

    if (!isEditing && !password) {
      setErrorMsg('La contraseña es obligatoria para dar de alta.');
      return;
    }

    setLoading(true);

    const url = isEditing 
      ? `http://localhost:5000/api/admin/empleados/${selectedId}`
      : 'http://localhost:5000/api/admin/empleados';
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_empresa: parseInt(idEmpresa),
          username: username.trim(),
          email: email.trim() || null,
          password: password || undefined // Si estamos editando y va vacía, el backend no la toca
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(isEditing ? `¡Empleado actualizado con éxito!` : `¡Nuevo operario dado de alta!`);
        limpiarFormulario();
        cargarEmpleados();

        // ⏱️ El mensaje desaparece automáticamente a los 3 segundos
        setTimeout(() => {
          setSuccessMsg('');
        }, 3000);
      } else {
        setErrorMsg(data.message || 'Ocurrió un error en la operación.');
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor local.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Cargar datos en el formulario para modificar
  const handlePrepararEdicion = (emp: Empleado) => {
    setIsEditing(true);
    setSelectedId(emp.id_usuario);
    setUsername(emp.username);
    setEmail(emp.email || '');
    setPassword(''); // La contraseña se deja en blanco por privacidad
    setErrorMsg('');
  };

  const limpiarFormulario = () => {
    setIsEditing(false);
    setSelectedId(null);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col items-center animate-in fade-in duration-300">
      
      {/* ENCABEZADO CON BOTÓN VOLVER */}
      <div className="w-full max-w-6xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Control de Plantilla</h1>
          <p className="text-xs text-slate-400 font-medium">Supervisa las cuentas de acceso, cambia datos y añade nuevos operarios de mostrador.</p>
        </div>
        
        <button 
          onClick={() => navigate('/inicio-admin')}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs h-10 px-4 rounded-xl border border-slate-200/80 shadow-sm transition-all active:scale-95"
        >
          <FiArrowLeft size={16} className="text-slate-400" />
          Volver al menú
        </button>
      </div>

      {/* GRID PANORÁMICO */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* COLUMNA IZQUIERDA: Formulario dinámico (Alta / Modificación) */}
        <div className="md:col-span-2 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-white h-fit">
          <h2 className="text-md font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              {isEditing ? <FiEdit2 size={14}/> : <FiUserPlus size={14}/>}
            </span>
            {isEditing ? "Modificar Operario" : "Dar de Alta Operario"}
          </h2>

          {errorMsg && <div className="p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-xl mb-3 text-center">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-xl mb-3 text-center">{successMsg}</div>}

          <form onSubmit={handleGuardarEmpleado} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Usuario de Acceso *</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400"><FiUser size={16}/></span>
                <input 
                  type="text" 
                  placeholder="ej: juan_jerez"
                  className="w-full rounded-xl bg-slate-50 border-none h-11 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email de Contacto</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400"><FiMail size={16}/></span>
                <input 
                  type="email" 
                  placeholder="ej: operario@gmail.com"
                  className="w-full rounded-xl bg-slate-50 border-none h-11 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                {isEditing ? "Nueva Contraseña (Dejar en blanco para no cambiar)" : "Contraseña de Acceso *"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400"><FiLock size={16}/></span>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 border-none h-11 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {isEditing && (
                <Button 
                  type="button" 
                  onClick={limpiarFormulario}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold h-11 rounded-xl transition-all"
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading} 
                className={`font-bold h-11 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isEditing 
                    ? "flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200" 
                    : "w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                }`}
              >
                {isEditing ? <FiEdit2 size={16}/> : <FiUserPlus size={16}/>}
                {loading ? "Guardando..." : isEditing ? "Actualizar datos" : "Dar de alta"}
              </Button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: Tabla con el Personal activo de MySQL */}
        <div className="md:col-span-3 bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/40 border border-white flex flex-col h-[520px]">
          <h2 className="text-md font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2 text-left">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FiUsers size={14}/></span>
            Plantilla Activa de Mostrador
            <span className="text-xs bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-md">{empleados.length}</span>
          </h2>

          <div className="w-full flex-1 overflow-y-auto pr-1 border border-slate-50 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Usuario</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Email</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {empleados.length > 0 ? (
                  empleados.map((emp) => (
                    <tr key={emp.id_usuario} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="py-3 px-4 text-sm font-semibold text-slate-700 text-left">{emp.username}</td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-400 text-left">{emp.email || 'Sin especificar'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handlePrepararEdicion(emp)}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold text-[11px] py-1.5 px-3 rounded-lg border border-amber-200/50 transition-all active:scale-95"
                        >
                          <FiEdit2 size={12}/>
                          Modificar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-xs text-slate-400 font-medium">
                      No se han encontrado empleados activos en este negocio.
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

export default EmpleadosAdmin;