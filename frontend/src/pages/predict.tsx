import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './predict.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import default styles

interface PredictionResponse {
  success: boolean;
  data: any; // Adjust type as needed based on your backend's success response
  message: string;
}

export default function Predict() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (latitude === null || longitude === null || !selectedDate) {
      setError('Please fill in all the fields.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('myToken');
      const response = await fetch('http://localhost:4000/api/predict', { // Replace with your actual API URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include token if needed
        },
        body: JSON.stringify({
          latitude,
          longitude,
          predictionDate: selectedDate ? selectedDate.toISOString() : null, // Handle potential null date
        }),
      });

      const data: PredictionResponse = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message);
        // Optionally redirect or clear the form
        // navigate('/dashboard');
      } else {
        setError(data.message || 'Failed to get prediction.');
      }
    } catch (error: any) {
      console.error('Error predicting:', error);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predict-container">
      <form className="predict-form" onSubmit={handleSubmit}>
        <h2 className="predict-title">Get Prediction</h2>

        <div className="form-group">
          <label htmlFor="latitude">Latitude:</label>
          <input
            type="number"
            id="latitude"
            value={latitude === null ? '' : latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            placeholder="Enter latitude"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude:</label>
          <input
            type="number"
            id="longitude"
            value={longitude === null ? '' : longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            placeholder="Enter longitude"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="predictionDate">Prediction Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange} // Use the updated handler
            dateFormat="dd-MM-yyyy"
            className="custom-datepicker-input"
            placeholderText="Select a date"
          />
        </div>

        <button type="submit" className="predict-button" disabled={loading}>
          {loading ? (
            <div className="loading-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            'Predict'
          )}
        </button>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </div>
  );
}