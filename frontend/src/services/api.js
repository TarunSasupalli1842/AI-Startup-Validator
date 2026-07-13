import axios from 'axios';

// Connect to local FastAPI server on port 8000 by default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // Large timeout since live web searches & agent syntheses can take time
});

/**
 * Sends a startup idea payload to the FastAPI orchestrator pipeline.
 * @param {object} startupData 
 * @returns {Promise<object>} The validation report JSON
 */
export const validateStartupIdea = async (startupData) => {
  try {
    const response = await api.post('/validate', startupData);
    return response.data;
  } catch (error) {
    console.error("API error during validation query:", error);
    throw error;
  }
};

export default api;
