import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import all of your page components with file extensions
import LandingPage from './pages/landing.tsx';
import Login from './pages/login.tsx';
import Signup from './pages/signup.tsx';
import Dashboard from './pages/dashboard.tsx';
import Predict from './pages/predict.tsx';

/**
 * A wrapper component that protects routes requiring authentication.
 * It checks for a JWT in localStorage. If it exists, it renders the child component.
 * If not, it redirects the user to the login page.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('myToken');
  
  if (!token) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- Protected Routes --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/predict" 
          element={
            <ProtectedRoute>
              <Predict />
            </ProtectedRoute>
          } 
        />
        
        {/* --- Fallback Route --- */}
        {/* If a user tries to access any other path, redirect them to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

