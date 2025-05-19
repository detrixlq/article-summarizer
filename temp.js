// App.js

import React, { useState, useEffect } from 'react';
import { summarizeText, getCitations, getHistory } from './api'; // Import API functions
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import ModelDropdown from "./components/ModelDropdown";


function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
  const [history, setHistory] = useState([]); // State for storing history
  const [selectedHistory, setSelectedHistory] = useState(null); // Tracks the selected history item
  const [citationData, setCitationData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [themeTarget, setThemeTarget] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [selectedModel, setSelectedModel] = useState("Computer Science");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode); // <- Save preference
  }, [darkMode]);

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
    setCitationData(null); // Clear previous results

    const formData = new FormData();
    if (inputText.trim()) {
      formData.append('text', inputText);
    } else if (file) {
      formData.append('file', file);
    }

    try {
      const [summary, citations] = await Promise.all([
        summarizeText(formData),
        getCitations(formData),
      ]);

      setResponseText(summary);
      setCitationData(citations);
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

  const handleToggleDarkMode = (e) => {
    const button = e.currentTarget.getBoundingClientRect();
    const center = {
      x: button.left + button.width / 2,
      y: button.top + button.height / 2,
    };
    setThemeTarget(center);
    setIsTransitioning(true);

    setTimeout(() => {
      setDarkMode(!darkMode);
    }, 50); // Slight delay before theme switch

    setTimeout(() => {
      setIsTransitioning(false);
    }, 700); // Duration matches animation
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 z-50 fixed top-0 left-0 w-full">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Summarizer</h1>
          
          <ModelDropdown
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

          <button
            onClick={handleToggleDarkMode}
            className="relative w-10 h-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-50"
          >
            <span className="absolute transition-all duration-500 transform scale-100 opacity-100 dark:scale-0 dark:opacity-0 rotate-0 dark:-rotate-90">
              <SunIcon className="w-6 h-6 text-yellow-500" />
            </span>
            <span className="absolute transition-all duration-500 transform scale-0 opacity-0 dark:scale-100 dark:opacity-100 rotate-90 dark:rotate-0">
              <MoonIcon className="w-6 h-6 text-indigo-300" />
            </span>
          </button>
        </div>
      </header>

      {isTransitioning && (
        <div
          className={`fixed inset-0 z-40 pointer-events-none transition-transform duration-700 ease-in-out`}
          style={{
            clipPath: `circle(0% at ${themeTarget?.x}px ${themeTarget?.y}px)`,
            backgroundColor: darkMode ? '#f9fafb' : '#111827',
            animation: `${darkMode ? 'collapseToCenter' : 'expandFromCenter'} 0.7s ease-in-out forwards`,
          }}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`bg-white dark:bg-gray-800 dark:text-gray-100 w-80 shadow-lg transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0 h-full z-50`}>
        <div className="p-6 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white float-right"
          >
            Close
          </button>
          <h2 className="text-xl font-bold mb-4">Summary History</h2>
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
                  className={`border dark:border-gray-700 p-4 rounded-lg ${selectedHistory === item ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-indigo-100 dark:hover:bg-indigo-800 cursor-pointer transition-colors`}
                  onClick={() => {
                    setInputText(item.original_text);
                    setResponseText(item.summary);
                    setSelectedHistory(item);
                    setCitationData(item.citations ? JSON.parse(item.citations) : []);
                    setIsSidebarOpen(false);
                  }}
                >
                  <strong>Original Text:</strong>{' '}
                  <span className="block text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                    {truncateText(item.original_text)}
                  </span>
                  <strong>Summary:</strong>{' '}
                  <span className="block text-sm text-gray-700 dark:text-gray-200 line-clamp-2 mt-2">
                    {truncateText(item.summary)}
                  </span>
                  <small className="block text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(item.timestamp).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow p-8 mx-auto max-w-screen-sm pt-20 h-[calc(100vh-2rem)] ">
        <h1 className="text-2xl font-bold mb-6 text-center">Scientific Article Processor</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Textarea */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Enter Article Text
            </label>
            <textarea
              id="text"
              value={inputText}
              onChange={handleTextChange}
              rows="5"
              placeholder="Paste article text here..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
            ></textarea>
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Or Upload a File (.docx, .pdf)
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".docx,.pdf"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-800"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Processing...' : 'Process Text'}
          </button>
        </form>

        {/* Response */}
        {responseText && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Processed Text</h2>
            <div className="relative">
              <textarea
                readOnly
                value={responseText}
                rows="5"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
              ></textarea>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm opacity-50 hover:opacity-100 transition-opacity duration-300 "
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Citation Sidebar */}
      {citationData && (
        <aside
          className="fixed top-14 right-0 h-[calc(100%-2rem)] w-80 bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Citation Analysis</h2>
          <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
            <div>
              <p><span className="font-semibold">Total References:</span> {citationData.total_references}</p>
              <p><span className="font-semibold">Total Author Citations:</span> {citationData.total_author_citations}</p>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-500 dark:text-indigo-300 mb-2">Top References</h3>
              <ul className="list-disc list-inside space-y-1">
                {citationData.references.slice(0, 5).map((ref, index) => (
                  <li key={index}>
                    <span className="text-gray-700 dark:text-gray-200">{ref.Reference}</span>{' '}
                    <span className="text-gray-500 dark:text-gray-400 text-xs">({ref.Frequency})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-500 dark:text-indigo-300 mb-2">Top Author Citations</h3>
              <ul className="list-disc list-inside space-y-1">
                {citationData.author_citations.slice(0, 5).map((auth, index) => (
                  <li key={index}>
                    <span className="text-gray-700 dark:text-gray-200">{auth['Author Citation']}</span>{' '}
                    <span className="text-gray-500 dark:text-gray-400 text-xs">({auth.Frequency})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      )}

      {/* Sidebar Toggle */}
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
