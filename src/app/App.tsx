import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from '../pages/Landing'; 
import Login from '../components/forms/LoginForm';
import Register from '../components/forms/RegisterForm';
import Dashboard from '../pages/Dashboard'; 
import NuevoPedido from '../pages/NuevoPedido';
import Perfil from '../pages/Perfil'; // Importamos la nueva vista de perfil
import { Navbar } from '../components/common/Navbar';
import { NavbarPrivate } from '../components/common/NavbarPrivate';
import { Footer } from '../components/common/Footer';

import '../styles/index.css';
import Clientes from '../pages/Clientes';
import DetalleCliente from '../pages/DetalleCliente';

function AppContent() {
  const location = useLocation();
  
  // Agregamos '/perfil' a la lista de rutas que usan el Navbar de gestión
  const isPrivateRoute = ['/dashboard', '/nuevo-pedido', '/perfil'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* Renderizado Condicional del Navbar según la ruta actual */}
      {isPrivateRoute ? <NavbarPrivate /> : <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Rutas Públicas */}
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
          
          {/* Rutas de Gestión (Privadas) */}
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

          {/* Nueva Ruta de Perfil */}
          <Route path="/perfil" element={
            <div className="py-10">
              <Perfil />
            </div>
          } />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
          
          <Route path="/clientes" element={<Clientes />} />

          <Route path="/clientes/detalle/:nombre" element={<DetalleCliente />} />

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