import React, { useState } from 'react';
import { Plus, Trash2, Save, Clock, ChefHat, ImageIcon, Tag } from 'lucide-react';
import api from '../api/axios';
import Navbar from './Navbar'; // Asegúrate de tener este componente también, o comenta esta línea si aún no lo creas

const CreateRecipe = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    totalTime: 0,
    dificultyLevel: 'medium',
    image: '',
    tags: '', // Lo manejaremos como string separado por comas
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

  // Manejo de Ingredientes Dinámicos
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

  // Manejo de Pasos Dinámicos
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
    
    // Preparar el payload para el backend (convertir tipos si es necesario)
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      totalTime: parseInt(formData.totalTime),
    };

    try {
      // Endpoint POST /recipes
      await api.post('/recipes', payload); 
      alert('¡Receta creada con éxito! 🔥');
      // Opcional: Redirigir al home
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error al crear la receta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-10">
      {/* Si tienes el Navbar, úsalo aquí. Si no, borra esta línea <Navbar /> */}
      <Navbar /> 

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

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Tags (separados por coma)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="italiana, pasta, cena"
                />
              </div>
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
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all flex justify-center items-center gap-2 text-lg"
              >
                {loading ? 'Guardando...' : 'Publicar Receta'} <Save className="w-5 h-5" />
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipe;