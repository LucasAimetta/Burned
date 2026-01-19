import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Clock, ChefHat, ImageIcon, Tag, CheckCircle, X } from 'lucide-react';
import api from '../api/axios';

// Lista de tags sugeridos
const PREDEFINED_TAGS = [
  "Desayuno", "Almuerzo", "Cena", "Postre", 
  "Vegano", "Vegetariano", "Sin TACC", "Rápido", 
  "Saludable", "Pasta", "Carne", "Ensalada", "Picante"
];

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Estados separados para Tags
  const [tags, setTags] = useState([]); 
  const [customTagInput, setCustomTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    totalTime: 0,
    dificultyLevel: 'medium',
    image: '',
    // tags: '' // Ya no lo manejamos aquí como string, usamos el estado 'tags' de arriba
    ingredients: [{ name: '', quantity: 0 }],
    step: [{ title: '', descripcion: '', time: 0 }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'totalTime' ? parseInt(value) || 0 : value
    });
  };

  // --- LÓGICA DE TAGS ---

  // 1. Alternar selección de predefinidos
  const togglePredefinedTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // 2. Agregar tag manual
  const handleAddCustomTag = (e) => {
    e.preventDefault(); // Evita que el enter envíe el formulario principal
    const val = customTagInput.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setCustomTagInput('');
    }
  };

  // 3. Eliminar tag de la lista final
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // --- FIN LÓGICA TAGS ---

  // Manejo de Ingredientes
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = field === 'quantity' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { name: '', quantity: 0 }] });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  // Manejo de Pasos
  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.step];
    newSteps[index][field] = field === 'time' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, step: newSteps });
  };

  const addStep = () => {
    setFormData({ ...formData, step: [...formData.step, { title: '', descripcion: '', time: 0 }] });
  };

  const removeStep = (index) => {
    const newSteps = formData.step.filter((_, i) => i !== index);
    setFormData({ ...formData, step: newSteps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Preparar el payload
    const payload = {
      ...formData,
      totalTime: parseInt(formData.totalTime),
      tags: tags // Enviamos el array de tags directamente
    };

    try {
      await api.post('/recipes', payload); 
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error al crear la receta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-10 relative">
      <div className="flex justify-center p-6">
        <div className="max-w-4xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <ChefHat className="text-orange-500" /> Crear Nueva Receta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Título</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Ej: Pasta Carbonara"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Imagen (URL)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                  <input
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Describe tu deliciosa creación..."
                required
              />
            </div>

            {/* Detalles Técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Tiempo Total (mins)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                  <input
                    name="totalTime"
                    type="number"
                    value={formData.totalTime}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Dificultad</label>
                <select
                  name="dificultyLevel"
                  value={formData.dificultyLevel}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Visibilidad</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                >
                  <option value="public">Pública</option>
                  <option value="private">Privada</option>
                </select>
              </div>
            </div>

            {/* --- SECCIÓN TAGS ACTUALIZADA --- */}
            <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/50">
                <label className="block text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-500" /> Etiquetas / Categorías
                </label>
                
                {/* A. Tags Predeterminados */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {PREDEFINED_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => togglePredefinedTag(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition border ${
                                tags.includes(tag)
                                ? 'bg-orange-600 border-orange-600 text-white'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* B. Tag Personalizado */}
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text"
                        value={customTagInput}
                        onChange={e => setCustomTagInput(e.target.value)}
                        placeholder="Agregar otra etiqueta (ej: Desayuno)..."
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none placeholder-zinc-600"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag(e)}
                    />
                    <button 
                        type="button"
                        onClick={handleAddCustomTag}
                        className="bg-zinc-700 hover:bg-zinc-600 px-4 rounded-lg text-white font-medium transition"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* C. Visualización de Tags Seleccionados */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-700">
                        {tags.map(tag => (
                            <span key={tag} className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-sm flex items-center gap-1 animate-in fade-in zoom-in">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white ml-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Ingredientes Dinámicos */}
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-500">Ingredientes</h3>
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex gap-4 mb-3 items-end">
                  <div className="flex-1">
                    <input
                      placeholder="Nombre (ej: Harina)"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Cant."
                      value={ing.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-3 bg-red-900/30 text-red-500 rounded-lg hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="mt-2 flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition"
              >
                <Plus className="w-4 h-4" /> Agregar Ingrediente
              </button>
            </div>

            {/* Pasos Dinámicos */}
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-500">Pasos de Preparación</h3>
              {formData.step.map((step, index) => (
                <div key={index} className="bg-zinc-800/50 p-4 rounded-xl mb-4 border border-zinc-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-zinc-400 font-medium">Paso {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="md:col-span-2">
                      <input
                        placeholder="Título del paso (ej: Hervir agua)"
                        value={step.title}
                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Tiempo (min)"
                        value={step.time}
                        onChange={(e) => handleStepChange(index, 'time', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <textarea
                    placeholder="Descripción detallada..."
                    value={step.descripcion}
                    onChange={(e) => handleStepChange(index, 'descripcion', e.target.value)}
                    rows="2"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                </div>
              ))}
               <button
                type="button"
                onClick={addStep}
                className="mt-2 flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition"
              >
                <Plus className="w-4 h-4" /> Agregar Paso
              </button>
            </div>

            {/* Botón Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all flex justify-center items-center gap-2 text-lg disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Publicar Receta'} <Save className="w-5 h-5" />
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* --- MODAL DE ÉXITO --- */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-orange-500/30 p-8 rounded-2xl shadow-2xl shadow-orange-500/20 max-w-sm w-full text-center transform animate-in zoom-in-95 duration-300">
            <div className="mx-auto bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Receta Publicada!</h2>
            <p className="text-zinc-400 mb-6">Tu receta ya está disponible en el feed principal.</p>
            
            {/* Barra de progreso decorativa */}
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full animate-[shrink_2s_linear_forwards]" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateRecipe;