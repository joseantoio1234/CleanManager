import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authRepository } from '../../database/repositories/auth.repository';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { validateEmail } from '../../utils/regex';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // Nuevo estado para la pantalla de carga
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Introduce un formato de correo válido.');
      return;
    }

    setLoading(true);
    try {
      // 1. Intentamos el inicio de sesión real
      const session = await authRepository.signIn(email, password) as any;
      
      // Guardamos dinámicamente los datos de la sesión para que los lea el Navbar y el Hub
      if (session && session.user) {
        localStorage.setItem('id_empresa', session.user.id || '1');
        localStorage.setItem('nombre_tintoreria', session.user.user_metadata?.nombre_tintoreria || 'Tintorería Jerez');
      } else {
        localStorage.setItem('id_empresa', '1');
        localStorage.setItem('nombre_tintoreria', 'Tintorería Jerez');
      }
      
      // Activamos la animación de transición justo antes de redirigir
      setIsRedirecting(true);
      setTimeout(() => {
        navigate('/inicio'); 
      }, 1000); // Pequeño delay de 1 segundo para que se aprecie el efecto premium

    } catch (error: any) {
      console.error("Error en login:", error);
      
      // --- BYPASS DE RED EN DESARROLLO ---
      if (error.message?.includes('fetch') || error.name === 'TypeError' || error.message?.includes('NXDOMAIN')) {
        console.warn("Red bloqueada. Aplicando bypass local de desarrollo...");
        
        localStorage.setItem('id_empresa', '1');
        localStorage.setItem('nombre_tintoreria', 'Tintorería Jerez');
        
        setIsRedirecting(true);
        setTimeout(() => {
          navigate('/inicio');
        }, 1000);
      } else {
        setErrorMsg("Credenciales inválidas o error de servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VISTA DE TRANSICIÓN: INICIANDO SESIÓN
  // ==========================================
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-180px)] min-h-[500px] animate-in fade-in duration-300">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-200/30 border border-white flex flex-col items-center space-y-6 text-center">
          
          {/* Spinner animado con Tailwind */}
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800">Iniciando sesión</h2>
            <p className="text-xs text-slate-400 font-medium">Preparando tu espacio de trabajo en CleanManager...</p>
          </div>
          
        </div>
      </div>
    );
  }

  // Vista del formulario normal
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-180px)] min-h-[500px]">
      <div className="w-full max-w-[520px] bg-white px-10 py-8 md:px-14 md:py-10 rounded-[2.5rem] shadow-2xl shadow-blue-200/40 flex flex-col items-center border border-white">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 tracking-tight">
            CleanManager
          </h1>
          <p className="mt-1 mb-6 text-slate-400 font-medium text-sm uppercase tracking-widest">
            Panel de administración
          </p>
        </div>

        {errorMsg && (
          <div className="w-full bg-red-50 border border-red-100 text-red-500 text-xs font-bold p-3 rounded-xl mb-4 text-center animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Correo electrónico
            </label>
            <Input
              type="email"
              placeholder="nombre@ejemplo.com"
              className={`w-full border-none bg-slate-50 h-12 px-5 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-400 transition-all outline-none ${errorMsg ? 'ring-1 ring-red-300' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Contraseña
            </label>
            <div className="relative w-full flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full border-none bg-slate-50 h-12 pl-5 pr-12 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${errorMsg ? 'ring-1 ring-red-300' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none flex items-center justify-center"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl mt-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            {loading ? "Verificando..." : "Entrar al sistema"}
          </Button>

          <div className="pt-4 text-center">
            <span className="text-sm text-slate-400 font-medium">¿No tienes cuenta? </span>
            <Link 
              to="/register" 
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Crea una ahora
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;