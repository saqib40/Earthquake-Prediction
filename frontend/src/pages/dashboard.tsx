import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

interface DataEntry {
  _id: string; // Assuming MongoDB's ObjectId as string for simplicity
  latitude: number;
  longitude: number;
  predictionDate: Date;
  predictionResult: string;
  createdAt: Date;
  user: string; // ObjectId as string
}

interface ApiResponse {
    success: boolean;
    data: {
      dataArray: DataEntry[];
      username: string;
    };
    message: string;
  }

const initialData: DataEntry[] = [
  { _id: '1', latitude: 12.9716, longitude: 77.5946, predictionDate: new Date('2025-05-08T10:00:00Z'), predictionResult: 'Clear', createdAt: new Date(), user: 'user1' },
  { _id: '2', latitude: 28.6139, longitude: 77.2090, predictionDate: new Date('2025-05-09T12:30:00Z'), predictionResult: 'Cloudy', createdAt: new Date(), user: 'user1' },
  { _id: '3', latitude: 34.0522, longitude: -118.2437, predictionDate: new Date('2025-05-10T15:45:00Z'), predictionResult: 'Rainy', createdAt: new Date(), user: 'user1' },
  { _id: '4', latitude: 40.7128, longitude: -74.0060, predictionDate: new Date('2025-05-11T08:00:00Z'), predictionResult: 'Sunny', createdAt: new Date(), user: 'user1' },
  { _id: '5', latitude: 51.5074, longitude: 0.1278, predictionDate: new Date('2025-05-12T18:20:00Z'), predictionResult: 'Foggy', createdAt: new Date(), user: 'user1' },
];

const CustomButton: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button className="custom-button" onClick={onClick}>
    {children}
  </button>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // this is something we do in login page1
  const [data, setData] = useState<DataEntry[]>(initialData); // Using placeholder data
  const [username, setUsername] = useState<string>('Test User');

  useEffect(() => {
    setIsAuthenticated(true);

    // In a real application, you would fetch data here:
    // async function fetchData() {
    //   try {
    //     const response = await fetch('/api/getEverything'); // Your API endpoint
    //     if (response.ok) {
    //       const result = await response.json();
    //       setData(result.data);
    //     } else {
    //       console.error('Failed to fetch data');
    //     }
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // }
    // if (isAuthenticated) {
    //   fetchData();
    // }
  }, [isAuthenticated]);

  const handleAddMore = () => {
    navigate('/create'); // Replace '/create' with your actual add data route
  };

  const handleLogout = () => {
    localStorage.removeItem('myToken');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="no-auth-container">
        <p className="no-auth-text">
          You aren't authorized to access this route. Please login.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="header-section">
        <h2 className="dashboard-title">{username}</h2>
        <div className="button-group">
          <CustomButton onClick={handleAddMore}>Add More Data</CustomButton>
          <CustomButton onClick={handleLogout}>Log Out</CustomButton>
        </div>
      </div>

      <div className="data-list">
        {data.map((item) => (
          <div className="data-card" key={item._id}>
            <h6 className="data-title">Prediction {_idCounter++}</h6>
            <p className="data-item"><strong>Latitude:</strong> {item.latitude}</p>
            <p className="data-item"><strong>Longitude:</strong> {item.longitude}</p>
            <p className="data-item"><strong>Prediction Date:</strong> {new Date(item.predictionDate).toLocaleDateString()} {new Date(item.predictionDate).toLocaleTimeString()}</p>
            <p className="data-item"><strong>Prediction Result:</strong> {item.predictionResult}</p>
            <p className="data-item"><strong>Created At:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="footer-section">
        <p className="footer-text">
          Displaying your valuable data
        </p>
      </div>
    </div>
  );
}

let _idCounter = 1;