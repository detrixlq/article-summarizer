const API_BASE_URL = 'http://localhost:5000';

/**
 * Summarizes text or file based on the provided form data.
 * @param {FormData} formData - The form data containing text/file and model selection.
 * @param {boolean} useSectional - Whether to generate a sectional summary.
 * @returns {Promise<string|Object>} - The summary (string for regular, object for sectional).
 */
export const summarizeText = async (formData, useSectional) => {
  try {
    const endpoint = useSectional ? '/sectional_summary' : '/summarize';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    // Return the appropriate summary based on the mode
    return result;
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};

/**
 * Fetches the history of summaries from the backend.
 * @returns {Promise<Array>} - An array of history items.
 */
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

/**
 * Analyzes citations from the provided form data.
 * @param {FormData} formData - The form data containing text/file.
 * @returns {Promise<Object>} - The citation analysis results.
 */
export const getCitations = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/citations`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Citation analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing citations:', error);
    throw error;
  }
};

/**
 * Extracts named entities from the provided text.
 * @param {string} text - The input text to analyze.
 * @returns {Promise<Array>} - An array of entities with `term` and `type`.
 */
export const extractEntities = async (text) => {
  try {
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json(); // Expecting an array of { term, type }
  } catch (error) {
    console.error('Error extracting entities:', error);
    return [];
  }
};