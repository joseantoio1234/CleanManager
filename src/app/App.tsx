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
import Cobros from '../pages/Cobros'; 

// ==========================================
// 👑 IMPORTACIONES DE LA CARPETA ADMIN
// ==========================================
import InicioAdmin from '../pages/admin/InicioAdmin';
import TarifasAdmin from '../pages/admin/TarifasAdmin';
import EmpleadosAdmin from '../pages/admin/EmpleadosAdmin';
import ClientesAdmin from '../pages/admin/ClientesAdmin';
import FacturasAdmin from '../pages/admin/FacturasAdmin'; 

import { Navbar } from '../components/common/Navbar';
import { NavbarPrivate } from '../components/common/NavbarPrivate';
import { Footer } from '../components/common/Footer';

import '../styles/index.css';
import Servicios from '../pages/Servicios'; // 🚀 Importación Perfecta

function AppContent() {
  const location = useLocation();

  // Sincronizamos todas las rutas privadas de administración y mostrador
  const isPrivateRoute = [
    '/inicio',
    '/inicio-admin',
    '/dashboard',
    '/nuevo-pedido',
    '/perfil',
    '/clientes',
    '/prendas',
    '/admin-empleados',
    '/admin-clientes',
    '/admin-facturas', 
    '/cobros',
    '/servicios' // 🚀 Mantiene el Navbar privado en esta pantalla
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

          <Route path="/cobros" element={
            <div className="py-10">
              <Cobros />
            </div>
          } />

          {/* ==========================================
              👑 ENRUTADO DE MÓDULOS ADMINISTRATIVOS
             ========================================== */}
          <Route path="/inicio-admin" element={
            <div className="py-10">
              <InicioAdmin />
            </div>
          } />

          <Route path="/prendas" element={
            <div className="py-10">
              <TarifasAdmin />
            </div>
          } />

          <Route path="/admin-empleados" element={
            <div className="py-10">
              <EmpleadosAdmin />
            </div>
          } />

          <Route path="/admin-clientes" element={
            <div className="py-10">
              <ClientesAdmin />
            </div>
          } />

          <Route path="/admin-facturas" element={
            <div className="py-10">
              <FacturasAdmin />
            </div>
          } />

          {/* Estructura unificada con espaciado py-10 para el módulo de servicios */}
          <Route path="/servicios" element={
            <div className="py-10">
              <Servicios />
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

// ==========================================
// 🚀 PUNTO DE ENTRADA REPARADO SIN ENRUTADO RECURSIVO
// ==========================================
function App() {
  return (
    <Router>
      <AppContent /> {/* Cambiado de <App /> a <AppContent /> para disolver el bloqueo */}
    </Router>
  );
}

export default App;