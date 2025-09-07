import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- Helper Components & Icons ---

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Main Predict Component ---

export default function Predict() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [depth, setDepth] = useState('');
  const [stations, setStations] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Form Validation
    if (!latitude || !longitude || !depth || !stations) {
      setError('Please fill in all the fields.');
      return;
    }
    
    const inputData = { 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude), 
        depth: parseFloat(depth), 
        stations: parseInt(stations, 10) 
    };
    
    if (Object.values(inputData).some(isNaN)) {
        setError('Please ensure all inputs are valid numbers.');
        return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('myToken');
      // NOTE: Ensure this endpoint matches your running backend API
      const response = await fetch('http://localhost:8000/v1/predict', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(inputData),
      });

      // Handle auth errors by redirecting to login
      if (response.status === 401) {
          localStorage.removeItem('myToken');
          navigate('/login');
          return;
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `HTTP error! Status: ${response.status}`);
      }
      
      // --- THE KEY CHANGE IS HERE ---
      // On success, instead of showing the result, navigate to the dashboard.
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
            <h1 className="text-4xl font-bold text-white">New Prediction</h1>
            <p className="text-gray-400 mt-2">Enter the parameters below to calculate earthquake magnitude.</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-300 mb-1">Latitude</label>
                <input type="number" step="any" id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g., 34.05" 
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-300 mb-1">Longitude</label>
                <input type="number" step="any" id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g., -118.25" 
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                <label htmlFor="depth" className="block text-sm font-medium text-gray-300 mb-1">Depth (km)</label>
                <input type="number" step="any" id="depth" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g., 20.0" 
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
              </div>
              <div>
                <label htmlFor="stations" className="block text-sm font-medium text-gray-300 mb-1">Stations</label>
                <input type="number" id="stations" value={stations} onChange={(e) => setStations(e.target.value)} placeholder="e.g., 12" 
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
              </div>
            </div>

            <button type="submit" disabled={loading} 
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:bg-indigo-800 disabled:cursor-not-allowed">
              {loading ? <LoadingSpinner /> : 'Calculate and Save'}
            </button>
            
            {error && <p className="text-sm text-center text-red-400 pt-2">{error}</p>}
            
            <Link to="/dashboard" className="block text-center text-sm text-gray-400 hover:text-white pt-2 transition">&larr; Back to Dashboard</Link>
          </form>
        </div>
      </div>
    </div>
  );
}

