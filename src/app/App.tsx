import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from '../pages/Landing'; 
import Login from '../components/forms/LoginForm';
import Register from '../components/forms/RegisterForm';
import Dashboard from '../pages/Dashboard'; 
import NuevoPedido from '../pages/NuevoPedido';
import Perfil from '../pages/Perfil'; 
import Clientes from '../pages/Clientes';
import DetalleCliente from '../pages/DetalleCliente';
import Factura from '../pages/Factura'; 
import Inicio from '../pages/Inicio'; 
import Prendas from '../pages/Prendas'; 
import NuevaPrenda from '../components/forms/NuevaPrenda'; 
import Cobros from '../pages/Cobros'; // Importamos la nueva vista de caja y gráfico de cobros
import { Navbar } from '../components/common/Navbar';
import { NavbarPrivate } from '../components/common/NavbarPrivate';
import { Footer } from '../components/common/Footer';

import '../styles/index.css';

function AppContent() {
  const location = useLocation();

  // Sincronizamos todas las rutas de gestión incluyendo el maestro de caja operativo
  const isPrivateRoute = [
    '/inicio',
    '/dashboard',
    '/nuevo-pedido',
    '/perfil',
    '/clientes',
    '/prendas',
    '/cobros' // Añadido para heredar el Navbar privado del mostrador
  ].includes(location.pathname) ||
    location.pathname.startsWith('/prendas/nueva') ||
    location.pathname.startsWith('/clientes/detalle/') ||
    location.pathname.startsWith('/factura/');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

      {/* Renderizado Condicional del Navbar según la ruta actual */}
      {isPrivateRoute ? <NavbarPrivate /> : <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* ==========================================
              RUTAS PÚBLICAS
             ========================================== */}
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={
            <div className="flex items-center justify-center py-20 px-4">
              <Login />
            </div>
          } />

          <Route path="/register" element={
            <div className="flex items-center justify-center py-20 px-4">
              <Register />
            </div>
          } />

          {/* ==========================================
              RUTAS DE GESTIÓN (PRIVADAS)
             ========================================== */}
          {/* Ruta de Inicio / Hub Central */}
          <Route path="/inicio" element={
            <div className="py-10">
              <Inicio />
            </div>
          } />

          <Route path="/dashboard" element={
            <div className="py-10">
              <Dashboard />
            </div>
          } />

          <Route path="/nuevo-pedido" element={
            <div className="py-10">
              <NuevoPedido />
            </div>
          } />

          <Route path="/perfil" element={
            <div className="py-10">
              <Perfil />
            </div>
          } />

          <Route path="/clientes" element={
            <div className="py-10">
              <Clientes />
            </div>
          } />

          <Route path="/clientes/detalle/:nombre" element={
            <div className="py-10">
              <DetalleCliente />
            </div>
          } />

          <Route path="/factura/:id_pedido" element={
            <div className="py-10">
              <Factura />
            </div>
          } />

          <Route path="/prendas" element={
            <div className="py-10">
              <Prendas />
            </div>
          } />

          <Route path="/prendas/nueva" element={
            <div className="py-10">
              <NuevaPrenda />
            </div>
          } />

          {/* Nueva ruta añadida para el módulo operativo de Caja y Cobros */}
          <Route path="/cobros" element={
            <div className="py-10">
              <Cobros />
            </div>
          } />

          {/* Redirección por defecto para rutas inexistentes */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;