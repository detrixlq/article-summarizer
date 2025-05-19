// components/Sidebar.jsx
import React from 'react';

const Sidebar = ({ isOpen, onClose, history, clearHistory, truncateText, onSelectHistory, selectedHistory }) => {
  return (
    <div className={`fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-800 shadow transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold text-lg">History</h2>
        <button onClick={onClose} className="text-sm text-red-500">Close</button>
      </div>
      <div className="overflow-y-auto h-full p-4">
        <button onClick={clearHistory} className="mb-4 text-sm text-red-600 dark:text-red-400">Clear History</button>
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded cursor-pointer ${selectedHistory === item ? 'bg-blue-200 dark:bg-blue-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            onClick={() => onSelectHistory(item)}
          >
            {truncateText(item.original_text)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;