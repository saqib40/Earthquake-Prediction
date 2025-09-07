import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Helper Components & Icons ---

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChevronDownIcon = ({ expanded }: { expanded: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
         className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

// --- Updated Data Structures to match backend/DB schema ---
interface PredictionEntry {
  _id: string;
  input: {
    latitude: number;
    longitude: number;
    depth: number;
    stations: number;
  };
  classification: Record<string, string>;
  regression: Record<string, number>;
  createdAt: string; // Comes as an ISO string from the DB
}

// --- Helper Function to Style Magnitude Category ---
const getCategoryChipClass = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'very_high': return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
}

// --- Main Dashboard Component ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<PredictionEntry[]>([]);
  const [username, setUsername] = useState<string>('User');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('myToken');
      // The ProtectedRoute handles cases where the token is missing initially,
      // but we still need to send it for API calls.

      try {
        const response = await fetch('http://localhost:8000/v1/predictions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          // Token is invalid or expired, log the user out
          localStorage.removeItem('myToken');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch prediction data.");
        }
        
        const result = await response.json();
        if (result.success) {
          // Reverse the array to show the most recent predictions first
          setData(result.data.dataArray.reverse()); 
          setUsername(result.data.username);
        } else {
          throw new Error(result.message);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);


  const handleNewPrediction = () => navigate('/predict');
  const handleLogout = () => {
    localStorage.removeItem('myToken');
    navigate('/login');
  };
  
  const toggleCardDetails = (id: string) => {
      setExpandedCards(prev => {
        const isCurrentlyOpen = !!prev[id];
        return isCurrentlyOpen ? {} : { [id]: true };
      });
  }

  // Render a loading state while fetching data
  if (loading) {
    return <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">Loading Dashboard...</div>
  }
  
  // Render an error message if the fetch fails
  if (error) {
     return <div className="bg-gray-900 min-h-screen flex items-center justify-center text-red-400 p-8 text-center">{error}</div>
  }

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {username}</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button 
              onClick={handleNewPrediction}
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
            >
              New Prediction
            </button>
            <button 
              onClick={handleLogout}
              className="bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
            >
              Log Out
            </button>
          </div>
        </header>
        
        {/* Prediction Cards Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {data.length > 0 ? data.map((item, index) => (
            <div key={item._id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden flex flex-col">
              
              <div className="p-5 border-b border-gray-700/50">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Prediction #{data.length - index}</h3>
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                    <LocationIcon />
                    <span>{item.input.latitude.toFixed(2)}, {item.input.longitude.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-5 flex-grow">
                  <div className="text-center mb-4">
                      <p className="text-gray-400 text-sm mb-1">Predicted Magnitude</p>
                      <p className="text-5xl font-bold text-white">{item.regression["Voting Regressor"]?.toFixed(2) || 'N/A'}</p>
                      <p className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-2 border ${getCategoryChipClass(item.classification["Voting Classifier"])}`}>
                        {item.classification["Voting Classifier"] || 'Unknown'} Risk
                      </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div><p className="text-gray-400">Depth</p><p className="font-semibold text-white">{item.input.depth} km</p></div>
                      <div><p className="text-gray-400">Stations</p><p className="font-semibold text-white">{item.input.stations}</p></div>
                  </div>
              </div>

              <div className="border-t border-gray-700/50">
                <button onClick={() => toggleCardDetails(item._id)} className="w-full flex justify-between items-center p-3 text-sm font-semibold text-gray-400 hover:bg-gray-700/40 transition-colors">
                    <span>Model Breakdown</span>
                    <ChevronDownIcon expanded={!!expandedCards[item._id]} />
                </button>
                {expandedCards[item._id] && (
                    <div className="p-5 bg-gray-900/50 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                        <div>
                            <h4 className="font-bold mb-2 text-white">Regression Models</h4>
                            <ul className="space-y-1.5">{Object.entries(item.regression).map(([model, value]) => (<li key={model} className="flex justify-between"><span className="text-gray-400">{model}</span><span className="font-mono font-semibold text-white">{value.toFixed(3)}</span></li>))}</ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-2 text-white">Classification Models</h4>
                            <ul className="space-y-1.5">{Object.entries(item.classification).map(([model, value]) => (<li key={model} className="flex justify-between"><span className="text-gray-400">{model}</span><span className={`font-semibold ${getCategoryChipClass(value).split(' ')[1]}`}>{value}</span></li>))}</ul>
                        </div>
                    </div>
                )}
              </div>
            </div>
          )) : (
            // This view is shown if the user has no predictions
            <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <h3 className="text-xl font-semibold text-white">No Predictions Yet</h3>
              <p className="text-gray-400 mt-2">Click the button below to make your first prediction!</p>
              <button onClick={handleNewPrediction} className="mt-6 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-500 transition-colors">
                Make a Prediction
              </button>
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 py-4">
            <p className="text-gray-500 text-sm">Earthquake Prediction Dashboard</p>
        </footer>
      </div>
    </div>
  );
}

