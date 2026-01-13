import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, PlusSquare, LogOut, Home } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Borramos el token para cerrar sesión
    localStorage.removeItem('token');
    // Redirigimos al usuario al login
    navigate('/login');
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre (Link al Home) */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-orange-600/10 p-2 rounded-full group-hover:bg-orange-600/20 transition">
              <Flame className="text-orange-500 w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Burned</span>
          </Link>

          {/* Menú de Navegación */}
          <div className="flex items-center gap-4">
            
            {/* Botón Inicio */}
            <Link to="/" className="text-zinc-400 hover:text-white p-2 transition flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            
            {/* Botón Crear Receta (Destacado) */}
            <Link to="/create-recipe" className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 shadow-lg shadow-orange-900/20">
              <PlusSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Nueva Receta</span>
            </Link>

            {/* Separador vertical */}
            <div className="h-6 w-px bg-zinc-800 mx-2"></div>

            {/* Botón Logout */}
            <button 
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-500 p-2 transition group"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;