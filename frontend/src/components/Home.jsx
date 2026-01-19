import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Clock, ChefHat, Star, Flame, Trophy } from 'lucide-react';
import FilterBar from './FilterBar';

// --- COMPONENTE TARJETA INDIVIDUAL (Se encarga de buscar su propio Rating) ---
const RecipeCard = ({ recipe, isTop = false, index }) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Buscamos el rating específico usando el endpoint que sabemos que funciona
    const fetchRating = async () => {
      try {
        const res = await api.post(`/get-rate/${recipe.id}`);
        // Tu backend devuelve { Avg: 4.5 } (Mayúscula)
        if (res.data && res.data.Avg !== undefined) {
          setRating(res.data.Avg);
        } else if (res.data && res.data.avg !== undefined) {
          setRating(res.data.avg);
        }
      } catch (error) {
        // Si falla, asumimos 0 o mantenemos el que venía en la receta
        console.error(`Error rating recipe ${recipe.id}`, error);
      }
    };

    fetchRating();
  }, [recipe.id]);

  return (
    <div 
        onClick={() => navigate(`/recipes/${recipe.id}`)}
        className={`bg-zinc-900 border ${isTop ? 'border-yellow-500/20 shadow-yellow-900/10' : 'border-zinc-800'} rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer group shadow-lg hover:-translate-y-1 flex flex-col relative`}
    >
        {isTop && (
            <div className="absolute top-0 left-0 bg-yellow-500 text-black font-bold px-3 py-1 rounded-br-lg z-20">
                #{index + 1}
            </div>
        )}

        <div className="h-48 md:h-56 bg-zinc-800 relative overflow-hidden flex items-center justify-center">
            {recipe.image ? (
                <>
                    <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                </>
            ) : (
                <Flame className="w-16 h-16 text-zinc-700/50" />
            )}
            
            <div className="absolute bottom-3 left-3 z-10 flex gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-400" /> {recipe.totalTime} min
                </span>
                
                {/* RATING CALCULADO DESDE EL ENDPOINT */}
                <span className="bg-black/60 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> 
                    {rating > 0 ? Number(rating).toFixed(1) : 'New'}
                </span>
            </div>
        </div>

        <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 truncate group-hover:text-orange-500 transition">{recipe.title}</h3>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.tags && recipe.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-zinc-400 text-sm border-t border-zinc-800 pt-3">
                    <span className={`capitalize px-2 py-0.5 rounded-md text-xs font-bold ${
                        recipe.dificultyLevel === 'easy' ? 'bg-green-900/30 text-green-400' : 
                        recipe.dificultyLevel === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 
                        'bg-red-900/30 text-red-400'
                    }`}>
                        {recipe.dificultyLevel === 'easy' ? 'Fácil' : recipe.dificultyLevel === 'medium' ? 'Media' : 'Difícil'}
                    </span>
                </div>
            </div>
            
            {/* Descripción corta solo para Top Recipes */}
            {isTop && (
                <p className="text-zinc-500 text-xs mt-2 line-clamp-2">{recipe.description}</p>
            )}
        </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL HOME ---
const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [topRecipes, setTopRecipes] = useState([]);
  
  // Filtros
  const [filters, setFilters] = useState({ tags: '', difficulty: '', time: 180 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/recipes');
        setRecipes(res.data);
        const topRes = await api.get('/recipes/top');
        setTopRecipes(topRes.data || []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    };
    fetchData();
  }, []);

  // Lógica de Filtrado Local
  const filteredRecipes = recipes.filter((recipe) => {
    if (recipe.totalTime > filters.time) return false;
    if (filters.difficulty && recipe.dificultyLevel !== filters.difficulty) return false;
    if (filters.tags) {
        if (!recipe.tags || recipe.tags.length === 0) return false;
        if (!recipe.tags.includes(filters.tags)) return false;
    }
    return true;
  });

  const handleClearFilters = () => setFilters({ tags: '', difficulty: '', time: 180 });

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-10">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden mb-12 bg-zinc-900">
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1920&auto=format&fit=crop" 
                alt="Fondo de cocina" 
                className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 animate-in fade-in zoom-in-95 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight drop-shadow-lg">
                Burned <Flame className="inline text-orange-500 w-8 h-8 md:w-12 md:h-12 mb-2" />
            </h1>
            <p className="text-xl text-zinc-200 drop-shadow-md">La comunidad de cocina más ardiente.</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4">
        
        {/* 2. TOP RECETAS */}
        {topRecipes.length > 0 && (
            <section className="mb-16">
                <div className="flex items-center gap-2 mb-6">
                    <Trophy className="text-yellow-500 w-6 h-6" />
                    <h2 className="text-3xl font-bold text-white">Las Más Populares</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topRecipes.slice(0, 3).map((recipe, index) => (
                        <RecipeCard key={recipe.id} recipe={recipe} isTop={true} index={index} />
                    ))}
                </div>
            </section>
        )}

        {/* 3. BARRA DE FILTROS */}
        <div className="mb-8">
             <FilterBar 
                filters={filters} 
                onFilterChange={setFilters} 
                onClear={handleClearFilters}
             />
        </div>

        {/* 4. LISTA DE RECETAS */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ChefHat className="text-orange-500" /> Descubre más
                </h2>
                <span className="text-zinc-500 text-sm">
                    Mostrando {filteredRecipes.length} recetas
                </span>
            </div>

            {filteredRecipes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
                    <p className="text-zinc-500">No hay recetas que coincidan con estos filtros.</p>
                    <button onClick={handleClearFilters} className="text-orange-500 font-bold mt-2 hover:underline">
                        Limpiar filtros
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </section>

      </main>
    </div>
  );
};

export default Home;