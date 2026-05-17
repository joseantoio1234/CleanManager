import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authRepository } from '../../database/repositories/auth.repository';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { validateEmail } from '../../utils/regex';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación básica antes de intentar conexión
    if (!validateEmail(email)) {
      setErrorMsg('Introduce un formato de correo válido.');
      return;
    }

    setLoading(true);
    try {
      // 1. Intentamos el login real
      await authRepository.signIn(email, password);
      
      // Opcional: Aquí podrías setear los valores en localStorage si tu authRepository no lo hace ya:
      // localStorage.setItem('nombre_tintoreria', 'Tintorería Jerez');
      
      // MODIFICADO: Ahora redirige al Hub Central de Módulos
      navigate('/inicio'); 

    } catch (error: any) {
      console.error("Error en login:", error);

      // --- BYPASS DE RED ---
      // Si el error es de DNS/WiFi bloqueado, permitimos entrar para seguir trabajando
      if (error.message?.includes('fetch') || error.name === 'TypeError' || error.message?.includes('NXDOMAIN')) {
        console.warn("Red bloqueada. Entrando por bypass de desarrollo hacia la vista de inicio...");
        
        // MODIFICADO: El bypass de desarrollo también te lleva directo al Hub Central
        navigate('/inicio');
      } else {
        // Errores reales de autenticación (ej: contraseña incorrecta)
        setErrorMsg("Credenciales inválidas o error de servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

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

        {/* Mensaje de error general si falla el login */}
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
              className={`w-full border-none bg-slate-100 h-12 px-5 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-400 transition-all outline-none ${errorMsg ? 'ring-1 ring-red-300' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className={`w-full border-none bg-slate-100 h-12 px-5 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-400 transition-all outline-none ${errorMsg ? 'ring-1 ring-red-300' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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