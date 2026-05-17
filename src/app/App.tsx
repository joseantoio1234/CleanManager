import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from '../pages/Landing'; 
import Login from '../components/forms/LoginForm';
import Register from '../components/forms/RegisterForm';
import Dashboard from '../pages/Dashboard'; 
import NuevoPedido from '../pages/NuevoPedido';
import Perfil from '../pages/Perfil'; 
import Clientes from '../pages/Clientes';
import DetalleCliente from '../pages/DetalleCliente';
import Factura from '../pages/Factura'; // Importamos la nueva vista de facturación fiscal
import { Navbar } from '../components/common/Navbar';
import { NavbarPrivate } from '../components/common/NavbarPrivate';
import { Footer } from '../components/common/Footer';

import '../styles/index.css';

function AppContent() {
  const location = useLocation();
  
  // Sincronizamos todas las rutas de gestión para que rendericen el Navbar privado
  const isPrivateRoute = [
    '/dashboard', 
    '/nuevo-pedido', 
    '/perfil', 
    '/clientes'
  ].includes(location.pathname) || 
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

          {/* Nueva Ruta para la Factura Simplificada */}
          <Route path="/factura/:id_pedido" element={
            <div className="py-10">
              <Factura />
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