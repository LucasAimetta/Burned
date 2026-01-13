import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CreateRecipe from './components/CreateRecipe'; // Asumiendo que crearás este componente o un Home

// Componente para proteger rutas que requieren login
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Ruta protegida: Solo accesible si hay token */}
        <Route path="/" element={
          <PrivateRoute>
            {/* Aquí iría tu Dashboard o Home */}
            <div className="text-white text-center mt-10">
                <h1>¡Bienvenido al Dashboard de Burned! 🔥</h1>
                <p>Aquí verás tus recetas.</p>
            </div>
          </PrivateRoute>
        } />
        
        {/* Cualquier ruta desconocida redirige al login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;