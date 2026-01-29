import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Clock, ChefHat, Star, Flame, Trophy, ChevronDown, Heart, Trash2, Edit } from 'lucide-react';
import FilterBar from './FilterBar';

// --- COMPONENTE TARJETA INDIVIDUAL ---
const RecipeCard = ({ recipe, isInitiallySaved, isTop = false, index, onDeleteSuccess }) => {
  const navigate = useNavigate();
  const rating = recipe.averageRating || recipe.AverageRating || 0;

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    setIsSaved(isInitiallySaved);
  }, [isInitiallySaved]);

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    if (!token) return navigate('/login');
    if (loadingAction) return;
    setLoadingAction(true);
    try {
        if (isSaved) {
            await api.delete(`/saved-recipes/${recipe.id}`);
            setIsSaved(false);
        } else {
            await api.post('/saved-recipes', { recipeId: recipe.id });
            setIsSaved(true);
        }
    } catch (error) { console.error(error); }
    finally { setLoadingAction(false); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`¿Seguro que quieres eliminar "${recipe.title}"?`)) return;
    try {
        await api.delete(`/recipes/${recipe.id}`);
        if (onDeleteSuccess) onDeleteSuccess(recipe.id);
    } catch (error) { alert("Error al eliminar"); }
  };

  return (
    <div 
        onClick={() => navigate(`/recipes/${recipe.id}`)}
        className={`bg-zinc-900 border ${isTop ? 'border-yellow-500/30' : 'border-zinc-800'} rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer group shadow-lg flex flex-col relative`}
    >
        {/* ✅ LA COPITA DE RANKING (Solo en Favoritas) */}
        {isTop && (
            <div className="absolute top-0 left-0 bg-yellow-500 text-black font-black px-3 py-1.5 rounded-br-xl z-20 flex items-center gap-1 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                <Trophy className="w-4 h-4 fill-black" />
                <span className="text-sm">{index + 1}</span>
            </div>
        )}

        <div className="h-48 md:h-56 bg-zinc-800 relative overflow-hidden flex items-center justify-center">
            {recipe.image ? (
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            ) : (
                <Flame className="w-12 h-12 text-zinc-700" />
            )}
            
            {/* BOTONES DE ACCIÓN (ADMIN O USER) */}
            <div className="absolute top-3 right-3 z-30 flex gap-2">
                {isAdmin ? (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-recipe/${recipe.id}`); }} className="p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={handleDelete} className="p-2 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </>
                ) : (
                    token && (
                        <button onClick={handleToggleSave} disabled={loadingAction} className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all">
                            <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </button>
                    )
                )}
            </div>
            
            <div className="absolute bottom-3 left-3 z-10 flex gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/5">
                    <Clock className="w-3 h-3 text-orange-400" /> {recipe.totalTime} min
                </span>
                <span className="bg-black/60 backdrop-blur-md text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/5">
                    <Star className="w-3 h-3 fill-current" /> {rating > 0 ? Number(rating).toFixed(1) : 'Nuevo'}
                </span>
            </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
                <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-orange-400 transition">{recipe.title}</h3>
                <div className="flex items-center gap-2">
                    <span className={`capitalize px-2 py-0.5 rounded-md text-[10px] font-black tracking-tighter border ${
                        recipe.dificultyLevel === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        recipe.dificultyLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {recipe.dificultyLevel === 'easy' ? 'Fácil' : recipe.dificultyLevel === 'medium' ? 'Media' : 'Difícil'}
                    </span>
                    <span className="text-zinc-600 text-[10px] font-bold truncate">Por {recipe.userName || 'Chef'}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL HOME ---
const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [topRecipes, setTopRecipes] = useState([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
  const [filters, setFilters] = useState({ tags: '', difficulty: '', time: 180 });
  const [visibleCount, setVisibleCount] = useState(9);

  const fetchData = async () => {
    try {
      const [res, topRes] = await Promise.all([
        api.get('/recipes'),
        api.get('/recipes/top')
      ]);
      setRecipes(res.data);
      setTopRecipes(topRes.data || []);

      const token = localStorage.getItem('token');
      if (token) {
          const savedRes = await api.get('/saved-recipes');
          const ids = new Set(savedRes.data.map(r => r.id));
          setSavedRecipeIds(ids);
      }
    } catch (err) { console.error("Error fetching data:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteFromUI = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setTopRecipes(prev => prev.filter(r => r.id !== id));
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (recipe.visibility !== 'public') return false; 
    if (recipe.totalTime > filters.time) return false;
    if (filters.difficulty && recipe.dificultyLevel !== filters.difficulty) return false;
    if (filters.tags && (!recipe.tags || !recipe.tags.includes(filters.tags))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-10">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden mb-12 bg-zinc-900 border-b border-zinc-800">
        <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1920&auto=format&fit=crop" alt="Fondo" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter italic">
                BURNED <Flame className="inline text-orange-500 w-10 h-10 md:w-16 md:h-16 mb-2 animate-pulse" />
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-md">La comunidad de cocina donde el fuego nunca se apaga.</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4">
        {/* FAVORITAS (CON COPITAS) */}
        {topRecipes.length > 0 && (
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                        <Trophy className="text-yellow-500 w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Favoritas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {topRecipes.slice(0, 3).map((recipe, index) => (
                        <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            isTop={true} 
                            index={index}
                            onDeleteSuccess={handleDeleteFromUI}
                            isInitiallySaved={savedRecipeIds.has(recipe.id)} 
                        />
                    ))}
                </div>
            </section>
        )}

        <div className="mb-12">
             <FilterBar filters={filters} onFilterChange={setFilters} onClear={() => setFilters({ tags: '', difficulty: '', time: 180 })} />
        </div>

        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase italic">
                    <ChefHat className="text-orange-500 w-6 h-6" /> Descubre más
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.slice(0, visibleCount).map((recipe) => (
                    <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onDeleteSuccess={handleDeleteFromUI}
                        isInitiallySaved={savedRecipeIds.has(recipe.id)} 
                    />
                ))}
            </div>
            
            {visibleCount < filteredRecipes.length && (
                <div className="flex justify-center mt-16 pb-12">
                    <button onClick={() => setVisibleCount(prev => prev + 9)} className="bg-zinc-900 hover:bg-zinc-800 text-white font-black py-4 px-10 rounded-2xl border border-zinc-800 transition-all hover:border-orange-500/50 shadow-xl flex items-center gap-3 uppercase text-xs tracking-widest">
                        <ChevronDown className="w-4 h-4" /> Cargar más recetas
                    </button>
                </div>
            )}
        </section>
      </main>
    </div>
  );
};

export default Home;