import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoadingSpinner = () => ( <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );

export default function PredictLSTM() {
  const [depth, setDepth] = useState('');
  const [futureSteps, setFutureSteps] = useState('5'); // Default to 5
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!depth || !futureSteps) {
      setError('Please fill in all fields.');
      return;
    }

    const inputData = { 
        depth: parseFloat(depth),
        future_steps: parseInt(futureSteps, 10)
    };
    
    if (isNaN(inputData.depth) || isNaN(inputData.future_steps)) {
        setError('Please ensure all inputs are valid numbers.');
        return;
    }
    if (inputData.future_steps <= 0) {
        setError('Future steps must be a positive number.');
        return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('myToken');
      // Use the correct backend endpoint
      const response = await fetch('http://localhost:8000/v1/predict-lstm', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inputData), 
      });

      if (response.status === 401) {
          localStorage.removeItem('myToken');
          navigate('/login');
          return;
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Prediction failed. Status: ${response.status}`);
      }

      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-gray-200 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">LSTM Magnitude Forecast</h1>
            <p className="text-gray-400 mt-2">Enter the expected depth and forecast steps.</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Depth Input */}
              <div>
                <label htmlFor="depth" className="block text-sm font-medium text-gray-300 mb-1">Depth (km)</label>
                <input
                  type="number"
                  step="any"
                  id="depth"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  placeholder="e.g., 20.0"
                  required
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              {/* Future Steps Input */}
              <div>
                <label htmlFor="futureSteps" className="block text-sm font-medium text-gray-300 mb-1">Forecast Steps</label>
                <input
                  type="number"
                  id="futureSteps"
                  value={futureSteps}
                  onChange={(e) => setFutureSteps(e.target.value)}
                  placeholder="e.g., 5"
                  required
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-teal-500 transition-colors duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 disabled:bg-teal-800 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner /> : 'Forecast Magnitudes'}
            </button>
            {error && <p className="text-sm text-center text-red-400 pt-2">{error}</p>}
            <Link to="/dashboard" className="block text-center text-sm text-gray-400 hover:text-white pt-2 transition">
              &larr; Back to Dashboard
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

