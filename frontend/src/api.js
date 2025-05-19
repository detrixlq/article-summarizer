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

export const getCitations = async (formData) => {
  const response = await fetch('http://localhost:5000/citations', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Citation analysis failed');
  }

  return await response.json();
};

export const extractEntities = async (text) => {
  try {
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json(); // Expecting an array of { term, type }
  } catch (error) {
    console.error("Error extracting entities:", error);
    return [];
  }
};
