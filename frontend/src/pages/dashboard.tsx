import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Helper Functions and Icons ---

const LocationIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"> <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /> <circle cx="12" cy="10" r="3" /> </svg> );
const ChevronDownIcon = ({ expanded }: { expanded: boolean }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}> <polyline points="6 9 12 15 18 9"></polyline> </svg> );
const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="7 10 12 15 17 10" /> <line x1="12" x2="12" y1="15" y2="3" /> </svg> );

const getCategoryChipClass = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'very_high': return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
};

const downloadForecastCSV = (magnitudes: number[], inputDepth: number, predictionDate: string) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `LSTM Forecast (Input Depth: ${inputDepth} km)\r\n`;
    csvContent += "Step,Predicted_Magnitude\r\n";
    magnitudes.forEach((mag, index) => { csvContent += `${index + 1},${mag.toFixed(3)}\r\n`; });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date(predictionDate).toISOString().split('T')[0];
    link.setAttribute("download", `forecast_${dateStr}_depth_${inputDepth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Interface and Dashboard Component ---

interface PredictionEntry {
  _id: string;
  user: string;
  input?: { latitude: number; longitude: number; depth: number; stations: number; };
  regression?: Record<string, number>;
  classification?: Record<string, string>;
  lstmInputDepth?: number;
  lstmNextMagnitude?: number;
  lstmFutureMagnitudes?: number[];
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<PredictionEntry[]>([]);
  const [username, setUsername] = useState<string>('User');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('myToken');
      try {
        const response = await fetch('http://localhost:8000/v1/predictions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) { localStorage.removeItem('myToken'); navigate('/login'); return; }
        if (!response.ok) throw new Error("Failed to fetch prediction data.");
        const result = await response.json();
        if (result.success) {
          setData(result.data.dataArray.reverse());
          setUsername(result.data.username);
        } else { throw new Error(result.message); }
      } catch (err: any) { setError(err.message || "An error occurred while fetching data.");
      } finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const handleNewPrediction = () => navigate('/predict');
  const handleNewLSTMPrediction = () => navigate('/predict-lstm');
  const handleLogout = () => { localStorage.removeItem('myToken'); navigate('/login'); };
  const toggleCardDetails = (id: string) => { setExpandedCards(prev => { const isCurrentlyOpen = !!prev[id]; return isCurrentlyOpen ? {} : { [id]: true }; }); };

  if (loading) { return <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">Loading Dashboard...</div> }
  if (error) { return <div className="bg-gray-900 min-h-screen flex items-center justify-center text-red-400 p-8 text-center">{error}</div> }

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div> <h1 className="text-3xl font-bold text-white">Dashboard</h1> <p className="text-gray-400 mt-1">Welcome back, {username}</p> </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
             <button onClick={handleNewPrediction} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors"> New Point Prediction </button>
             <button onClick={handleNewLSTMPrediction} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-500 transition-colors"> New LSTM Forecast </button>
            <button onClick={handleLogout} className="bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"> Log Out </button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {data.length > 0 ? data.map((item, index) => {
             const isLSTMPrediction = item.lstmInputDepth !== undefined;
             return (
              <div key={item._id} className={`border rounded-xl shadow-lg backdrop-blur-sm overflow-hidden flex flex-col ${isLSTMPrediction ? 'bg-teal-900/20 border-teal-700/50' : 'bg-gray-800/50 border-gray-700/50'}`}>
                <div className={`p-5 border-b ${isLSTMPrediction ? 'border-teal-700/50' : 'border-gray-700/50'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">{isLSTMPrediction ? "LSTM Forecast" : "Point Prediction"} #{data.length - index}</h3>
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  {!isLSTMPrediction && item.input && ( <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400"> <LocationIcon /> <span>{item.input.latitude.toFixed(2)}, {item.input.longitude.toFixed(2)}</span> </div> )}
                   {isLSTMPrediction && ( <p className="text-sm text-gray-400 mt-2">Input Depth: {item.lstmInputDepth} km</p> )}
                </div>

                <div className="p-5 flex-grow">
                  {!isLSTMPrediction && item.regression && item.classification && item.input && (
                    <>
                      <div className="text-center mb-4">
                        <p className="text-gray-400 text-sm mb-1">Predicted Magnitude</p>
                        <p className="text-5xl font-bold text-white">{item.regression["Voting Regressor"]?.toFixed(2) || 'N/A'}</p>
                        <p className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-2 border ${getCategoryChipClass(item.classification["Voting Classifier"])}`}>{item.classification["Voting Classifier"] || 'Unknown'} Risk</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div><p className="text-gray-400">Depth</p><p className="font-semibold text-white">{item.input.depth} km</p></div>
                        <div><p className="text-gray-400">Stations</p><p className="font-semibold text-white">{item.input.stations}</p></div>
                      </div>
                    </>
                  )}
                  {isLSTMPrediction && item.lstmNextMagnitude !== undefined && (
                     <div className="text-center mb-4">
                        <p className="text-gray-400 text-sm mb-1">Next Predicted Magnitude</p>
                        <p className="text-5xl font-bold text-white">{item.lstmNextMagnitude.toFixed(2)}</p>
                        {/* --- THE FIX IS HERE --- */}
                        {/* Display the future magnitudes */}
                        {item.lstmFutureMagnitudes && item.lstmFutureMagnitudes.length > 1 && (
                            <p className="text-xs text-gray-400 mt-3 break-words"> {/* Added break-words */}
                                Forecast Steps: {item.lstmFutureMagnitudes.map(m => m.toFixed(2)).join(', ')}
                            </p>
                        )}
                        {/* Download Button */}
                        {item.lstmFutureMagnitudes && (
                            <button
                              onClick={() => downloadForecastCSV(item.lstmFutureMagnitudes!, item.lstmInputDepth!, item.createdAt)}
                              className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                            > <DownloadIcon /> Download {item.lstmFutureMagnitudes.length}-Step Forecast </button>
                        )}
                     </div>
                  )}
                </div>

                {!isLSTMPrediction && item.regression && item.classification && (
                  <div className={`border-t ${isLSTMPrediction ? 'border-teal-700/50' : 'border-gray-700/50'}`}>
                    <button onClick={() => toggleCardDetails(item._id)} className="w-full flex justify-between items-center p-3 text-sm font-semibold text-gray-400 hover:bg-gray-700/40 transition-colors"> <span>Model Breakdown</span> <ChevronDownIcon expanded={!!expandedCards[item._id]} /> </button>
                    {expandedCards[item._id] && (
                        <div className="p-5 bg-gray-900/50 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                           <div> <h4 className="font-bold mb-2 text-white">Regression Models</h4> <ul className="space-y-1.5">{Object.entries(item.regression).map(([model, value]) => (<li key={model} className="flex justify-between"><span className="text-gray-400">{model}</span><span className="font-mono font-semibold text-white">{value?.toFixed(3) ?? 'N/A'}</span></li>))}</ul> </div>
                           <div> <h4 className="font-bold mb-2 text-white">Classification Models</h4> <ul className="space-y-1.5">{Object.entries(item.classification).map(([model, value]) => (<li key={model} className="flex justify-between"><span className="text-gray-400">{model}</span><span className={`font-semibold ${getCategoryChipClass(value).split(' ')[1]}`}>{value ?? 'N/A'}</span></li>))}</ul> </div>
                        </div>
                    )}
                  </div>
                )}
              </div>
             )
           })
           : (
             <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-gray-800/50 border border-gray-700/50 rounded-xl">
               <h3 className="text-xl font-semibold text-white">No Predictions Yet</h3>
               <p className="text-gray-400 mt-2">Click a button below to make your first prediction!</p>
               <div className="flex justify-center gap-4 mt-6">
                 <button onClick={handleNewPrediction} className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-500 transition-colors"> Make Point Prediction </button>
                 <button onClick={handleNewLSTMPrediction} className="bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-teal-500 transition-colors"> Make LSTM Forecast </button>
               </div>
             </div>
           )
          }
        </main>
        <footer className="text-center mt-12 py-4"><p className="text-gray-500 text-sm">Earthquake Prediction Dashboard</p></footer>
      </div>
    </div>
  );
}

