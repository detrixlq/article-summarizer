// api.js

const API_BASE_URL = 'http://localhost:5000';

export const summarizeText = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.summary;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};

export const getHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result.history || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};