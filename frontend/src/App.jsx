import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import CreateRecipe from './components/CreateRecipe';
import RecipeDetail from './components/RecipeDetail';
import MyRecipes from './components/MyRecipes';
import Navbar from './components/Navbar';
import EditRecipe from './components/EditRecipe';
import Profile from './components/Profile';

const PrivateLayout = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      {children}
    </div>
  );
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      {children}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login es independiente */}
        <Route path="/login" element={<Login />} />
        
        {/* --- ZONA PÚBLICA --- */}
        <Route path="/" element={
          <PublicLayout> 
            <Home /> 
          </PublicLayout>
        } />
        
        <Route path="/recipes/:id" element={ 
          <PublicLayout>
            <RecipeDetail />
          </PublicLayout>
        } />
        
        {/* --- ZONA PRIVADA --- */}
        <Route path="/create-recipe" element={
          <PrivateLayout>
            <CreateRecipe />
          </PrivateLayout>
        } />

        <Route path="/profile" element={
            <PrivateLayout> {/* CORREGIDO: Usamos PrivateLayout aquí también */}
                <Profile />
            </PrivateLayout>
        } />

        <Route path="/my-recipes" element={ 
          <PrivateLayout>
            <MyRecipes />
          </PrivateLayout>
        } />
        
        <Route path="/edit-recipe/:id" element={ 
          <PrivateLayout>
            <EditRecipe />
          </PrivateLayout>
        } />

        {/* Cualquier ruta desconocida va al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;