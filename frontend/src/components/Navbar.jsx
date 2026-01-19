import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Flame, PlusSquare, LogOut, Home, User, LogIn, Search, Clock, BookOpen } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  
  const wrapperRef = useRef(null); 

  // Token para verificar login
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Limpiamos user también
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  // --- LÓGICA DE AUTOCOMPLETADO (DEBOUNCE) ---
  useEffect(() => {
    if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
    }

    const delayDebounceFn = setTimeout(async () => {
        try {
            const res = await api.get(`/recipes/search?q=${searchTerm}`);
            setSuggestions(res.data || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching suggestions", error);
        }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Cerrar sugerencias si hago clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        setShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-orange-600/10 p-2 rounded-full group-hover:bg-orange-600/20 transition">
              <Flame className="text-orange-500 w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Burned</span>
          </Link>

          {/* --- BARRA DE BÚSQUEDA INTELIGENTE --- */}
          <div ref={wrapperRef} className="hidden md:flex flex-col relative w-full max-w-md mx-8">
            
            <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Buscar recetas (ej: Pizza)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:border-orange-500 transition-all text-sm placeholder-zinc-600 focus:bg-zinc-900"
                />
            </form>

            {/* DROPDOWN DE SUGERENCIAS */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <ul className="max-h-64 overflow-y-auto">
                        {suggestions.map((recipe) => (
                            <li key={recipe.id}>
                                <button
                                    onClick={() => {
                                        navigate(`/recipes/${recipe.id}`);
                                        setShowSuggestions(false);
                                        setSearchTerm(''); 
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition flex items-center gap-3 group border-b border-zinc-800/50 last:border-0"
                                >
                                    <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                                        <img 
                                            src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-medium truncate group-hover:text-orange-400 transition">
                                            {recipe.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <Clock className="w-3 h-3" /> {recipe.totalTime} min
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="p-2 bg-zinc-950/50 border-t border-zinc-800">
                        <button 
                            onClick={handleSearchSubmit}
                            className="w-full text-center text-xs text-orange-500 hover:text-orange-400 py-1 font-medium"
                        >
                            Ver todos los resultados para "{searchTerm}"
                        </button>
                    </div>
                </div>
            )}
          </div>

          {/* BOTONES (Derecha) */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/" className="text-zinc-400 hover:text-white p-2 transition flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span className="hidden lg:inline">Explorar</span>
            </Link>
            
            {token ? (
              <>
                <Link to="/my-recipes" className="text-zinc-400 hover:text-orange-400 p-2 transition flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="hidden lg:inline">Mis Recetas</span>
                </Link>

                <Link to="/profile" className="text-zinc-400 hover:text-orange-400 p-2 transition flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline">Mi Perfil</span>
                </Link>

                <Link to="/create-recipe" className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 shadow-lg shadow-orange-900/20">
                  <PlusSquare className="w-5 h-5" />
                  <span className="hidden sm:inline">Crear</span>
                </Link>
                
                <div className="h-6 w-px bg-zinc-800 mx-2"></div>
                
                <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 p-2 transition" title="Cerrar Sesión">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;