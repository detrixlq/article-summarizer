// App.js

import React, { useState, useEffect } from 'react';
import { summarizeText, getHistory } from './api'; // Import API functions

function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
  const [history, setHistory] = useState([]); // State for storing history
  const [selectedHistory, setSelectedHistory] = useState(null); // Tracks the selected history item

  // Fetch history when the sidebar is opened
  useEffect(() => {
    if (isSidebarOpen) {
      fetchHistory();
    }
  }, [isSidebarOpen]);

  // Handle text input change
  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  // Submit form to process text or file
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data for API request
    const formData = new FormData();
    if (inputText.trim()) {
      formData.append('text', inputText);
    } else if (file) {
      formData.append('file', file);
    }

    try {
      // Call the API function
      const summary = await summarizeText(formData);
      setResponseText(summary); // Set the response text
    } catch (error) {
      alert('An error occurred while processing the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy response text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(responseText).then(() => {
      alert('Text copied to clipboard!');
    });
  };

  // Fetch history from the backend
  const fetchHistory = async () => {
    try {
      const historyData = await getHistory();
      setHistory(historyData);
    } catch (error) {
      alert('Failed to fetch history. Please try again.');
    }
  };

  // Truncate text to the first sentence and add ellipsis
  const truncateText = (text) => {
    if (!text) return '';
    const firstSentence = text.split(/[.!?]/)[0]; // Extract the first sentence
    return `${firstSentence}...`; // Add ellipsis
  };

  // Function to clear history
const clearHistory = async () => {
  try {
    const response = await fetch('http://localhost:5000/clear-history', {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Clear the history state locally
    setHistory([]);
    alert('History cleared successfully!');
  } catch (error) {
    console.error('Error clearing history:', error);
    alert('Failed to clear history. Please try again.');
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white w-80 shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 h-full z-50`}
      >
        <div className="p-6 overflow-y-auto max-h-screen">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700 float-right"
          >
            Close
          </button>
          <h2 className="text-xl font-bold mb-4">Summary History</h2>

{/* Clear History Button */}
<button
  onClick={clearHistory}
  className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 mb-4"
>
  Clear History
</button>
          {history.length === 0 ? (
            <p>No summaries found in history.</p>
          ) : (
            
            <ul className="space-y-4">
            {history.map((item, index) => (
              <li
                key={index}
                className={`border p-4 rounded-lg ${
                  selectedHistory === item ? 'bg-indigo-100' : 'bg-gray-50'
                } hover:bg-indigo-100 cursor-pointer transition-colors`}
                onClick={() => {
                  setInputText(item.original_text); // Populate the original text box
                  setResponseText(item.summary); // Populate the summary box
                  setSelectedHistory(item); // Highlight the selected item
                  setIsSidebarOpen(false); // Close the sidebar after selection
                }}
              >
                <strong>Original Text:</strong>{' '}
                <span className="block text-sm text-gray-700 line-clamp-2">
                  {truncateText(item.original_text)}
                </span>
                <strong>Summary:</strong>{' '}
                <span className="block text-sm text-gray-700 line-clamp-2 mt-2">
                  {truncateText(item.summary)}
                </span>
                <small className="block text-gray-500 mt-2">
                  {new Date(item.timestamp).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow p-8 mx-auto max-w-screen-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Scientific Article Processor</h1>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Input */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">
              Enter Article Text
            </label>
            <textarea
              id="text"
              value={inputText}
              onChange={handleTextChange}
              rows="5"
              placeholder="Paste article text here..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Or Upload a File (.docx, .pdf)
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".docx,.pdf"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Processing...' : 'Process Text'}
          </button>
        </form>

        {/* Response Display */}
        {responseText && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Processed Text</h2>
            <div className="relative">
              <textarea
                readOnly
                value={responseText}
                rows="5"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
              <button
  onClick={copyToClipboard}
  className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm opacity-50 hover:opacity-100 transition-opacity duration-300"
>
  Copy
</button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-4 left-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 z-50"
      >
        {isSidebarOpen ? 'Close History' : 'View History'}
      </button>
    </div>
  );
}

export default App;