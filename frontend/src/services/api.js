import axios from 'axios';

// Connect to local FastAPI server on port 8000 by default or relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2-minute timeout for multi-agent pipeline executions
});

/**
 * Sends a startup idea payload to the FastAPI orchestrator pipeline.
 * @param {object} startupData 
 * @returns {Promise<object>} The comprehensive validation report JSON
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

/**
 * Communicates with the Conversational Startup Advisor agent.
 * @param {string} message - The founder's question
 * @param {Array} history - Previous chat messages
 * @param {object} reportContext - Validation report context
 * @returns {Promise<object>} { reply: string, suggested_followups: Array<string> }
 */
export const chatWithAdvisor = async (message, history = [], reportContext = null) => {
  try {
    const response = await api.post('/advisor/chat', {
      message,
      history,
      report_context: reportContext
    });
    return response.data;
  } catch (error) {
    console.error("API error during advisor chat:", error);
    throw error;
  }
};

/**
 * Standalone specialized agent runners (optional direct triggers)
 */
export const runSwotAnalysis = async (startupData) => {
  const response = await api.post('/agents/swot', startupData);
  return response.data;
};

export const runRiskAnalysis = async (startupData) => {
  const response = await api.post('/agents/risk', startupData);
  return response.data;
};

export const runMvpAnalysis = async (startupData) => {
  const response = await api.post('/agents/mvp', startupData);
  return response.data;
};

export const runGtmAnalysis = async (startupData) => {
  const response = await api.post('/agents/gtm', startupData);
  return response.data;
};

export default api;
