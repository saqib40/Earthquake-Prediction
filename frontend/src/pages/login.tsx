import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- Helper Components & Icons ---

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SeismographIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-indigo-400">
        <path d="M14 12H2"/><path d="M2 12l2-3 2 6 2-9 2 5h2"/><path d="m18 8 3 7 3-7"/>
    </svg>
);


// --- Main Login Component ---

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);

    try {
      // NOTE: Update this URL to your actual login endpoint
      const response = await fetch('http://localhost:8000/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Use the error message from the API, or a default one
        throw new Error(responseData.message || 'Invalid credentials. Please try again.');
      }

      // --- JWT Handling ---
      // On successful login, store the token and navigate
      if (responseData.token) {
        localStorage.setItem('myToken', responseData.token);
        navigate('/dashboard'); 
      } else {
        throw new Error('Login successful, but no token was provided.');
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm p-8 text-center">

          <div className="flex justify-center mb-6">
              <SeismographIcon />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8">Sign in to access your dashboard.</p>
          
          <form noValidate autoComplete="off" onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            
            {error && <p className="text-sm text-center text-red-400">{error}</p>}
            
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:bg-indigo-800 disabled:cursor-not-allowed">
              {loading ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/signup" className="text-sm text-gray-400 hover:text-indigo-400 transition">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

