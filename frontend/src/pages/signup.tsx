import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- Helper Components & Icons ---

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UserPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-indigo-400">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="16" y1="11" y2="11"/><line x1="19" x2="19" y1="8" y2="14"/>
    </svg>
);


// --- Main Signup Component ---

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);

    try {
      // NOTE: Update this URL to your actual signup endpoint
      const response = await fetch('http://localhost:8000/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Use the error message from the API, or a default one
        throw new Error(responseData.message || 'Failed to create account.');
      }

      // On successful signup, navigate to the login page
      navigate('/login');

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
            <UserPlusIcon />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-gray-400 mb-8">Join to start making predictions.</p>
          
          <form noValidate autoComplete="off" onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

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
              <label htmlFor="password"  className="block text-sm font-medium text-gray-300 mb-1">Password</label>
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
              {loading ? <LoadingSpinner /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-indigo-400 transition">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

