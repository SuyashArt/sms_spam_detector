import React, { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

const App = () => {
  const [sms, setsms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!sms.trim()) {
      setError('Please enter an sms to proceed.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await axios.post(`${API_URL}/api/predict`, {
        sms: sms.trim()
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setPrediction(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.message ||
        'An error occurred while processing your request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [sms]);

  const getConfidenceColor = useCallback((confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800'} flex items-center justify-center p-4`}>
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-8 rounded-xl shadow-2xl w-full max-w-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">
            📧 SMS Spam Detector
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} hover:bg-gray-300 transition-colors duration-300`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <label htmlFor="sms-input" className={`block text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 text-center`}>
              Enter an SMS to check if it's spam or not.
            </label>
            <textarea
              id="sms-input"
              value={sms}
              onChange={(e) => setsms(e.target.value)}
              placeholder="Paste your sms here..."
              className={`w-full p-4 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
              rows="5"
              aria-label="sms content"
            />
          </div>

          <button
            type="submit"
            disabled={!sms.trim() || isLoading}
            className={`w-full bg-blue-600 text-white py-3 rounded-xl 
              hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105
              disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center justify-center font-semibold text-lg`}
            aria-label={isLoading ? 'Analyzing sms' : 'Check sms'}
          >
            {isLoading && (
              <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoading ? 'Analyzing...' : 'Check SMS'}
          </button>
        </form>

        {error && (
          <div className={`mt-6 p-4 ${isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-600'} border rounded-xl text-center text-sm`} role="alert">
            ⚠️ {error}
          </div>
        )}

        {prediction && (
          <div className={`mt-8 ${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl p-6 text-center`}>
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} mb-4`}>Prediction Result</h2>
            <p className={`text-xl font-bold ${prediction.prediction === 'Spam' ? 'text-red-600' : 'text-green-600'}`}>
              {prediction.prediction}
            </p>
            <div className="mt-4">
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;