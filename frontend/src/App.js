import React, { useState, useEffect, useRef } from 'react';
import { getHistory } from './utils/api';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import ModelDropdown from './components/ModelDropdown';

function App() {
  const fileInputRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [copied, setCopied] = useState({});
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCitationBarOpen, setIsCitationBarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [citationData, setCitationData] = useState(null);
  const [entities, setEntities] = useState([]);
  const [useSectional, setUseSectional] = useState(false);
  const [sectionSummary, setSectionSummary] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('selectedModel') || 'Computer Science');
  const [showAlert, setShowAlert] = useState(false); // State for showing alerts
  const [alertMessage, setAlertMessage] = useState(''); // Message for alerts
  const [confirmClearHistory, setConfirmClearHistory] = useState(false); // State for confirming history clear
  const [buttonText, setButtonText] = useState('Summarize'); // State for dynamic button text
  const [intervalId, setIntervalId] = useState(null);
  const API_BASE_URL = 'http://localhost:5000';

  // Persist selected model and dark mode in localStorage
  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Fetch history when sidebar opens
  useEffect(() => {
    if (isSidebarOpen) fetchHistory();
  }, [isSidebarOpen]);

  const handleTextChange = (e) => setInputText(e.target.value);
  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let dotCount = 0;
    const id = setInterval(() => {
      dotCount = (dotCount + 1) % 4; // Cycle between 0, 1, 2, 3 dots
      setButtonText(`Summarizing${'.'.repeat(dotCount)}`);
    }, 500); // Update every 500ms
    setIntervalId(id); // Store the interval ID

    setCitationData(null); // Clear previous results
    setEntities([]);
    setResponseText('');
    setSectionSummary([]);

    const formData = new FormData();
    if (file) {
      formData.append('file', file); // File takes priority
    } else {
      formData.append('text', inputText.trim());
    }
    formData.append('model', selectedModel); // Add selected model to request

    try {
      const start = performance.now(); // Start timing
      const endpoint = useSectional ? '/sectional_summary' : '/summarize';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const end = performance.now(); // End timing
      console.log(`Summarization took ${Math.round(end - start)} ms`); // Log the time

      if (useSectional) {
        const sectionArray = Object.values(result.section_summaries || {});
        setSectionSummary(sectionArray); // Save sectional summary
        setResponseText(''); // Clear regular response
      } else {
        setResponseText(result.summary || ''); // Regular summary
        setSectionSummary([]); // Clear sectional summary
      }

      setCitationData(result.citations || null);
      setEntities(result.entities || []);
    } catch (error) {
      setAlertMessage('An error occurred while processing the request. Please try again.');
      setShowAlert(true);
    } finally {
      clearInterval(intervalId); // Clear the interval
      setButtonText('Summarize');
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index = null) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((prevCopied) => ({
        ...prevCopied,
        [index]: true,
      }));
      setTimeout(() => {
        setCopied((prevCopied) => ({
          ...prevCopied,
          [index]: false,
        }));
      }, 2000);
    });
  };

  const fetchHistory = async () => {
    try {
      const historyData = await getHistory();
      setHistory(historyData);
    } catch (error) {
      setAlertMessage('Failed to fetch history. Please try again.');
      setShowAlert(true);
    }
  };

  const truncateText = (text) => {
    if (!text) return '';
    const firstSentence = text.split(/[.!?]/)[0];
    return `${firstSentence}...`;
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/clear-history', { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      setHistory([]);
      setAlertMessage('History cleared successfully!');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Failed to clear history. Please try again.');
      setShowAlert(true);
    }
  };

  const deleteHistoryItem = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/history/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setHistory((prevHistory) => prevHistory.filter((item) => item.id !== itemId));
    } catch {
      setAlertMessage('Failed to delete item. Please try again.');
      setShowAlert(true);
    }
  };

  const handleToggleDarkMode = () => setDarkMode(!darkMode);
  const refreshPage = () => window.location.reload(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
  {/* Alert Popup */}
  {showAlert && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
        <p className="text-gray-800 dark:text-gray-200">{alertMessage}</p>
        <button
          onClick={() => setShowAlert(false)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )}
  {/* Confirm Clear History Popup */}
  {confirmClearHistory && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
        <p className="text-gray-800 dark:text-gray-200 mb-4">Are you sure you want to clear history?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setConfirmClearHistory(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearHistory();
              setConfirmClearHistory(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )}
  {/* Header */}
  <header
    className="bg-white dark:bg-gray-800 dark:text-gray-100 shadow-md border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 w-full z-50 transition-colors duration-500"
  >
    <div className="max-w-screen-xl ml-4 px-4 py-3 flex items-center">
      <h1
        className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer transition-colors duration-300"
        onClick={refreshPage}
      >
        Summarizer
      </h1>
      <ModelDropdown selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      <div className="ml-auto">
        <button
          onClick={handleToggleDarkMode}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <span className="absolute transition-all duration-500 transform scale-100 opacity-100 dark:scale-0 dark:opacity-0 rotate-0 dark:-rotate-90">
            <SunIcon className="w-6 h-6 text-yellow-500" />
          </span>
          <span className="absolute transition-all duration-500 transform scale-0 opacity-0 dark:scale-100 dark:opacity-100 rotate-90 dark:rotate-0">
            <MoonIcon className="w-6 h-6 text-indigo-300" />
          </span>
        </button>
      </div>
    </div>
  </header>
  {/* Sidebar */}
  <aside
    className={`sidebar bg-white dark:bg-gray-800 dark:text-gray-100 w-80 shadow-lg transition-transform duration-300 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } fixed top-0 left-0 h-full z-50`}
  >
    <div className="p-6 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
      <button
        onClick={() => setIsSidebarOpen(false)}
        className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white float-right transition-colors duration-300"
      >
        Close
      </button>
      <h2 className="text-xl font-bold mb-4 transition-colors duration-300">Summary History</h2>
      <button
        onClick={() => setConfirmClearHistory(true)}
        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 mb-4 transition-colors duration-300"
      >
        Clear History
      </button>
      {history.length === 0 ? (
        <p className="transition-colors duration-300">No summaries found in history.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((item, index) => (
            <li
              key={index}
              className={`relative group border dark:border-gray-700 p-4 rounded-lg transition-colors duration-300 cursor-pointer ${
                selectedHistory === item ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-50 dark:bg-gray-700'
              } hover:bg-indigo-100 dark:hover:bg-indigo-800`}
              onClick={() => {
                setInputText(item.original_text);
                if (item.section_summaries) {
                  setSectionSummary(Object.values(item.section_summaries));
                  setResponseText('');
                  setUseSectional(true);
                } else {
                  setResponseText(item.summary);
                  setSectionSummary([]);
                  setUseSectional(false);
                }
                setSelectedHistory(item);
                setCitationData(item.citations ? JSON.parse(item.citations) : []);
                setEntities(item.entities ? JSON.parse(item.entities) : []);
                setIsSidebarOpen(false);
              }}
            >
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHistoryItem(item.id);
                }}
                className="absolute top-2 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                title="Delete"
              >
                &times;
              </button>
              {/* Content */}
              <strong className="transition-colors duration-300">Original Text:</strong>{' '}
              <span className="block text-sm text-gray-700 dark:text-gray-200 line-clamp-2 transition-colors duration-300">
                {truncateText(item.original_text)}
              </span>
              <strong className="transition-colors duration-300">Summary:</strong>{' '}
              <span className="block text-sm text-gray-700 dark:text-gray-200 line-clamp-2 mt-2 transition-colors duration-300">
                {truncateText(item.summary)}
              </span>
              <small className="block text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">
                {new Date(item.timestamp).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  </aside>
  {/* Main Content */}
  <div className="main-content flex-grow p-8 mx-auto max-w-screen-sm pt-20">
    <h1 className="text-2xl font-bold mb-6 text-center transition-colors duration-300">Scientific Article Processor</h1>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Textarea */}
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-300">
          Enter Article Text
        </label>
        <textarea
          id="text"
          value={inputText}
          onChange={handleTextChange}
          rows="5"
          placeholder="Paste article text here..."
          disabled={!!file}
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm ${
            file ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'
          } text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 sm:text-sm resize-none scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 transition-colors duration-300`}
        ></textarea>
      </div>
      {/* File Upload */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-300">
          Or Upload a PDF File
        </label>
        <div className="flex items-center gap-4 mt-1">
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={loading}
            ref={fileInputRef}
            className="block flex-1 text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-800 transition-colors duration-300"
          />
          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-sm text-red-600 dark:text-red-400 bg-transparent hover:underline transition-colors duration-300"
            >
              Clear File
            </button>
          )}
        </div>
      </div>
      {/* Toggle Sectional Summary */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="sectional"
          checked={useSectional}
          onChange={() => setUseSectional(!useSectional)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-colors duration-300"
        />
        <label htmlFor="sectional" className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-300">
          Use Sectional Summary
        </label>
      </div>
      {/* Submit */}
      <button
            type="submit"
            disabled={loading || (!inputText.trim() && !file)}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              loading 
                ? 'bg-green-600 hover:bg-green-600 text-white'
                : !inputText.trim() && !file
                ? 'bg-gray-400'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? buttonText : 'Summarize'}
          </button>
    </form>
    {/* Response */}
    {(responseText || sectionSummary.length > 0) && (
      <div className="response-section mt-6">
        <h2 className="text-xl font-bold mb-2 transition-colors duration-300">Processed Text</h2>
        {/* Regular Summary */}
        {responseText && (
          <div className="relative">
            <textarea
              readOnly
              value={responseText}
              rows="5"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 sm:text-sm resize-none scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 transition-colors duration-300"
            ></textarea>
            <button
              onClick={() => copyToClipboard(responseText, 0)}
              className="absolute top-2 right-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              {copied[0] ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        {/* Sectional Summary */}
        {sectionSummary.length > 0 && (
          <div className="space-y-4">
            {sectionSummary.map((section, index) => (
              <div key={index} className="border border-gray-300 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800 relative transition-colors duration-300">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-300">Section {index + 1}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line transition-colors duration-300">{section}</p>
                <button
                  onClick={() => copyToClipboard(section, index)}
                  className="absolute top-2 right-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm opacity-50 hover:opacity-100 transition-opacity duration-300"
                >
                  {copied[index] ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
  {/* Citation Analysis */}
  {citationData && (
    <aside
          className={`citation-analysis fixed top-14 right-0 h-[calc(100%-2rem)] w-80 bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto p-6 transition-color duration-300 ${
            isCitationBarOpen ? 'open' : ''
          }`}
        >
          <button
            onClick={() => setIsCitationBarOpen(false)}
            className="close-button text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white float-right"
          >
            Close
          </button>
      <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400 transition-colors duration-300">Citation Analysis</h2>
      <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <div>
          <p><span className="font-semibold transition-colors duration-300">Total References:</span> {citationData.total_references}</p>
          <p><span className="font-semibold transition-colors duration-300">Total Author Citations:</span> {citationData.total_author_citations}</p>
        </div>
        <div>
          <h3 className="font-semibold text-indigo-500 dark:text-indigo-300 mb-2 transition-colors duration-300">Top References</h3>
          <ul className="list-disc list-inside space-y-1">
            {citationData.references.slice(0, 5).map((ref, index) => (
              <li key={index}>
                <span className="text-gray-700 dark:text-gray-200 transition-colors duration-300">{ref.Reference}</span>{' '}
                <span className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">({ref.Frequency})</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-indigo-500 dark:text-indigo-300 mb-2 transition-colors duration-300">Top Author Citations</h3>
          <ul className="list-disc list-inside space-y-1">
            {citationData.author_citations.slice(0, 5).map((auth, index) => (
              <li key={index}>
                <span className="text-gray-700 dark:text-gray-200 transition-colors duration-300">{auth['Author Citation']}</span>{' '}
                <span className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">({auth.Frequency})</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Extracted Key Terms */}
        {entities && entities.length > 0 && (
          <div className="border-t border-gray-300 dark:border-gray-700 pt-4 transition-colors duration-300">
            <h3 className="font-semibold text-indigo-500 dark:text-indigo-300 mb-2 transition-colors duration-300">Key Terms</h3>
            <ul className="flex flex-wrap gap-2 mb-3">
              {entities.map((entity, index) => (
                <li
                  key={index}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-800 dark:text-gray-100 transition-colors duration-300"
                >
                  {entity.term}{' '}
                  <span className="text-gray-500 dark:text-gray-400 text-[10px] transition-colors duration-300">({entity.type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )}
  {/* Sidebar Toggle */}
  <button
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    className="fixed flex bottom-4 left-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 z-50 transition-colors duration-300"
  >
    {isSidebarOpen ? 'Close History' : 'View History'}
  </button>
  {/* Handle Button for Citation Bar */}
      {citationData && (
        <div
          className={`handle-button ${isCitationBarOpen ? 'hidden' : ''}`}
          onClick={() => setIsCitationBarOpen(!isCitationBarOpen)}
        ></div>
      )}
</div>
  );
}

export default App;