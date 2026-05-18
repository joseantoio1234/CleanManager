import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { authRepository } from '../../database/repositories/auth.repository';
import { 
  validateCIF, 
  validateTelefono, 
  validateCP, 
  validateEmail, 
  validatePassword 
} from '../../utils/regex';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // Estado para la pantalla de carga intermedia
  const [showPassword, setShowPassword] = useState(false);

  // Estados de los campos
  const [formData, setFormData] = useState({
    nombre: '',
    cif: '',
    direccion: '',
    telefono: '',
    codigoPostal: '',
    municipio: '',
    provincia: '',
    email: '',
    password: ''
  });

  // Estado para los mensajes de error
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    if (!value || value.trim() === '') {
      error = 'Este campo es obligatorio';
    } else {
      switch (name) {
        case 'cif': if (!validateCIF(value)) error = 'El CIF/NIF debe tener 9 caracteres'; break;
        case 'telefono': if (!validateTelefono(value)) error = 'Debe tener 9 dígitos numéricos'; break;
        case 'codigoPostal': if (!validateCP(value)) error = 'Debe tener 5 dígitos numéricos'; break;
        case 'email': if (!validateEmail(value)) error = 'Introduce un email válido'; break;
        case 'password': if (!validatePassword(value)) error = 'Contraseña insegura'; break;
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const currentErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([name, value]) => {
      if (!validateField(name, value)) {
        currentErrors[name] = errors[name] || 'Campo inválido o vacío';
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(currentErrors);
      return;
    }

    setLoading(true);
    try {
      const companyData = { 
        nombre_tintoreria: formData.nombre,
        cif: formData.cif, 
        direccion: formData.direccion, 
        telefono_fijo: formData.telefono,
        codigo_postal: formData.codigoPostal, 
        municipio: formData.municipio, 
        provincia: formData.provincia,
        email_acceso: formData.email
      };
      
      // Intentamos el registro real
      await authRepository.signUp(formData.email, formData.password, companyData);
      
      // En lugar del alert, disparamos la transición visual premium hacia el login
      setIsRedirecting(true);
      setTimeout(() => {
        navigate('/login'); 
      }, 1500); // 1.5 segundos para que de tiempo a asimilar la animación

    } catch (error: any) {
      console.error("Error real en registro:", error);
      
      if (error.message?.includes('fetch') || error.name === 'TypeError' || error.message?.includes('NXDOMAIN')) {
        alert("ERROR DE CONEXIÓN: El WiFi actual bloquea la base de datos. Los datos NO se han guardado. Por favor, usa los datos de tu móvil.");
      } else {
        alert("Error de registro: " + (error.message || "No se pudo guardar la empresa"));
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ name }: { name: string }) => (
    errors[name] ? <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse">{errors[name]}</p> : null
  );

  // ==========================================
  // VISTA DE TRANSICIÓN: CREANDO LA CUENTA
  // ==========================================
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-50 animate-in fade-in duration-300">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-200/30 border border-white flex flex-col items-center space-y-6 text-center">
          
          {/* Spinner circular */}
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-800">Creando tu cuenta</h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Configurando el espacio operativo para <span className="text-blue-600 font-bold">{formData.nombre}</span> en CleanManager...
            </p>
          </div>
          
        </div>
      </div>
    );
  }

  // Vista estándar del formulario completo
  return (
    <div className="flex items-start justify-center w-full min-h-screen pt-4 md:pt-8 bg-slate-50 overflow-y-auto pb-10">
      <div className="w-full max-w-[700px] bg-white px-6 py-8 md:px-12 md:py-10 rounded-[2.5rem] shadow-2xl shadow-blue-200/40 flex flex-col border border-white">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600 tracking-tight">CleanManager</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Registro de Nueva Empresa</p>
        </div>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-3 text-left">
          
          <div className="md:col-span-6 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre de la Empresa *</label>
            <Input 
              name="nombre"
              className={`rounded-xl bg-slate-50 border-none h-10 px-4 text-sm transition-all ${errors.nombre ? 'ring-1 ring-red-500 bg-red-50/30' : ''}`}
              value={formData.nombre} 
              onChange={handleChange}
              onBlur={() => validateField('nombre', formData.nombre)}
            />
            <ErrorMsg name="nombre" />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CIF / NIF *</label>
            <Input 
              name="cif"
              className={`rounded-xl bg-slate-50 border-none h-10 px-4 text-sm transition-all ${errors.cif ? 'ring-1 ring-red-500 bg-red-50/30' : ''}`}
              value={formData.cif} 
              onChange={handleChange}
              onBlur={() => validateField('cif', formData.cif)}
            />
            <ErrorMsg name="cif" />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Teléfono *</label>
            <Input 
              name="telefono"
              className={`rounded-xl bg-slate-50 border-none h-10 px-4 text-sm transition-all ${errors.telefono ? 'ring-1 ring-red-500 bg-red-50/30' : ''}`}
              value={formData.telefono} 
              onChange={handleChange}
              onBlur={() => validateField('telefono', formData.telefono)}
            />
            <ErrorMsg name="telefono" />
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dirección Física *</label>
            <Input 
              name="direccion"
              className={`rounded-xl bg-slate-50 border-none h-10 px-4 text-sm transition-all ${errors.direccion ? 'ring-1 ring-red-500 bg-red-50/30' : ''}`}
              value={formData.direccion} 
              onChange={handleChange}
              onBlur={() => validateField('direccion', formData.direccion)}
            />
            <ErrorMsg name="direccion" />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CP *</label>
            <Input 
              name="codigoPostal"
              className={`rounded-xl bg-slate-50 border-none h-10 px-4 text-sm transition-all ${errors.codigoPostal ? 'ring-1 ring-red-500 bg-red-50/30' : ''}`}
              value={formData.codigoPostal} 
              onChange={handleChange}
              onBlur={() => validateField('codigoPostal', formData.codigoPostal)}
            />
            <ErrorMsg name="codigoPostal" />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Municipio *</label>
            <Input 
              name="municipio"
              className={`rounded-xl bg-slate-50 border-none h-10 px-4 text-sm transition-all ${errors.municipio ? 'ring-1 ring-red-500 bg-red-50/30' : ''}`}
              value={formData.municipio} 
              onChange={handleChange}
              onBlur={() => validateField('municipio', formData.municipio)}
            />
            <ErrorMsg name="municipio" />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Provincia *</label>
            <Input 
              name="provincia"
              className={`rounded-xl bg-slate-50 border-none h-10 px-4 text-sm transition-all ${errors.provincia ? 'ring-1 ring-red-500 bg-red-50/30' : ''}`}
              value={formData.provincia} 
              onChange={handleChange}
              onBlur={() => validateField('provincia', formData.provincia)}
            />
            <ErrorMsg name="provincia" />
          </div>

          <div className="md:col-span-6 border-t border-slate-100 pt-5 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-400 uppercase ml-1">Email de Acceso *</label>
              <Input 
                name="email"
                type="email" 
                className={`rounded-xl bg-blue-50/30 border-none h-10 px-4 text-sm transition-all ${errors.email ? 'ring-1 ring-red-500' : ''}`}
                value={formData.email} 
                onChange={handleChange}
                onBlur={() => validateField('email', formData.email)}
              />
              <ErrorMsg name="email" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-400 uppercase ml-1">Contraseña *</label>
              <div className="relative w-full flex items-center">
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  className={`w-full rounded-xl bg-blue-50/30 border-none h-10 pl-4 pr-12 text-sm transition-all text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.password ? 'ring-1 ring-red-500' : ''}`}
                  value={formData.password} 
                  onChange={handleChange}
                  onBlur={() => validateField('password', formData.password)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none flex items-center justify-center"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <ErrorMsg name="password" />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="md:col-span-6 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl mt-4 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {loading ? "Creando empresa..." : "Finalizar Registro"}
          </Button>

          <div className="md:col-span-6 text-center pt-2">
            <Link to="/login" className="text-[11px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-tight">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;